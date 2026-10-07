import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type BeforeAfterCompareProps = {
  beforeTitle: string;
  beforeText: string;
  afterTitle: string;
  afterText: string;
};

type Crop = {x: number; y: number; width: number; height: number};
const sheet = {width: 1672, height: 941};
const crops = {
  leftGroup: {x: 42, y: 55, width: 625, height: 525},
  arrow: {x: 650, y: 620, width: 350, height: 230},
  rightGroup: {x: 995, y: 50, width: 630, height: 560},
} satisfies Record<string, Crop>;

const appear = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const Sprite: React.FC<{crop: Crop; width: number}> = ({crop, width}) => {
  const scale = width / crop.width;
  const height = crop.height * scale;
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden'}}>
      <Img src={staticFile('assets/before-after-composite-sprites-v3.png')} style={{position: 'absolute', width: sheet.width * scale, height: sheet.height * scale, maxWidth: 'none', left: -crop.x * scale, top: -crop.y * scale}} />
    </div>
  );
};

const textStyle: React.CSSProperties = {
  position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'Microsoft YaHei, sans-serif', fontWeight: 900, whiteSpace: 'nowrap',
};

const ComparisonGroup: React.FC<{side: 'left' | 'right'; title: string; text: string}> = ({side, title, text}) => {
  const frame = useCurrentFrame();
  const isLeft = side === 'left';
  const t = appear(frame, isLeft ? 3 : 31, 22);
  const width = 800;
  const crop = isLeft ? crops.leftGroup : crops.rightGroup;
  const height = crop.height * width / crop.width;
  const left = isLeft ? 35 : 1080;
  const top = isLeft ? 155 : 125;
  return (
    <div style={{position: 'absolute', left, top, width, height, opacity: t, transform: `translateX(${(isLeft ? -1 : 1) * 65 * (1 - t)}px) rotate(${(isLeft ? -1 : 1) * 1.2 * (1 - t)}deg)`, transformOrigin: 'center'}}>
      <Sprite crop={crop} width={width} />
      {isLeft ? (
        <>
          <div style={{...textStyle, left: 115, top: 128, width: 560, height: 258, color: '#f1eadb', fontSize: Math.min(104, 440 / Math.max(title.length, 1)), letterSpacing: 4}}>{title}</div>
          <div style={{...textStyle, left: 192, top: 365, width: 425, height: 132, color: '#171512', fontSize: Math.min(55, 270 / Math.max(text.length, 1))}}>{text}</div>
        </>
      ) : (
        <>
          <div style={{...textStyle, left: 145, top: 115, width: 535, height: 255, color: '#f1eadb', fontSize: Math.min(104, 440 / Math.max(title.length, 1)), letterSpacing: 4}}>{title}</div>
          <div style={{...textStyle, left: 205, top: 368, width: 415, height: 130, color: '#171512', fontSize: Math.min(55, 270 / Math.max(text.length, 1))}}>{text}</div>
        </>
      )}
    </div>
  );
};

export const BeforeAfterCompare: React.FC<BeforeAfterCompareProps> = ({beforeTitle, beforeText, afterTitle, afterText}) => {
  const frame = useCurrentFrame();
  const arrowT = appear(frame, 22, 20);
  return (
    <AbsoluteFill style={{background: '#dedbd2', overflow: 'hidden'}}>
      <Img src={staticFile('assets/newspaper-neutral-v1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <ComparisonGroup side="left" title={beforeTitle} text={beforeText} />
      <div style={{position: 'absolute', left: 785, top: 445, width: 370, opacity: arrowT, transform: `translateX(${-42 * (1 - arrowT)}px) scale(${0.82 + 0.18 * arrowT}) rotate(-2deg)`, transformOrigin: 'center'}}>
        <Sprite crop={crops.arrow} width={370} />
      </div>
      <ComparisonGroup side="right" title={afterTitle} text={afterText} />
    </AbsoluteFill>
  );
};
