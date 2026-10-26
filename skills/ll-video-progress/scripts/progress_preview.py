"""Generate an eight-second sample using the same renderer as final delivery."""
import argparse,json,re
from pathlib import Path
from progress import load_plan,Painter
from export_progress import preview,render

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--style',choices=['soft-white-green','walking-leading','dot-line','short-segments','text-leading'],default='soft-white-green')
    parser.add_argument('--font-size',type=int)
    parser.add_argument('--color',required=True)
    parser.add_argument('--out',type=Path,required=True)
    args=parser.parse_args()
    if not re.fullmatch(r'#[0-9a-fA-F]{6}',args.color):parser.error('Use #RRGGBB')
    out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
    (out/'sample.srt').write_text('1\n00:00:00,000 --> 00:00:02,666\n效果展示\n\n2\n00:00:02,667 --> 00:00:05,332\n操作演示\n\n3\n00:00:05,333 --> 00:00:08,000\n工具选择\n',encoding='utf-8')
    cfg=dict(sourceSrt='sample.srt',styleId=args.style,width=1440,canvasHeight=1080,barHeight=64,fps=30,appearance={'fillColor':[int(args.color[i:i+2],16) for i in (1,3,5)]},chapters=[dict(title=t,startCue=i,endCue=i) for i,t in enumerate(['效果展示','操作演示','工具选择'],1)])
    if args.style in ['dot-line','short-segments','text-leading']:
        cfg['barHeight']=96
        cfg['fontSize']=args.font_size if args.font_size is not None else {'dot-line':24,'short-segments':26,'text-leading':25}[args.style]
    path=out/'config.json';path.write_text(json.dumps(cfg,ensure_ascii=False,indent=2),encoding='utf-8')
    plan=load_plan(path);painter=Painter(plan)
    (out/'resolved-config.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf-8')
    render(plan,painter,out,preview(plan,painter,out),browser_preview=True)
    (out/'ready.json').write_text(json.dumps({'color':args.color,'styleId':args.style}),encoding='utf-8')

if __name__=='__main__':main()
