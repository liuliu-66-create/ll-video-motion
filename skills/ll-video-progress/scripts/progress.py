"""Subtitle-synchronized chapter overlay. Python + Pillow + ffmpeg/ffprobe."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

SKILL = Path(__file__).resolve().parent.parent


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def clock_seconds(value):
    h, m, s, ms = map(int, re.split('[:,.]', value))
    if m > 59 or s > 59:
        raise ValueError('Invalid subtitle timestamp: ' + value)
    return h * 3600 + m * 60 + s + ms / 1000


def read_srt(path):
    text = Path(path).read_text(encoding='utf-8-sig').strip()
    cues = []
    ids = set()
    for block in re.split(r'\r?\n\s*\r?\n', text):
        lines = block.splitlines()
        if len(lines) < 3 or not lines[0].isdigit():
            raise ValueError('Invalid SRT block: ' + block[:80])
        match = re.fullmatch(r'(\d{2,}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2,}:\d{2}:\d{2}[,.]\d{3})(?:\s+.*)?', lines[1])
        if not match:
            raise ValueError('Invalid SRT time range: ' + lines[1])
        cue = dict(id=int(lines[0]), start=clock_seconds(match[1]), end=clock_seconds(match[2]), text=''.join(lines[2:]).strip())
        if cue['id'] in ids or not cue['text'] or cue['end'] <= cue['start']:
            raise ValueError('Duplicate ID, empty text or non-positive subtitle duration')
        if cues and (cue['start'] < cues[-1]['start'] or cue['end'] < cues[-1]['end']):
            raise ValueError('SRT cues must be in chronological order')
        cues.append(cue)
        ids.add(cue['id'])
    if not cues:
        raise ValueError('Empty subtitles')
    return cues


def integer(value, name, low, high):
    if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
        raise ValueError(f'{name} must be an integer in {low}..{high}')
    return value


def opacity(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 1:
        raise ValueError('Opacity must be a finite number in 0..1')
    return value


def color(value):
    if not isinstance(value, list) or len(value) != 3:
        raise ValueError('Color must be an RGB array')
    return tuple(integer(x, 'RGB channel', 0, 255) for x in value)


def load_plan(config_path):
    path = Path(config_path).resolve()
    cfg = read_json(path)
    source = (path.parent / cfg['sourceSrt']).resolve()
    cues = read_srt(source)
    styles = read_json(SKILL / 'assets/progress/styles.json')['styles']
    selected = [s for s in styles if s['id'] == cfg.get('styleId', 'soft-white-green') and s['status'] == 'validated']
    if len(selected) != 1:
        raise ValueError('Select a validated progress style using --list-styles')
    style = dict(selected[0])
    allowed = {'baseColor', 'baseOpacity', 'fillColor', 'fillOpacity', 'textColor', 'outlineColor', 'previewBackground'}
    overrides = cfg.get('appearance', {})
    if set(overrides) - allowed:
        raise ValueError('Unknown appearance fields: ' + ', '.join(set(overrides) - allowed))
    style.update(overrides)
    for field in ['baseColor', 'fillColor', 'textColor', 'outlineColor']:
        style[field] = color(style[field])
    for field in ['baseOpacity', 'fillOpacity']:
        style[field] = opacity(style[field])
    w = integer(cfg.get('width', style['defaultWidth']), 'width', 320, 7680)
    h = integer(cfg.get('barHeight', style['defaultBarHeight']), 'barHeight', 32, 400)
    canvas = integer(cfg.get('canvasHeight', style['defaultCanvasHeight']), 'canvasHeight', h, 7680)
    fps = integer(cfg.get('fps', 30), 'fps', 1, 120)
    chapters = cfg['chapters']
    if not 1 <= len(chapters) <= 5:
        raise ValueError('Use 1..5 chapters')
    id_to_index = {cue['id']: i for i, cue in enumerate(cues)}
    resolved = []
    next_index = 0
    for ch in chapters:
        title = ch['title']
        if not isinstance(title, str) or not title.strip() or '\n' in title or '\r' in title:
            raise ValueError('Chapter title must be a non-empty single line')
        first, last = id_to_index[ch['startCue']], id_to_index[ch['endCue']]
        if first != next_index or last < first:
            raise ValueError('Chapter cue ranges must cover every subtitle exactly once, in order')
        for key, index in [('startText', first), ('endText', last)]:
            if key in ch and ch[key] != cues[index]['text']:
                raise ValueError(f'{key} does not match subtitle cue {cues[index]["id"]}')
        resolved.append(dict(title=title, startCue=ch['startCue'], endCue=ch['endCue'], fromText=cues[first]['text'], toText=cues[last]['text'], startTime=0 if first == 0 else cues[first]['start']))
        next_index = last + 1
    if next_index != len(cues):
        raise ValueError('Chapters do not cover the ending subtitles')
    duration = cfg.get('duration', cues[-1]['end'])
    if not isinstance(duration, (int, float)) or isinstance(duration, bool) or not math.isfinite(duration) or duration < cues[-1]['end']:
        raise ValueError('duration must be finite and cover the final subtitle')
    total = math.ceil(duration * fps - 1e-7)
    for i, ch in enumerate(resolved):
        ch['startFrame'] = round(ch['startTime'] * fps)
        ch['endFrameExclusive'] = round(resolved[i+1]['startTime'] * fps) if i+1 < len(resolved) else total
        if ch['endFrameExclusive'] <= ch['startFrame']:
            raise ValueError('Chapter duration is shorter than one frame')
        ch['left'] = round(i * w / len(resolved))
        ch['right'] = round((i+1) * w / len(resolved))
    default_font = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts/msyhbd.ttc'
    font_path = (path.parent / cfg['fontPath']).resolve() if cfg.get('fontPath') else default_font
    if not font_path.is_file():
        raise ValueError('Chinese font missing; set fontPath to a Chinese bold font')
    font_size = integer(cfg.get('fontSize', round(h * style['fontSizeRatio'])), 'fontSize', 12, h)
    font = ImageFont.truetype(str(font_path), font_size)
    stroke = max(1, round(h / 32))
    for ch in resolved:
        box = font.getbbox(ch['title'], stroke_width=stroke)
        if box[2] - box[0] > ch['right'] - ch['left'] - 24 or box[3] - box[1] > h - 8:
            raise ValueError('Title does not fit: ' + ch['title'] + '; shorten it or adjust fontSize/barHeight')
    plan = dict(styleId=style['id'], sourceSrt=str(source), sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), width=w, barHeight=h, canvasHeight=canvas, fps=fps, totalFrames=total, duration=total/fps, chapters=resolved, appearance=style, fontPath=str(font_path), fontSize=font_size)
    walking = bool(style.get('character'))
    plan['outputHeight'] = h + h//2 if walking else h
    if walking:
        frames = cfg.get('characterFrames')
        if frames is None:
            frames = [str(SKILL/'assets/characters/liuliu'/f'walk-{i:02d}.png') for i in range(1,9)]
        if not isinstance(frames,list) or not 4 <= len(frames) <= 32:
            raise ValueError('characterFrames requires 4..32 consecutive transparent walk poses')
        plan['characterFrames'] = [str((path.parent / f).resolve()) for f in frames]
        plan['walkFps'] = integer(cfg.get('walkFps',10),'walkFps',1,30)
    elif cfg.get('characterFrames'):
        raise ValueError('Choose the walking-leading style to replace a character')
    if style.get('renderer') == 'chapter-lines':
        from chapter_styles import ChapterPainter
        ChapterPainter(plan)
    return plan


class BasePainter:
    def __init__(self, plan):
        self.p = plan
        w, h = plan['width'], plan['barHeight']
        s = plan['appearance']
        self.base = Image.new('RGBA', (w, h))
        d = ImageDraw.Draw(self.base)
        for y in range(h):
            ratio = s['edgeOpacityRatio'] + (1-s['edgeOpacityRatio']) * min(1, min(y, h-1-y) / max(1, h*.15625))
            d.line((0, y, w, y), fill=(*s['baseColor'], round(255*s['baseOpacity']*ratio)))
        self.labels = Image.new('RGBA', (w, h))
        d = ImageDraw.Draw(self.labels)
        font = ImageFont.truetype(plan['fontPath'], plan['fontSize'])
        for ch in plan['chapters']:
            x = (ch['left'] + ch['right']) / 2
            d.text((x+1, h/2+1), ch['title'], font=font, anchor='mm', fill=(30,33,37,170), stroke_width=max(1,round(h/32)), stroke_fill=(30,33,37,170))
            d.text((x, h/2-1), ch['title'], font=font, anchor='mm', fill=(*s['textColor'],255), stroke_width=1, stroke_fill=(*s['outlineColor'],210))
        for ch in plan['chapters'][1:]:
            x = ch['left']
            d.line((x+1,round(h*.1875),x+1,round(h*.8125)), fill=(40,43,47,110), width=2)
            d.line((x,round(h*.171875),x,round(h*.796875)), fill=(255,255,255,235), width=2)

    def frame(self, n):
        im = self.base.copy()
        d = ImageDraw.Draw(im)
        s = self.p['appearance']
        for ch in self.p['chapters']:
            progress = max(0,min(1,(n-ch['startFrame'])/max(1,ch['endFrameExclusive']-ch['startFrame']-1)))
            width = round(progress*(ch['right']-ch['left']))
            if width:
                d.rectangle((ch['left'],0,ch['left']+width-1,self.p['barHeight']-1),fill=(*s['fillColor'],round(255*s['fillOpacity'])))
        return Image.alpha_composite(im,self.labels)


class Painter:
    def __new__(cls,plan):
        if plan['appearance'].get('renderer') == 'chapter-lines':
            from chapter_styles import ChapterPainter
            return ChapterPainter(plan)
        return super().__new__(cls)

    def __init__(self,plan):
        self.p = plan
        self.base = BasePainter(plan)
        self.sprites = []
        if plan.get('characterFrames'):
            images = []
            for file in plan['characterFrames']:
                im=Image.open(file).convert('RGBA')
                alpha=im.getchannel('A')
                box=alpha.point(lambda x:255 if x>24 else 0).getbbox()
                if not box or alpha.getextrema()[0]!=0:
                    raise ValueError('Character frames must have transparent backgrounds and visible subjects')
                images.append(im.crop(box))
            factor=plan['barHeight']/max(im.height for im in images)
            self.sprites=[im.resize((max(1,round(im.width*factor)),max(1,round(im.height*factor))),Image.Resampling.LANCZOS) for im in images]
            if any(im.width>plan['width'] for im in self.sprites):
                raise ValueError('Character is wider than the strip')
        self.last_character_box = None

    def frame(self,n):
        if not self.sprites:
            return self.base.frame(n)
        p=self.p
        im=Image.new('RGBA',(p['width'],p['outputHeight']))
        im.alpha_composite(self.base.frame(n))
        front=0
        for ch in p['chapters']:
            t=max(0,min(1,(n-ch['startFrame'])/max(1,ch['endFrameExclusive']-ch['startFrame']-1)))
            front+=round(t*(ch['right']-ch['left']))
        sprite=self.sprites[int(n/p['fps']*p['walkFps'])%len(self.sprites)]
        x=max(0,min(p['width']-sprite.width,round(front-sprite.width*.4)))
        y=p['outputHeight']-sprite.height
        self.last_character_box=(x,y,x+sprite.width,y+sprite.height)
        im.alpha_composite(sprite,(x,y))
        return im


def run(args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout


from export_progress import preview, render


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--list-styles',action='store_true')
    parser.add_argument('--inspect-srt',type=Path)
    parser.add_argument('--config',type=Path)
    parser.add_argument('--out',type=Path)
    parser.add_argument('--dry-run',action='store_true')
    parser.add_argument('--preview-only',action='store_true')
    parser.add_argument('--browser-preview',action='store_true')
    args = parser.parse_args()
    if args.list_styles:
        print(json.dumps(read_json(SKILL/'assets/progress/styles.json'),ensure_ascii=False,indent=2))
        return
    if args.inspect_srt:
        print(json.dumps(read_srt(args.inspect_srt),ensure_ascii=False,indent=2))
        return
    if not args.config:
        parser.error('--config is required')
    plan = load_plan(args.config)
    painter = Painter(plan)
    if args.dry_run:
        print(json.dumps(plan,ensure_ascii=False,indent=2))
        return
    if not args.out:
        parser.error('--out is required')
    out = args.out.resolve()
    out.mkdir(parents=True,exist_ok=True)
    if not args.preview_only and any(out.glob('progress-*.mov')):
        raise ValueError('Output already contains videos; select a new directory')
    (out/'resolved-config.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
    snapshots = preview(plan,painter,out)
    result = {'preview':str(out/'preview.png'),'contactSheet':str(out/'contact-sheet.png')}
    if not args.preview_only:
        result['qa'] = render(plan,painter,out,snapshots,browser_preview=args.browser_preview)
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError, RuntimeError) as exc:
        print('ERROR: '+str(exc),file=sys.stderr)
        sys.exit(1)
