"""Extract an imagegen walk-in-place sheet into transparent poses; no image generation."""
import argparse,json
from pathlib import Path
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('--sheet',type=Path,required=True)
parser.add_argument('--columns',type=int,required=True)
parser.add_argument('--rows',type=int,required=True)
parser.add_argument('--out',type=Path,required=True)
args=parser.parse_args()
if args.columns<1 or args.rows<1 or not 4<=args.columns*args.rows<=32:parser.error('Require 4..32 poses')
im=Image.open(args.sheet).convert('RGBA')
if im.width%args.columns or im.height%args.rows:parser.error('Sheet dimensions must divide evenly into cells')
out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
if any(out.glob('walk-*.png')):parser.error('Output already contains character poses')
w,h=im.width//args.columns,im.height//args.rows
cells=[]
for n in range(args.columns*args.rows):
    cell=im.crop((n%args.columns*w,n//args.columns*h,(n%args.columns+1)*w,(n//args.columns+1)*h))
    alpha=cell.getchannel('A');box=alpha.point(lambda x:255 if x>24 else 0).getbbox()
    if not box or alpha.getextrema()[0]!=0 or min(box[0],box[1],w-box[2],h-box[3])<3:parser.error(f'Pose {n+1} is empty, opaque or touches its cell boundary')
    cells.append(cell.crop(box))
files=[]
for i,cell in enumerate(cells,1):
    path=out/f'walk-{i:02d}.png';cell.save(path);files.append(str(path))
(out/'character.json').write_text(json.dumps({'characterFrames':files},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'characterFrames':files},ensure_ascii=False,indent=2))
