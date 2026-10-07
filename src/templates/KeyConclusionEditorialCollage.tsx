import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type KeyConclusionEditorialCollageProps = {
  label: string;
  firstPart: string;
  secondPart: string;
  note: string;
  debug?: boolean;
};

const enter = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const wearPattern = (): React.CSSProperties => ({
  position: 'absolute', inset: 0, color: 'transparent', WebkitTextFillColor: 'transparent',
  WebkitBackgroundClip: 'text', backgroundClip: 'text',
  backgroundImage: `url("${staticFile('assets/distressed-ink-wear-v1.png')}")`,
  backgroundRepeat: 'repeat', backgroundSize: '390px 215px', backgroundPosition: '17px 11px',
  opacity: 0.52, pointerEvents: 'none',
});

const InkText: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span>{children}</span>
    <span aria-hidden="true" style={wearPattern()}>{children}</span>
  </span>
);

export const KeyConclusionEditorialCollage: React.FC<KeyConclusionEditorialCollageProps> = ({label, firstPart, secondPart, note, debug = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const plateT = enter(frame, 3, 22);
  const labelT = spring({frame: frame - 21, fps, config: {damping: 13, stiffness: 145, mass: 0.7}});
  const firstT = enter(frame, 38, 17);
  const secondT = enter(frame, 49, 17);
  const lineT = enter(frame, 62, 18);
  const noteT = enter(frame, 73, 18);
  const accentT = enter(frame, 84, 13);
  const mainLength = Math.max(firstPart.length + secondPart.length + 1, 1);
  const mainFontSize = Math.min(112, Math.max(72, 1260 / mainLength));
  const noteFontSize = Math.min(48, Math.max(34, 580 / Math.max(note.length, 1)));

  return (
    <AbsoluteFill style={{backgroundColor: '#ded9ce', overflow: 'hidden', fontFamily: 'Microsoft YaHei, SimHei, sans-serif'}}>
      <Img src={staticFile('assets/newspaper-neutral-v1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img
        src={staticFile('assets/key-conclusion-editorial-collage-blank-v1.png')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: plateT, transform: `translateY(${20 * (1 - plateT)}px) scale(${0.992 + 0.008 * plateT})`, transformOrigin: 'center'}}
      />

      <div style={{position: 'absolute', left: 285, top: 206, width: 540, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f3ead8', fontSize: 82, fontWeight: 950, letterSpacing: 4, textAlign: 'center', opacity: labelT, transform: `rotate(-8.2deg) scale(${0.76 + 0.24 * labelT})`, outline: debug ? '3px dashed #1d9b55' : undefined}}>
        <InkText>{label}</InkText>
      </div>

      <div style={{position: 'absolute', left: 255, top: 396, width: 1370, height: 185, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', color: '#171411', fontSize: mainFontSize, fontWeight: 950, lineHeight: 1, letterSpacing: -4, outline: debug ? '3px dashed #d14a3a' : undefined}}>
        <span style={{opacity: firstT, transform: `translateX(${-42 * (1 - firstT)}px)`}}><InkText>{firstPart}</InkText></span>
        <span style={{opacity: Math.min(firstT, secondT), margin: '0 10px'}}>，</span>
        <span style={{opacity: secondT, transform: `translateX(${42 * (1 - secondT)}px)`}}><InkText>{secondPart}</InkText></span>
      </div>

      <svg width="850" height="76" viewBox="0 0 850 76" style={{position: 'absolute', left: 500, top: 552, overflow: 'visible', opacity: lineT}}>
        <path d="M10 22 C220 8 525 14 836 22" fill="none" stroke="#a23622" strokeWidth="11" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - lineT} />
        <path d="M42 52 C290 38 575 46 812 48" fill="none" stroke="#a23622" strokeWidth="7" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - lineT} />
      </svg>

      <div style={{position: 'absolute', left: 1010, top: 720, width: 650, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', color: '#171411', fontSize: noteFontSize, fontWeight: 900, letterSpacing: 1, opacity: noteT, transform: `translate(${34 * (1 - noteT)}px, ${18 * (1 - noteT)}px) rotate(-3.2deg)`, outline: debug ? '3px dashed #3a72c6' : undefined}}>
        <InkText>{note}</InkText>
      </div>
      <svg width="520" height="54" viewBox="0 0 520 54" style={{position: 'absolute', left: 1050, top: 820, transform: 'rotate(-3deg)', opacity: noteT}}>
        <path d="M8 18 C155 5 350 8 510 17" fill="none" stroke="#a23622" strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - noteT} />
        <path d="M90 42 C235 30 365 34 484 37" fill="none" stroke="#a23622" strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - noteT} />
      </svg>

      <div style={{position: 'absolute', left: 1508, top: 328, opacity: accentT, transform: `scale(${0.75 + 0.25 * accentT}) rotate(5deg)`, transformOrigin: 'center'}}>
        {[-34, 0, 34].map((angle) => <div key={angle} style={{position: 'absolute', left: 0, top: 0, width: 18, height: 82, background: '#a23622', transformOrigin: '9px 105px', transform: `rotate(${angle}deg) translateY(-35px)`}} />)}
      </div>
    </AbsoluteFill>
  );
};
