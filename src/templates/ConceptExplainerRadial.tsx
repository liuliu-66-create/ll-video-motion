import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../styles/brand';

export type ConceptExplainerRadialProps = {
  coreTitle: string;
  coreSubtitle: string;
  leftLabel?: string;
  leftText: string;
  rightLabel?: string;
  rightPrefix: string;
  rightHighlight: string;
  rightSuffix: string;
  bottomLabel?: string;
  bottomLine1: string;
  bottomLine2: string;
};

const centerTear = 'polygon(1% 8%, 6% 3%, 13% 9%, 21% 2%, 29% 7%, 37% 4%, 46% 10%, 54% 3%, 63% 8%, 72% 2%, 81% 9%, 89% 4%, 97% 8%, 99% 21%, 98% 38%, 100% 56%, 98% 74%, 99% 93%, 94% 97%, 87% 91%, 79% 99%, 70% 92%, 62% 97%, 53% 90%, 44% 99%, 36% 93%, 27% 98%, 19% 90%, 11% 97%, 2% 92%, 1% 78%, 2% 61%, 0% 43%, 2% 25%)';
const fit = (text: string, preferred: number, safeChars: number, min: number) => Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));
const enter = (frame: number, start: number, duration = 18) => interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

export const ConceptExplainerRadial: React.FC<ConceptExplainerRadialProps> = ({coreTitle, coreSubtitle, leftLabel = '谁能用', leftText, rightLabel = '使用规模', rightPrefix, rightHighlight, rightSuffix, bottomLabel = '怎么用', bottomLine1, bottomLine2}) => {
  const frame = useCurrentFrame();
  const coreT = enter(frame, 4, 22);
  const coreTextT = enter(frame, 14, 17);
  const leftLineT = enter(frame, 34, 18);
  const rightLineT = enter(frame, 45, 18);
  const bottomLineT = enter(frame, 56, 18);
  const leftT = enter(frame, 43, 18);
  const rightT = enter(frame, 54, 18);
  const bottomT = enter(frame, 67, 20);
  return (
  <AbsoluteFill style={{background: brand.colors.background, overflow: 'hidden'}}>
    <Img src={staticFile(brand.backgroundAsset)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />

    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <path d="M700 360 L585 255" pathLength={1} fill="none" stroke={brand.colors.brick} strokeWidth="4" strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - leftLineT} />
      <path d="M1220 360 L1330 220" pathLength={1} fill="none" stroke={brand.colors.brick} strokeWidth="4" strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - rightLineT} />
      <path d="M960 650 L960 758" pathLength={1} fill="none" stroke={brand.colors.brick} strokeWidth="4" strokeLinecap="round" strokeDasharray={1} strokeDashoffset={1 - bottomLineT} />
      <circle cx="585" cy="255" r="8" fill={brand.colors.brick} opacity={leftLineT} /><circle cx="1330" cy="220" r="8" fill={brand.colors.brick} opacity={rightLineT} /><circle cx="960" cy="758" r="8" fill={brand.colors.brick} opacity={bottomLineT} />
    </svg>

    <div style={{position: 'absolute', left: 150, top: 135, width: 430, fontFamily: brand.fontFamily, opacity: leftT, transform: `translateX(${-30 * (1 - leftT)}px)`}}>
      <div style={{color: brand.colors.brick, fontSize: 34, fontWeight: 900, letterSpacing: 3}}>{leftLabel}</div>
      <div style={{marginTop: 14, color: brand.colors.ink, fontSize: fit(leftText, 68, 8, 52), lineHeight: 1.12, fontWeight: 1000, whiteSpace: 'nowrap'}}>{leftText}</div>
    </div>

    <div style={{position: 'absolute', left: 1370, top: 118, width: 440, fontFamily: brand.fontFamily, opacity: rightT, transform: `translateX(${30 * (1 - rightT)}px)`}}>
      <div style={{color: brand.colors.brick, fontSize: 34, fontWeight: 900, letterSpacing: 3}}>{rightLabel}</div>
      <div style={{marginTop: 14, color: brand.colors.ink, fontSize: 53, lineHeight: 1.15, fontWeight: 1000, whiteSpace: 'nowrap'}}><span>{rightPrefix}</span><span style={{color: brand.colors.brick, fontSize: 67}}>{rightHighlight}</span><span>{rightSuffix}</span></div>
    </div>

    <div style={{position: 'absolute', left: 649, top: 313, width: 622, height: 348, backgroundColor: 'rgba(73,56,39,.13)', clipPath: centerTear, filter: 'blur(2.4px)', opacity: coreT, transform: `translateY(${22 * (1 - coreT)}px) scale(${.94 + .06 * coreT})`}} />
    <div style={{position: 'absolute', left: 655, top: 303, width: 610, height: 342, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee5d5', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '360px 260px', clipPath: centerTear, filter: 'drop-shadow(0 18px 12px rgba(45,30,21,.22))', fontFamily: brand.fontFamily, opacity: coreT, transform: `translateY(${22 * (1 - coreT)}px) scale(${.94 + .06 * coreT})`}}>
      <div style={{color: brand.colors.ink, fontFamily: 'Arial Black, Impact, sans-serif', fontSize: fit(coreTitle, 130, 8, 96), lineHeight: 1, fontWeight: 1000, letterSpacing: -6, opacity: coreTextT, transform: `translateY(${14 * (1 - coreTextT)}px)`}}>{coreTitle}</div>
      <div style={{marginTop: 17, color: brand.colors.ink, fontSize: fit(coreSubtitle, 39, 14, 30), lineHeight: 1.2, fontWeight: 900, letterSpacing: 1, opacity: coreTextT}}>{coreSubtitle}</div>
    </div>

    <div style={{position: 'absolute', left: 610, top: 790, width: 700, textAlign: 'center', fontFamily: brand.fontFamily, opacity: bottomT, transform: `translateY(${28 * (1 - bottomT)}px)`}}>
      <div style={{color: brand.colors.brick, fontSize: 34, fontWeight: 900, letterSpacing: 3}}>{bottomLabel}</div>
      <div style={{marginTop: 13, color: brand.colors.ink, fontSize: fit(bottomLine1, 66, 9, 50), lineHeight: 1.15, fontWeight: 1000}}>{bottomLine1}</div>
      <div style={{marginTop: 8, color: '#4f4a43', fontSize: fit(bottomLine2, 36, 12, 29), lineHeight: 1.2, fontWeight: 800}}>{bottomLine2}</div>
    </div>
  </AbsoluteFill>
  );
};
