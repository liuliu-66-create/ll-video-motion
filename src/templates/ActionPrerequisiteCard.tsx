import React from 'react';
import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type ActionPrerequisiteCardProps = {
  headline: string;
  timingLabel: string;
  prompt: string;
  question: string;
};

const labelTear = 'polygon(1% 14%, 9% 4%, 20% 12%, 31% 3%, 43% 13%, 55% 4%, 67% 12%, 79% 3%, 91% 13%, 99% 6%, 100% 87%, 89% 96%, 76% 89%, 64% 98%, 51% 90%, 38% 97%, 25% 89%, 12% 97%, 1% 88%)';

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const enter = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const ActionPrerequisiteCard: React.FC<ActionPrerequisiteCardProps> = ({headline, timingLabel, prompt, question}) => {
  const frame = useCurrentFrame();
  const headlineT = enter(frame, 2, 20);
  const ruleT = enter(frame, 13, 24);
  const questionMarkT = interpolate(frame, [25, 42, 50], [0, 1.07, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const labelT = enter(frame, 43, 16);
  const promptT = enter(frame, 57, 20);
  const questionT = enter(frame, 78, 22);
  const underlineT = enter(frame, 98, 22);

  return (
  <BrandBackground>
    <div style={{position: 'absolute', left: 105, top: 72, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fit(headline, 72, 19, 56), lineHeight: 1.12, fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap', opacity: headlineT, transform: `translateY(${20 * (1 - headlineT)}px)`}}>{headline}</div>
    <div style={{position: 'absolute', left: 108, top: 170, width: 1705, height: 8, backgroundColor: brand.colors.brick, transformOrigin: '0 50%', transform: `rotate(-.25deg) scaleX(${ruleT})`, opacity: .92}} />

    <div style={{position: 'absolute', left: 118, top: 250, width: 430, height: 650, display: 'grid', placeItems: 'center', color: brand.colors.brick, fontFamily: 'Georgia, serif', fontSize: 430, lineHeight: 1, fontWeight: 900, opacity: Math.min(1, questionMarkT * 1.6), transform: `scale(${questionMarkT}) rotate(${-12 + 9 * questionMarkT}deg)`}}>?</div>

    <div style={{position: 'absolute', left: 590, top: 278, width: 1150, height: 640, fontFamily: brand.fontFamily}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 300, height: 78, display: 'grid', placeItems: 'center', color: '#f4e9d7', backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '230px 190px', backgroundBlendMode: 'soft-light', clipPath: labelTear, opacity: labelT, transform: `translateY(${-30 * (1 - labelT)}px) rotate(${-7 + 5.6 * labelT}deg) scale(${.86 + .14 * labelT})`, fontSize: fit(timingLabel, 34, 6, 28), fontWeight: 1000, letterSpacing: 5}}>{timingLabel}</div>

      <div style={{position: 'absolute', left: 0, top: 118, color: brand.colors.ink, fontSize: fit(prompt, 112, 6, 82), lineHeight: 1, fontWeight: 1000, letterSpacing: 3, whiteSpace: 'nowrap', opacity: promptT, transform: `translateX(${42 * (1 - promptT)}px)`}}>{prompt}</div>

      <div style={{position: 'absolute', left: 5, top: 294, width: 1080, color: brand.colors.ink, opacity: questionT, transform: `translateY(${28 * (1 - questionT)}px)`}}>
        <div style={{position: 'absolute', left: -28, top: -25, color: brand.colors.brick, fontFamily: 'Georgia, serif', fontSize: 105, lineHeight: 1, fontWeight: 900}}>“</div>
        <div style={{position: 'relative', paddingLeft: 58, width: 1005, fontSize: fit(question, 55, 17, 40), lineHeight: 1.38, fontWeight: 900, letterSpacing: 1}}>{question}</div>
        <div style={{marginLeft: 58, marginTop: 35, width: 975, height: 5, backgroundColor: brand.colors.brick, transformOrigin: '0 50%', transform: `scaleX(${underlineT})`}} />
        <div style={{marginLeft: 58, marginTop: 14, width: 660, height: 3, backgroundColor: 'rgba(23,21,18,.32)', transformOrigin: '0 50%', transform: `scaleX(${underlineT})`}} />
      </div>
    </div>
  </BrandBackground>
  );
};
