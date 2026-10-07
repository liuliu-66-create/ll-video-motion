import React from 'react';
import {Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {brand} from '../styles/brand';

export type ImbalanceScaleProps = {
  headline: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  conclusion: string;
};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const paperCrop = {x: 170, y: 4, width: 1494, height: 356};

const tornBeamShape = 'polygon(0 18%, 2% 5%, 5% 14%, 8% 3%, 12% 12%, 16% 4%, 21% 15%, 27% 6%, 33% 13%, 40% 3%, 47% 12%, 54% 5%, 61% 14%, 68% 4%, 75% 12%, 82% 3%, 89% 13%, 95% 5%, 100% 17%, 99% 82%, 96% 95%, 91% 86%, 85% 97%, 78% 87%, 71% 96%, 64% 85%, 57% 97%, 50% 88%, 43% 96%, 36% 86%, 29% 97%, 22% 87%, 15% 95%, 9% 85%, 4% 96%, 0 82%)';

const MetricPaper: React.FC<{left: number; top: number; width: number; height: number; label: string; value: string; strong?: boolean; motionStyle?: React.CSSProperties}> = ({left, top, width, height, label, value, strong = false, motionStyle}) => {
  const badgeCenter = width * 265 / 1494;
  const badgeCenterY = height * 208 / 356;
  const badgeSize = strong ? height * .48 : height * .52;
  return (
    <div style={{position: 'absolute', left, top, width, height, filter: 'drop-shadow(0 13px 9px rgba(45,32,22,.17))', ...motionStyle}}>
      <SpriteCrop asset="assets/multi-point-torn-paper-sprites-v1.png" sheetWidth={1672} sheetHeight={941} crop={paperCrop} width={width} height={height} style={{position: 'absolute', inset: 0}} />
      <div style={{position: 'absolute', left: badgeCenter - badgeSize / 2, top: badgeCenterY - badgeSize / 2, width: badgeSize, height: badgeSize, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: brand.colors.paper, fontFamily: brand.fontFamily, fontSize: fitFont(value, strong ? 36 : 28, 4, strong ? 27 : 22), fontWeight: 1000, lineHeight: 1, whiteSpace: 'nowrap'}}>{value}</div>
      <div style={{position: 'absolute', left: width * .34, top: height * .31, width: width * .59, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(label, strong ? 49 : 38, strong ? 9 : 8, strong ? 34 : 27), fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

export const ImbalanceScale: React.FC<ImbalanceScaleProps> = ({headline, leftLabel, leftValue, rightLabel, rightValue, conclusion}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
  const headlineIn = interpolate(frame, [0, 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const labelsIn = spring({frame: frame - 18, fps, config: {damping: 15, stiffness: 115, mass: .8}});
  const scaleIn = spring({frame: frame - 31, fps, config: {damping: 17, stiffness: 105, mass: .85}});
  const tip = interpolate(frame, [58, 108], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const tipSettle = spring({frame: frame - 101, fps, config: {damping: 9, stiffness: 135, mass: .55}});
  const finalTip = Math.min(1.05, tip * (.94 + .06 * tipSettle));
  const stampIn = spring({frame: frame - 104, fps, config: {damping: 10, stiffness: 180, mass: .55}});
  const conclusionIn = interpolate(frame, [118, 143], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const underlineIn = interpolate(frame, [137, 158], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const beamAngle = -8.2 * finalTip;
  const leftTop = interpolate(finalTip, [0, 1], [378, 430], clamp);
  const rightTop = interpolate(finalTip, [0, 1], [379, 327], clamp);
  const leftStringEnd = interpolate(finalTip, [0, 1], [648, 681], clamp);
  const rightStringEnd = interpolate(finalTip, [0, 1], [548, 517], clamp);

  return (
  <BrandBackground>
    <div style={{position: 'absolute', left: 92, top: 86, width: 1450, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(headline, 70, 21, 49), fontWeight: 1000, lineHeight: 1.13, letterSpacing: 1, opacity: headlineIn, transform: `translateY(${(1 - headlineIn) * 24}px)`}}>{headline}</div>
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <line x1="355" y1={leftTop + 180} x2="355" y2={leftStringEnd} stroke={brand.colors.ink} strokeWidth="6" opacity={scaleIn} />
      <line x1="1515" y1={rightTop + 128} x2="1515" y2={rightStringEnd} stroke={brand.colors.ink} strokeWidth="5" opacity={scaleIn} />
    </svg>

    <div style={{position: 'absolute', left: 246, top: 600, width: 1350, height: 78, opacity: scaleIn, transform: `scaleX(${.82 + .18 * scaleIn}) rotate(${beamAngle}deg)`, transformOrigin: '50% 50%', filter: 'drop-shadow(0 12px 8px rgba(45,32,22,.22))'}}>
      <div style={{position: 'absolute', left: 7, top: 10, width: '100%', height: '100%', backgroundColor: brand.colors.mutedBrick, clipPath: tornBeamShape, opacity: .84}} />
      <div style={{position: 'absolute', inset: 0, backgroundColor: '#d9c2a2', backgroundImage: `linear-gradient(rgba(93,43,32,.15), rgba(93,43,32,.15)), url("${staticFile('assets/paper-fiber-texture-v1.png')}")`, backgroundSize: 'auto 100%', backgroundBlendMode: 'multiply', clipPath: tornBeamShape}} />
      <div style={{position: 'absolute', left: 34, right: 32, top: 31, height: 8, backgroundColor: brand.colors.ink, opacity: .88, clipPath: 'polygon(0 24%, 9% 0, 19% 34%, 31% 8%, 44% 40%, 57% 4%, 70% 30%, 84% 7%, 100% 35%, 100% 78%, 86% 100%, 72% 71%, 58% 96%, 43% 66%, 29% 94%, 15% 65%, 0 88%)'}} />
    </div>

    <div style={{position: 'absolute', left: 835, top: 616, width: 247, height: 188, opacity: scaleIn, transform: `translateY(${(1 - scaleIn) * 32}px) scale(${.88 + .12 * scaleIn})`, backgroundColor: brand.colors.brick, backgroundImage: `linear-gradient(rgba(104,37,28,.34), rgba(104,37,28,.34)), url("${staticFile('assets/paper-fiber-texture-v1.png')}")`, backgroundSize: 'cover', backgroundBlendMode: 'multiply', clipPath: 'polygon(49% 0, 55% 5%, 100% 96%, 91% 100%, 7% 98%, 0 92%, 44% 7%)', filter: 'drop-shadow(0 12px 8px rgba(45,32,22,.2))'}} />

    <MetricPaper left={105} top={leftTop} width={690} height={164} label={leftLabel} value={leftValue} strong motionStyle={{opacity: labelsIn, transform: `translateX(${(1 - labelsIn) * -150}px) rotate(${(1 - labelsIn) * -4}deg)`, transformOrigin: '50% 50%'}} />
    <MetricPaper left={1290} top={rightTop} width={460} height={122} label={rightLabel} value={rightValue} motionStyle={{opacity: labelsIn, transform: `translateX(${(1 - labelsIn) * 150}px) rotate(${(1 - labelsIn) * 4}deg)`, transformOrigin: '50% 50%'}} />

    <div style={{position: 'absolute', left: 897, top: 680, width: 126, height: 126, borderRadius: '50%', backgroundColor: brand.colors.ink, color: brand.colors.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: brand.fontFamily, fontSize: 68, fontWeight: 1000, boxShadow: '0 12px 18px rgba(45,32,22,.18)', opacity: stampIn, transform: `scale(${Math.max(0, stampIn)}) rotate(${(1 - Math.min(1, stampIn)) * -18}deg)`}}>≠</div>

    <div style={{position: 'absolute', left: 330, bottom: 93, width: 1260, textAlign: 'center', color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(conclusion, 55, 20, 38), fontWeight: 1000, letterSpacing: 2, whiteSpace: 'nowrap', opacity: conclusionIn, transform: `translateY(${(1 - conclusionIn) * 22}px)`}}>
      {conclusion}
    </div>
    <div style={{position: 'absolute', left: 720, bottom: 66, width: 480 * underlineIn, height: 7, backgroundColor: brand.colors.brick, clipPath: 'polygon(0 48%, 15% 4%, 31% 43%, 48% 0, 64% 52%, 82% 8%, 100% 46%, 90% 93%, 69% 62%, 50% 100%, 27% 66%, 8% 96%)'}} />
  </BrandBackground>
  );
};
