"""Regression checks for subtitle boundaries, alpha and configurable layout."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image, ImageChops, ImageDraw

import progress


class ProgressTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        # Nonconsecutive IDs, BOM, fractional frame boundary and final whitespace.
        (self.root/'video.srt').write_text('10\n00:00:00,000 --> 00:00:00,500\n第一句\n\n20\n00:00:00,733 --> 00:00:01,000\n第二句\n\n30\n00:00:01,233 --> 00:00:02,001\n最后一句\n',encoding='utf-8-sig')
        self.cfg = dict(sourceSrt='video.srt',width=1440,canvasHeight=1080,barHeight=64,fps=30,chapters=[dict(title='效果展示',startCue=10,endCue=10),dict(title='操作演示',startCue=20,endCue=20),dict(title='工具选择',startCue=30,endCue=30)])

    def plan(self, cfg=None):
        path = self.root/'config.json'
        path.write_text(json.dumps(cfg or self.cfg,ensure_ascii=False),encoding='utf-8')
        return progress.load_plan(path)

    def test_boundaries_and_alpha(self):
        plan = self.plan()
        self.assertEqual([x['startFrame'] for x in plan['chapters']],[0,22,37])
        self.assertEqual(plan['totalFrames'],61)
        paint = progress.Painter(plan)
        self.assertEqual(paint.frame(0).getpixel((100,32)),(255,255,255,110))
        self.assertEqual(paint.frame(21).getpixel((470,3)),(172,217,93,255))
        self.assertEqual(paint.frame(22).getpixel((600,3))[:3],(255,255,255))
        self.assertEqual(paint.frame(60).getpixel((1400,3)),(172,217,93,255))

    def test_promoted_styles_follow_unequal_subtitle_ranges(self):
        for style in ['dot-line','short-segments','text-leading']:
            with self.subTest(style=style):
                plan=self.plan({**self.cfg,'styleId':style,'barHeight':96,'fontSize':25})
                paint=progress.Painter(plan)
                self.assertEqual(paint.frame(0).size,(1440,plan['outputHeight']))
                self.assertEqual(paint.frame(60).getpixel((0,0))[3],0)
                self.assertEqual(paint.job['chapters'][1]['startFrame'],22)
                if style=='short-segments':
                    self.assertEqual(paint.frame(21).getpixel((455,21))[:3],tuple(plan['appearance']['fillColor']))
                    self.assertEqual(paint.frame(21).getpixel((600,21))[:3],(250,250,250))

    def test_text_color_does_not_thicken_antialiased_edges(self):
        plan=self.plan({**self.cfg,'styleId':'text-leading','barHeight':96,'fontSize':25})
        paint=progress.Painter(plan)
        before=paint.frame(0).getchannel('A').crop((150,0,360,32))
        after=paint.frame(60).getchannel('A').crop((150,0,360,32))
        self.assertIsNone(ImageChops.difference(before,after).getbbox())

    def test_reject_gap_overlap_omitted_ending_and_wrong_text(self):
        bad = []
        cfg = copy.deepcopy(self.cfg); cfg['chapters'][1]['startCue']=30; bad.append(cfg)
        cfg = copy.deepcopy(self.cfg); cfg['chapters'][1]['startCue']=10; bad.append(cfg)
        cfg = copy.deepcopy(self.cfg); cfg['chapters'].pop(); bad.append(cfg)
        cfg = copy.deepcopy(self.cfg); cfg['chapters'][0]['startText']='错误原话'; bad.append(cfg)
        for cfg in bad:
            with self.subTest(cfg=cfg), self.assertRaises(ValueError): self.plan(cfg)

    def test_reject_wrong_style_opacity_title_and_duration(self):
        mutations=[{'styleId':'unknown'},{'appearance':{'baseOpacity':1.5}},{'appearance':{'baseOpacity':float('nan')}},{'duration':1}]
        for change in mutations:
            with self.subTest(change=change), self.assertRaises(ValueError): self.plan({**self.cfg,**change})
        cfg=copy.deepcopy(self.cfg); cfg['chapters'][0]['title']='过长的标题'*50
        with self.assertRaises(ValueError): self.plan(cfg)

    def test_five_chapters_portrait_and_independent_height(self):
        blocks=[]
        for i in range(5):
            blocks.append(f'{i+1}\n00:00:0{i},000 --> 00:00:0{i},900\n第{i+1}句')
        (self.root/'video.srt').write_text('\n\n'.join(blocks),encoding='utf-8')
        cfg={**self.cfg,'width':1080,'canvasHeight':1920,'barHeight':48,'chapters':[dict(title=f'章节{i+1}',startCue=i+1,endCue=i+1) for i in range(5)],'appearance':{'baseOpacity':0,'fillColor':[20,100,200]}}
        plan=self.plan(cfg)
        im=progress.Painter(plan).frame(0)
        self.assertEqual(im.size,(1080,48))
        self.assertEqual(im.getpixel((3,3))[3],0)
        self.assertEqual(plan['chapters'][-1]['right'],1080)

    def test_walking_dimensions_and_unchanged_bar(self):
        plan=self.plan({**self.cfg,'styleId':'walking-leading'})
        painter=progress.Painter(plan)
        self.assertEqual(plan['outputHeight'],96)
        self.assertEqual(max(im.height for im in painter.sprites),64)
        for n in [0,21,22,37,60]:
            actual=painter.frame(n)
            x,y,r,b=painter.last_character_box
            self.assertLessEqual(b-64,32)
            self.assertGreaterEqual(x,0)
            self.assertLessEqual(r,1440)
            diff=ImageChops.difference(actual.crop((0,0,1440,64)),painter.base.frame(n))
            ImageDraw.Draw(diff).rectangle((x,y,r-1,min(63,b-1)),fill=(0,0,0,0))
            self.assertTrue(all(v==(0,0) for v in diff.getextrema()))

    def test_replacement_character_and_opaque_rejection(self):
        files=[]
        for i in range(4):
            im=Image.new('RGBA',(30,60))
            ImageDraw.Draw(im).rectangle((5+i,4,24,55),fill=(220,20,40,255))
            path=self.root/f'pose-{i}.png';im.save(path);files.append(str(path))
        plan=self.plan({**self.cfg,'styleId':'walking-leading','characterFrames':files})
        painter=progress.Painter(plan)
        self.assertEqual(len(painter.sprites),4)
        self.assertEqual(painter.frame(0).size,(1440,96))
        Image.new('RGB',(30,60),'white').save(files[0])
        with self.assertRaises(ValueError):progress.Painter(plan)


if __name__=='__main__': unittest.main()
