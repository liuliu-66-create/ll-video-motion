import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../styles/brand';

export type ConceptExplainerTopDownProps = {coreTitle: string; definition: string; leftPrefix: string; leftHighlight: string; leftSuffix: string; middleText: string; rightText: string};
const wideTear = 'polygon(0.5% 7%, 3.1% 3%, 6.8% 8%, 10.5% 4%, 14.8% 10%, 18.2% 3%, 22.9% 7%, 27.4% 2%, 31.6% 8%, 36.5% 4%, 41.1% 10%, 45.8% 3%, 50.3% 7%, 55.8% 2%, 60.7% 9%, 66.1% 4%, 71.8% 8%, 76.4% 3%, 82.5% 10%, 87.2% 4%, 92.5% 8%, 97.4% 3%, 99.5% 7%, 99.8% 22%, 99.1% 39%, 99.7% 57%, 99% 75%, 99.4% 92%, 97.5% 96%, 93.8% 91%, 89.6% 98%, 84.2% 92%, 79.1% 99%, 74.8% 90%, 69.2% 97%, 64.1% 93%, 59.7% 99%, 54.3% 91%, 49.5% 98%, 44.7% 92%, 39.2% 99%, 34.8% 90%, 29.1% 97%, 24.4% 93%, 19.2% 99%, 14.6% 91%, 9.5% 98%, 5.7% 92%, 1% 97%, 0.4% 81%, 1.1% 63%, 0.3% 45%, 1% 27%)';
const fit = (text: string, preferred: number, safeChars: number, min: number) => Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));
const enter = (frame: number, start: number, duration = 18) => interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

export const ConceptExplainerTopDown: React.FC<ConceptExplainerTopDownProps> = ({coreTitle, definition, leftPrefix, leftHighlight, leftSuffix, middleText, rightText}) => {
  const frame = useCurrentFrame();
  const titleT = enter(frame, 7, 20);
  const definitionT = enter(frame, 18, 18);
  const connectorT = enter(frame, 31, 24);
  const paperT = enter(frame, 44, 22);
  const firstT = enter(frame, 59, 17);
  const secondT = enter(frame, 72, 17);
  const thirdT = enter(frame, 85, 17);
  return (
  <AbsoluteFill style={{background: brand.colors.background, overflow: 'hidden'}}>
    <Img src={staticFile(brand.backgroundAsset)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    <div style={{position: 'absolute', left: 485, top: 105, width: 950, textAlign: 'center', fontFamily: brand.fontFamily}}>
      <div style={{color: brand.colors.ink, fontFamily: 'Arial Black, Impact, sans-serif', fontSize: fit(coreTitle, 154, 8, 112), lineHeight: 1, fontWeight: 1000, letterSpacing: -7, opacity: titleT, transform: `translateY(${20 * (1 - titleT)}px)`}}>{coreTitle}</div>
      <div style={{marginTop: 22, color: brand.colors.ink, fontSize: fit(definition, 49, 18, 37), lineHeight: 1.2, fontWeight: 900, letterSpacing: 1, opacity: definitionT, transform: `translateY(${14 * (1 - definitionT)}px)`}}>{definition}</div>
    </div>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <path d="M960 382 L960 492 M960 438 L325 438 Q275 438 275 488 L275 520 M960 438 L1645 438 Q1695 438 1695 488 L1695 520" pathLength={1} fill="none" stroke={brand.colors.brick} strokeWidth="4" strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - connectorT} />
      <circle cx="275" cy="520" r="7" fill={brand.colors.brick} opacity={connectorT} /><circle cx="960" cy="492" r="7" fill={brand.colors.brick} opacity={connectorT} /><circle cx="1695" cy="520" r="7" fill={brand.colors.brick} opacity={connectorT} />
    </svg>
    <div style={{position: 'absolute', left: 110, top: 520, width: 1700, height: 388, backgroundColor: 'rgba(93,72,50,.14)', clipPath: wideTear, filter: 'blur(2px)', opacity: paperT, transform: `translateY(${38 * (1 - paperT)}px) scaleX(${.97 + .03 * paperT})`}} />
    <div style={{position: 'absolute', left: 115, top: 512, width: 1690, height: 385, backgroundColor: '#eee5d5', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '420px 275px', clipPath: wideTear, filter: 'drop-shadow(0 20px 11px rgba(45,30,21,.22))', fontFamily: brand.fontFamily, opacity: paperT, transform: `translateY(${38 * (1 - paperT)}px) scaleX(${.97 + .03 * paperT})`}}>
      <div style={{position: 'absolute', left: 560, top: 70, width: 1, height: 235, backgroundColor: 'rgba(23,21,18,.22)'}} /><div style={{position: 'absolute', left: 1125, top: 70, width: 1, height: 235, backgroundColor: 'rgba(23,21,18,.22)'}} />
      <div style={{position: 'absolute', left: 75, top: 62, width: 430, textAlign: 'center', opacity: firstT, transform: `translateY(${20 * (1 - firstT)}px)`}}><div style={{color: brand.colors.brick, fontSize: 38, fontWeight: 900}}>01</div><div style={{marginTop: 24, color: brand.colors.ink, fontSize: 43, lineHeight: 1.2, fontWeight: 1000, whiteSpace: 'nowrap'}}><span>{leftPrefix}</span><span style={{color: brand.colors.brick, fontSize: 57}}>{leftHighlight}</span><span>{leftSuffix}</span></div><div style={{marginTop: 17, color: '#5e574e', fontSize: 27, fontWeight: 700}}>找到需要的项目与工具</div></div>
      <div style={{position: 'absolute', left: 625, top: 62, width: 440, textAlign: 'center', opacity: secondT, transform: `translateY(${20 * (1 - secondT)}px)`}}><div style={{color: brand.colors.brick, fontSize: 38, fontWeight: 900}}>02</div><div style={{marginTop: 28, color: brand.colors.ink, fontSize: fit(middleText, 47, 8, 38), lineHeight: 1.2, fontWeight: 1000, whiteSpace: 'nowrap'}}>{middleText}</div><div style={{marginTop: 17, color: '#5e574e', fontSize: 27, fontWeight: 700}}>使用、修改并参与协作</div></div>
      <div style={{position: 'absolute', left: 1188, top: 62, width: 430, textAlign: 'center', opacity: thirdT, transform: `translateY(${20 * (1 - thirdT)}px)`}}><div style={{color: brand.colors.brick, fontSize: 38, fontWeight: 900}}>03</div><div style={{marginTop: 28, color: brand.colors.ink, fontSize: fit(rightText, 47, 8, 38), lineHeight: 1.2, fontWeight: 1000, whiteSpace: 'nowrap'}}>{rightText}</div><div style={{marginTop: 17, color: '#5e574e', fontSize: 27, fontWeight: 700}}>获取工具与学习资料</div></div>
    </div>
  </AbsoluteFill>
  );
};
