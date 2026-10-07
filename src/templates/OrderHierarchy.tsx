import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {enter} from '../components/motion';
import {brand} from '../styles/brand';

const people = {
  client: {x:24,y:130,width:526,height:749},
  middle: {x:557,y:76,width:450,height:810},
  makers: {x:1051,y:163,width:616,height:701},
} as const;
const positions = [
  {key:'client' as const,left:75,top:60,width:340,titleTop:552},
  {key:'middle' as const,left:650,top:125,width:300,titleTop:673},
  {key:'makers' as const,left:1200,top:230,width:470,titleTop:773},
];
export type OrderHierarchyLevel = {title:string; note:string; imageSrc?:string};
export type OrderHierarchyProps = {
  levels?: [OrderHierarchyLevel,OrderHierarchyLevel,OrderHierarchyLevel];
  connectionLabels?: [string,string];
  levelAtSeconds?: [number,number,number];
  connectionAtSeconds?: [number,number];
};
const defaultLevels: [OrderHierarchyLevel,OrderHierarchyLevel,OrderHierarchyLevel] = [
  {title:'上游甲方',note:'决定项目与预算'},
  {title:'中间方',note:'把项目继续转交'},
  {title:'制作方',note:'我和朋友实际制作'},
];
const checkText = (value:string,max:number,field:string) => {
  const length = Array.from(value.trim()).length;
  if (length < 1 || length > max) throw new Error(`${field}须为1—${max}个字符。`);
};
const Arrow: React.FC<{left:number;top:number;width:number;rotate:number;progress:number}> =
  ({left,top,width,rotate,progress}) => {
    const height = width * 689 / 1627;
    return <div style={{position:'absolute',left,top,width:width*progress,height,
      overflow:'hidden',opacity:progress,transform:`rotate(${rotate}deg)`,
      transformOrigin:'left center'}}>
      <div style={{width,height}}>
        <SpriteCrop asset="assets/paper-arrow-down-right-v1.png" sheetWidth={1774} sheetHeight={887}
          crop={{x:88,y:103,width:1627,height:689}} width={width}/>
      </div>
    </div>;
  };

/** A three-level commission relationship, not three ordered work steps. */
export const OrderHierarchy: React.FC<OrderHierarchyProps> = ({
  levels = defaultLevels,
  connectionLabels = ['委托项目','转交制作'],
  levelAtSeconds = [0,1.8,3.73],
  connectionAtSeconds = [1.13,3.03],
}) => {
  const frame = useCurrentFrame();
  const {fps,durationInFrames} = useVideoConfig();
  if (levels.length !== 3 || connectionLabels.length !== 2 ||
      levelAtSeconds.length !== 3 || connectionAtSeconds.length !== 2) {
    throw new Error('OrderHierarchy固定需要3个层级和2条关系。');
  }
  levels.forEach((level,index) => {
    checkText(level.title,6,`levels[${index}].title`);
    checkText(level.note,10,`levels[${index}].note`);
  });
  connectionLabels.forEach((label,index) => checkText(label,6,`connectionLabels[${index}]`));
  [...levelAtSeconds,...connectionAtSeconds].forEach((seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0 || seconds*fps+35 >= durationInFrames) {
      throw new Error('入场时间必须为非负数，并为动画保留至少35帧。');
    }
  });
  const groupStarts = levelAtSeconds.map(seconds => Math.round(seconds*fps));
  const arrowStarts = connectionAtSeconds.map(seconds => Math.round(seconds*fps));
  const arrow1 = enter(frame, arrowStarts[0], 18);
  const arrow2 = enter(frame, arrowStarts[1], 18);
  const label1 = enter(frame, arrowStarts[0]+5, 14);
  const label2 = enter(frame, arrowStarts[1]+5, 14);
  return <BrandBackground>
    {positions.map((item,index) => {
      const level = levels[index];
      const artProgress = enter(frame, groupStarts[index], 20);
      const titleProgress = enter(frame, groupStarts[index] + 11, 15);
      const noteProgress = enter(frame, groupStarts[index] + 20, 15);
      return <React.Fragment key={item.key}>
        <div style={{position:'absolute',left:item.left,top:item.top,width:item.width,
          height:item.titleTop-item.top-8,opacity:artProgress,
          transform:`translateY(${24*(1-artProgress)}px) scale(${0.97+0.03*artProgress})`,
          transformOrigin:'center bottom'}}>
          {level.imageSrc ? <Img src={staticFile(level.imageSrc)} style={{width:'100%',height:'100%',
            objectFit:'contain',objectPosition:'center bottom'}}/> :
            <SpriteCrop asset="assets/order-hierarchy-people-v2.png" sheetWidth={1672} sheetHeight={941}
              crop={people[item.key]} width={item.width}/>}
        </div>
        <div style={{position:'absolute',left:item.left-20,top:item.titleTop,
          width:item.width+40,textAlign:'center',fontFamily:brand.fontFamily}}>
          <div style={{fontSize:42,lineHeight:'56px',fontWeight:700,color:brand.colors.ink,
            opacity:titleProgress,transform:`translateY(${13*(1-titleProgress)}px)`,whiteSpace:'nowrap'}}>{level.title}</div>
          <div style={{marginTop:2,fontSize:27,lineHeight:'38px',fontWeight:700,
            color:brand.colors.mutedBrick,opacity:noteProgress,
            transform:`translateY(${11*(1-noteProgress)}px)`,whiteSpace:'nowrap'}}>{level.note}</div>
        </div>
      </React.Fragment>;
    })}
    <Arrow left={445} top={408} width={178} rotate={-2} progress={arrow1}/>
    <Arrow left={978} top={535} width={190} rotate={3} progress={arrow2}/>
    <div style={{position:'absolute',left:430,top:360,width:210,textAlign:'center',
      fontFamily:brand.fontFamily,fontSize:25,fontWeight:700,color:brand.colors.mutedBrick,
      opacity:label1,transform:`translateY(${10*(1-label1)}px)`}}>
      {connectionLabels[0]}
    </div>
    <div style={{position:'absolute',left:968,top:486,width:210,textAlign:'center',
      fontFamily:brand.fontFamily,fontSize:25,fontWeight:700,color:brand.colors.mutedBrick,
      opacity:label2,transform:`translateY(${10*(1-label2)}px)`}}>
      {connectionLabels[1]}
    </div>
  </BrandBackground>;
};

export const OrderHierarchyDraft = OrderHierarchy;
