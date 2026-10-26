"""Validated line, segment, and text-led chapter progress renderers."""
from pathlib import Path
import copy
from PIL import Image,ImageDraw,ImageFont
SKILL=Path(__file__).resolve().parent.parent
W,FPS,N=1440,30,240
FONT='C:/Windows/Fonts/msyh.ttc'
BOLD='C:/Windows/Fonts/msyhbd.ttc'
JOBS=[
 dict(id='dot-line',name='圆点连线',kind='dots',height=112,accent=[242,185,209],labels=['效果展示','操作演示','工具选择']),
 dict(id='short-segments',name='分段短线',kind='segments',height=112,accent=[245,246,153],labels=['效果展示','操作演示','工具选择']),
 dict(id='text-leading',name='文字领走',kind='text',height=96,accent=[145,205,236],labels=['效果展示','操作演示','工具选择'])]

class Candidate:
    def __init__(self,job):
        self.job=job;self.sprites=[];self.last_character_box=None
        W=job.get("width",1440);self.width=W
        font_size=job.get('fontSize',46)
        if isinstance(font_size,bool) or not isinstance(font_size,int) or not 18<=font_size<=72:
            raise ValueError('字号请输入 18–72 之间的整数')
        job['fontSize']=font_size
        self.font=ImageFont.truetype(BOLD if job['kind']=='text' and font_size>=36 else FONT,font_size)
        labels=job['labels'];cell=(W-72)/len(labels)
        check_labels=labels+(['|'] if job['kind']=='text' else [])
        boxes=[self.font.getbbox(t,anchor='mm') for t in check_labels]
        if any(b[2]-b[0]>cell-20 for b in boxes):
            raise ValueError('这个字号会让章节文字重叠，请减小字号')
        self.label_y=31 if job['kind']=='text' else 77
        if job['kind']=='text':
            self.label_y=max(31,2-min(b[1] for b in boxes))
            self.row_height=max(64,self.label_y+max(b[3] for b in boxes)+6)
            job['height']=2*((self.row_height+32+1)//2)
        else:
            track_bottom=39 if job['kind']=='dots' else 30
            job['labelGap']=6
            self.label_y=track_bottom+1+job['labelGap']-min(b[1] for b in boxes)
            job['height']=2*((self.label_y+max(b[3] for b in boxes)+7)//2)
            self.row_height=job['height']
        if job['kind']=='text':
            # Rasterize once at 4x resolution, then retain one coverage mask.
            # Changing color must not composite the same antialiased edge twice.
            scale=4
            mask=Image.new('L',(W*scale,job['height']*scale))
            md=ImageDraw.Draw(mask)
            large_font=ImageFont.truetype(BOLD if font_size>=36 else FONT,font_size*scale)
            for i,label in enumerate(labels):
                md.text(((36+cell*(i+.5))*scale,self.label_y*scale),label,font=large_font,anchor='mm',fill=255)
                if i<len(labels)-1:
                    md.text(((36+cell*(i+1))*scale,self.label_y*scale),'|',font=large_font,anchor='mm',fill=255)
            self.text_mask=mask.resize((W,job['height']),Image.Resampling.LANCZOS)
            images=[Image.open(p).convert('RGBA') for p in job.get('characterFrames',[SKILL/f'assets/characters/liuliu/walk-{i:02d}.png' for i in range(1,9)])]
            factor=64/max(im.height for im in images)
            self.sprites=[im.resize((round(im.width*factor),round(im.height*factor)),Image.Resampling.LANCZOS) for im in images]

    def frame(self,n):
        j=self.job;W=self.width;kind=j['kind'];h=j['height'];p=n/(j.get('totalFrames',N)-1);accent=tuple(j['accent'])
        chapters=j.get('chapters')
        if chapters:
            index=next((i for i,ch in enumerate(chapters) if n<ch['endFrameExclusive']),len(chapters)-1)
            ch=chapters[index]
            local=max(0,min(1,(n-ch['startFrame'])/max(1,ch['endFrameExclusive']-ch['startFrame']-1)))
            p=(index+local)/len(chapters)
        im=Image.new('RGBA',(W,h));d=ImageDraw.Draw(im)
        labels=j['labels'];count=len(labels);left,right=36,W-36
        if kind=='dots':
            front=round(left+(right-left)*p)
            d.line((left,23,right,23),fill=(245,245,245,240),width=6)
            if n:d.line((left,23,front,23),fill=(*accent,255),width=6)
            for i,label in enumerate(labels):
                x=round(left+(right-left)*(i+.5)/count)
                c=accent if x<=front else (248,248,248)
                d.ellipse((x-16,7,x+16,39),fill=(*c,255))
                d.text((x,self.label_y),label,font=self.font,anchor='mm',fill=(220,220,220,255))
        elif kind=='segments':
            gap=36;cell=(right-left)/count
            for i,label in enumerate(labels):
                x0=round(left+i*cell);x1=round(left+(i+1)*cell-gap)
                mask=Image.new('L',(W,h));ImageDraw.Draw(mask).rounded_rectangle((x0,12,x1,30),radius=9,fill=255)
                segment=Image.new('RGBA',(W,h),(250,250,250,255))
                local=max(0,min(1,p*count-i))
                if local:ImageDraw.Draw(segment).rectangle((x0,12,x0+round((x1-x0)*local),30),fill=(*accent,255))
                segment.putalpha(mask);im=Image.alpha_composite(im,segment);d=ImageDraw.Draw(im)
                d.text(((x0+x1)/2,self.label_y),label,font=self.font,anchor='mm',fill=(220,220,220,255))
        else:
            front=round(left+(right-left)*p)
            im=Image.new('RGBA',(W,h),(250,250,250,255))
            ImageDraw.Draw(im).rectangle((0,0,front,h),fill=(*accent,255))
            im.putalpha(self.text_mask)
            sprite=self.sprites[int(n/j.get('fps',FPS)*j.get('walkFps',10))%len(self.sprites)]
            x=max(0,min(W-sprite.width,round(front-sprite.width*.4)));y=h-sprite.height
            self.last_character_box=(x,y,x+sprite.width,y+sprite.height)
            im.alpha_composite(sprite,(x,y))
        return im


class ChapterPainter(Candidate):
    def __init__(self,plan):
        job=copy.deepcopy(next(j for j in JOBS if j['id']==plan['styleId']))
        job.update(width=plan['width'],fontSize=plan['fontSize'],accent=list(plan['appearance']['fillColor']),labels=[ch['title'] for ch in plan['chapters']],chapters=plan['chapters'],totalFrames=plan['totalFrames'],fps=plan['fps'])
        if 'characterFrames' in plan:job.update(characterFrames=plan['characterFrames'],walkFps=plan['walkFps'])
        super().__init__(job)
        plan['outputHeight']=job['height']
        plan['barHeight']=self.row_height
