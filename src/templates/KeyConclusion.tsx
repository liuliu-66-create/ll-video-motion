import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type KeyConclusionProps = {
  label: string;
  firstPart: string;
  secondPart: string;
};

const enter = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const baseText: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
  fontWeight: 900,
};

const wearPattern = (): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  backgroundImage: `url("${staticFile('assets/distressed-ink-wear-v1.png')}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '420px 220px',
  backgroundPosition: '13px 9px',
  opacity: 0.58,
  pointerEvents: 'none',
});

const InkText: React.FC<{text: string}> = ({text}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span>{text}</span>
    <span aria-hidden="true" style={wearPattern()}>{text}</span>
  </span>
);

export const KeyConclusion: React.FC<KeyConclusionProps> = ({label, firstPart, secondPart}) => {
  const frame = useCurrentFrame();
  const plateT = enter(frame, 3, 22);
  const labelT = enter(frame, 22, 15);
  const firstT = enter(frame, 38, 17);
  const secondT = enter(frame, 51, 17);
  const fullTextLength = Math.max(firstPart.length + secondPart.length + 1, 1);
  const mainFontSize = Math.min(137, Math.max(92, 1300 / fullTextLength));

  return (
    <AbsoluteFill style={{backgroundColor: '#d9d5cc', overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/key-conclusion-blank-v1.png')}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: plateT,
          transform: `translateY(${18 * (1 - plateT)}px) scale(${0.988 + 0.012 * plateT})`,
          transformOrigin: 'center',
        }}
      />

      <div
        style={{
          ...baseText,
          left: 362,
          top: 315,
          width: 446,
          height: 142,
          color: '#f2eadc',
          fontSize: 89,
          letterSpacing: 1,
          opacity: labelT,
          transform: `translateY(${18 * (1 - labelT)}px) scale(${0.9 + 0.1 * labelT}) rotate(${-1.2 * (1 - labelT)}deg)`,
        }}
      >
        <InkText text={label} />
      </div>

      <div
        style={{
          ...baseText,
          left: 310,
          top: 470,
          width: 1300,
          height: 190,
          color: '#11100e',
          fontSize: mainFontSize,
          letterSpacing: -4,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            opacity: firstT,
            transform: `translateX(${-38 * (1 - firstT)}px)`,
          }}
        >
          <InkText text={firstPart} />
        </span>
        <span style={{opacity: Math.min(firstT, secondT), margin: '0 12px 0 2px'}}>，</span>
        <span
          style={{
            opacity: secondT,
            transform: `translateX(${38 * (1 - secondT)}px)`,
          }}
        >
          <InkText text={secondPart} />
        </span>
      </div>
    </AbsoluteFill>
  );
};
