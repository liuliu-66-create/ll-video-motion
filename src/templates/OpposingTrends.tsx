import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {enter} from '../components/motion';
import {brand} from '../styles/brand';

type ReplacementArt = {src: string; width: number; height: number};
export type OpposingTrendsProps = {
  risingTitle?: string; risingCaption?: string;
  fallingTitle?: string; fallingCaption?: string;
  /** Symbolic stacks only; not exact prices or measurements. */
  resourceCounts?: [number, number, number];
  risingArt?: ReplacementArt;
  fallingArt?: ReplacementArt;
};
const Art: React.FC<{kind: 'photo' | 'coin'; replacement?: ReplacementArt}> = ({kind, replacement}) => {
  const width = kind === 'photo' ? 245 : 145;
  const height = kind === 'photo' ? 245 * 302 / 420 : 145 * 178 / 338;
  return replacement
    ? <Img src={staticFile(replacement.src)} style={{width, height, objectFit: 'contain'}}/>
    : <SpriteCrop asset="assets/cost-accumulation-sprites-v1.png" sheetWidth={1672} sheetHeight={941}
        crop={kind === 'photo' ? {x:312,y:639,width:420,height:302} : {x:1170,y:702,width:338,height:178}}
        width={width}/>;
};
/** Two qualitative trends, not a numeric graph. */
export const OpposingTrends: React.FC<OpposingTrendsProps> = ({
  risingTitle = '质量提升', risingCaption = '作品越来越精细',
  fallingTitle = '价格走低', fallingCaption = '报价却越来越低',
  resourceCounts = [6, 3, 1], risingArt, fallingArt,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  // Timing scales with duration; the default preview is 6 seconds at 30fps.
  const phase = (start: number, duration = 0.4) =>
    enter(frame, Math.round(start / 6 * durationInFrames), Math.max(1, Math.round(duration / 6 * durationInFrames)));
  for (const [label, value, limit] of [
    ['上方标题', risingTitle, 8], ['下方标题', fallingTitle, 8],
    ['上方说明', risingCaption, 12], ['下方说明', fallingCaption, 12],
  ] as const) {
    if (Array.from(value).length > limit) throw new Error(label + '过长，请精简；不自动截断。');
  }
  if (resourceCounts.length !== 3 || resourceCounts.some(n => !Number.isInteger(n) || n < 1 || n > 6) ||
    resourceCounts[0] <= resourceCounts[1] || resourceCounts[1] <= resourceCounts[2])
    throw new Error('需要三组严格递减的数量，每组1—6个；数量仅作趋势示意。');
  for (const art of [risingArt, fallingArt]) {
    if (art && (!art.src || !Number.isFinite(art.width) || !Number.isFinite(art.height) || art.width <= 0 || art.height <= 0))
      throw new Error('替换素材需要有效路径和真实宽高。');
  }
  const line = phase(0.10, 2.2);
  const title = phase(2.8);
  const caption = phase(3.3, 0.35);
  return <BrandBackground>
    <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>
      {['M 210 538 C 460 540, 580 495, 740 420 S 1130 259, 1410 198',
        'M 210 548 C 500 560, 645 650, 820 697 S 1190 794, 1410 804'].map((d,i)=>
        <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1-line}
          opacity={line > 0 ? 1 : 0} fill="none" stroke={brand.colors.mutedBrick}
          strokeWidth={5} strokeLinecap="round"/>)}
      <circle cx={210} cy={543} r={9} fill={brand.colors.mutedBrick} opacity={phase(0,0.2)}/>
    </svg>
    {[{x:440,y:350,angle:-12},{x:810,y:220,angle:3},{x:1180,y:100,angle:-7}].map((p,i)=>{
      const progress = phase(0.55+i*0.7);
      return <div key={i} style={{position:'absolute',left:p.x,top:p.y,opacity:progress,
        transform:`translateY(${-22*(1-progress)}px) rotate(${p.angle}deg)`}}>
        <Art kind="photo" replacement={risingArt}/>
      </div>;
    })}
    {[{x:465,bottom:645},{x:840,bottom:753},{x:1235,bottom:820}].map((group,i)=>{
      const progress = phase(0.75+i*0.7);
      return <React.Fragment key={i}>
        {Array.from({length:resourceCounts[i]},(_,j)=>
          <div key={j} style={{position:'absolute',left:group.x,top:group.bottom-76-j*17,
            opacity:progress,transform:`translateY(${18*(1-progress)}px)`}}>
            <Art kind="coin" replacement={fallingArt}/>
          </div>)}
      </React.Fragment>;
    })}
    {[{y:218,title:risingTitle,caption:risingCaption},
      {y:729,title:fallingTitle,caption:fallingCaption}].map((p,i)=>
      <div key={i} style={{position:'absolute',left:1490,top:p.y,width:365,
        fontFamily:brand.fontFamily,textAlign:'left'}}>
        {p.title && <div style={{fontSize:44,lineHeight:'60px',fontWeight:700,color:brand.colors.ink,
          opacity:title,transform:`translateY(${16*(1-title)}px)`}}>{p.title}</div>}
        {p.caption && <div style={{marginTop:8,fontSize:28,lineHeight:'40px',fontWeight:700,
          color:brand.colors.mutedBrick,opacity:caption,
          transform:`translateY(${12*(1-caption)}px)`}}>{p.caption}</div>}
      </div>)}
  </BrandBackground>;
};
