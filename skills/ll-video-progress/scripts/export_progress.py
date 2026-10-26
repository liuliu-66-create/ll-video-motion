"""Narrow ProRes 4444 export and alpha-aware QA for both progress styles."""
import json, shutil, subprocess
from PIL import Image, ImageChops, ImageDraw

def run(args):
    return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout

def preview(plan,painter,out):
    samples=sorted({0,plan['totalFrames']-1,*[ch['startFrame'] for ch in plan['chapters']],*[ch['endFrameExclusive']-1 for ch in plan['chapters']],*[(ch['startFrame']+ch['endFrameExclusive'])//2 for ch in plan['chapters']]})
    w,h=plan['width'],plan['outputHeight']
    bg=plan['appearance']['previewBackground']
    sheet=Image.new('RGB',(w,(h+12)*len(samples)),bg)
    for i,n in enumerate(samples):
        img=Image.alpha_composite(Image.new('RGBA',(w,h),bg),painter.frame(n)).convert('RGB')
        sheet.paste(img,(0,i*(h+12)))
    sheet.save(out/'contact-sheet.png')
    n=plan['totalFrames']//2
    painter.frame(n).save(out/'preview-alpha.png')
    Image.alpha_composite(Image.new('RGBA',(w,h),bg),painter.frame(n)).convert('RGB').save(out/'preview.png')
    return samples

def render(plan,painter,out,snapshots,browser_preview=False):
    for binary in ['ffmpeg','ffprobe']:
        if not shutil.which(binary):raise ValueError(binary+' missing from PATH')
    final=out/'progress-strip.mov'
    if final.exists() or (out/'qa.json').exists():raise ValueError('Output exists; select a new directory')
    reference=out/'reference-qtrle.mov'
    partial=out/'progress-strip.partial.mov'
    w,h,fps=plan['width'],plan['outputHeight'],plan['fps']
    with (out/'render.log').open('wb') as log:
        process=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',f'{w}x{h}','-r',str(fps),'-i','pipe:0','-an','-c:v','qtrle','-pix_fmt','argb',str(reference)],stdin=subprocess.PIPE,stderr=log)
        try:
            for n in range(plan['totalFrames']):process.stdin.write(painter.frame(n).tobytes())
        finally:
            process.stdin.close();code=process.wait()
        if code:raise RuntimeError('Render failed; inspect render.log')
    run(['ffmpeg','-v','error','-y','-i',str(reference),'-an','-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le','-alpha_bits','16','-vendor','apl0',str(partial)])
    info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(partial)]))
    v=info['streams'][0]
    if len(info['streams'])!=1 or v['codec_name']!='prores' or v['profile']!='4444' or v['width']!=w or v['height']!=h or not v['pix_fmt'].startswith('yuva') or int(v['nb_frames'])!=plan['totalFrames'] or abs(float(info['format']['duration'])-plan['duration'])>.5/fps:
        raise RuntimeError('ProRes export specification mismatch')
    run(['ffmpeg','-v','error','-i',str(partial),'-f','null','-'])
    select='+'.join(f'eq(n,{n})' for n in snapshots)
    raw=run(['ffmpeg','-v','error','-i',str(partial),'-vf',f"select='{select}'",'-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgba','pipe:1'])
    size=w*h*4
    if len(raw)!=size*len(snapshots):raise RuntimeError('QA sample count mismatch')
    max_error=0
    for i,n in enumerate(snapshots):
        actual=Image.frombytes('RGBA',(w,h),raw[i*size:(i+1)*size])
        expected=painter.frame(n)
        error=ImageChops.difference(actual.getchannel('A'),expected.getchannel('A')).getextrema()[1]
        max_error=max(error,max_error)
        if error>2:raise RuntimeError(f'Alpha differs at frame {n}: {error}')
        if painter.last_character_box:
            x,y,r,b=painter.last_character_box
            outside=actual.getchannel('A').crop((0,plan['barHeight'],w,h))
            ImageDraw.Draw(outside).rectangle((x,max(0,y-plan['barHeight']),r-1,b-plan['barHeight']-1),fill=0)
            if outside.getextrema()[1]>1:raise RuntimeError('Opaque pixels outside the bar and character')
    run(['ffmpeg','-v','error','-y','-i',str(partial),'-vf',f'select=eq(n\\,{plan["totalFrames"]//2})','-frames:v','1',str(out/'encoded-frame.png')])
    if browser_preview:
        run(['ffmpeg','-v','error','-y','-i',str(reference),'-an','-c:v','libvpx-vp9','-pix_fmt','yuva420p','-auto-alt-ref','0','-lossless','1','-row-mt','1','-deadline','good','-cpu-used','4',str(out/'preview.webm')])
        run(['ffmpeg','-v','error','-i',str(out/'preview.webm'),'-f','null','-'])
    partial.rename(final)
    qa=dict(file=final.name,width=w,height=h,frames=plan['totalFrames'],duration=plan['duration'],codec='ProRes 4444',pixelFormat=v['pix_fmt'],sampleFrames=snapshots,maxAlphaError=max_error,fullDecode='passed',outsideBarAndCharacterAlpha=0 if painter.sprites else 'not applicable: strip is the entire frame',characterHeight=max((im.height for im in painter.sprites),default=0),overhang=plan['outputHeight']-plan['barHeight'])
    (out/'qa.json').write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'使用说明.txt').write_text('导入 progress-strip.mov，放在原视频上方轨道，开头对齐，保持原速，铺满宽度并移至画面顶部。此文件是窄条 ProRes 4444 透明视频；reference-qtrle.mov 是内部校验文件，请勿交付。网页底色不在导出文件内。\n',encoding='utf-8')
    return qa
