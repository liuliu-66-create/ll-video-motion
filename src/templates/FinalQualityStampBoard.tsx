import React from 'react';
import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type FinalQualityStampBoardProps = {
  headline: string;
  items: Array<{label: string; value: string}>;
  conclusion: string;
};

const stripTear = 'polygon(0 9%, 5% 3%, 12% 8%, 20% 2%, 29% 9%, 38% 3%, 47% 8%, 57% 2%, 67% 9%, 77% 3%, 87% 8%, 96% 2%, 100% 9%, 99% 90%, 92% 97%, 83% 91%, 73% 98%, 63% 92%, 53% 97%, 43% 91%, 33% 98%, 23% 92%, 13% 97%, 3% 91%)';

const positions = [
  {left: 105, top: 248, width: 790, rotate: -1.6},
  {left: 1000, top: 238, width: 800, rotate: 1.3},
  {left: 155, top: 475, width: 790, rotate: 1.2},
  {left: 970, top: 492, width: 810, rotate: -1.4},
  {left: 295, top: 714, width: 850, rotate: -.8},
];

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const enter = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const FinalQualityStampBoard: React.FC<FinalQualityStampBoardProps> = ({headline, items, conclusion}) => {
  if (items.length !== 5) throw new Error('FinalQualityStampBoard requires exactly 5 quality checks.');
  const frame = useCurrentFrame();
  const titleT = enter(frame, 2, 20);
  const stampT = interpolate(frame, [118, 128, 138], [0, 1.08, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const stampOpacity = enter(frame, 118, 7);

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 100, top: 70, width: 1540, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fit(headline, 70, 22, 54), lineHeight: 1.1, fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>{headline}</div>

      {items.map((item, index) => {
        const pos = positions[index];
        const stripT = enter(frame, 24 + index * 17, 18);
        const checkT = enter(frame, 35 + index * 17, 12);
        const direction = index % 2 === 0 ? -1 : 1;
        return (
          <div key={`${item.label}-${index}`} style={{position: 'absolute', left: pos.left, top: pos.top, width: pos.width, height: 170, opacity: stripT, transform: `translateX(${direction * 90 * (1 - stripT)}px) rotate(${pos.rotate}deg)`, fontFamily: brand.fontFamily}}>
            <div style={{position: 'absolute', left: 12, right: -13, top: 12, bottom: -12, backgroundColor: '#9e4134', backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '310px 310px', backgroundBlendMode: 'soft-light', clipPath: stripTear, filter: 'drop-shadow(0 13px 9px rgba(47,31,22,.2))'}} />
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', backgroundColor: '#eee3d0', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '350px 210px', clipPath: stripTear, filter: 'drop-shadow(0 8px 6px rgba(47,31,22,.15))'}}>
              <div style={{marginLeft: 34, width: 102, height: 102, flex: '0 0 102px', display: 'grid', placeItems: 'center', color: '#f4e9d7', backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '170px 170px', backgroundBlendMode: 'soft-light', clipPath: 'polygon(5% 10%, 91% 2%, 98% 91%, 10% 98%)', fontFamily: 'Arial Black, sans-serif', fontSize: 68, fontWeight: 1000, lineHeight: 1, opacity: checkT, transform: `scale(${.55 + .45 * checkT}) rotate(${8 * (1 - checkT)}deg)`}}>✓</div>
              <div style={{marginLeft: 30, minWidth: 180, color: brand.colors.ink, fontSize: 32, fontWeight: 1000, letterSpacing: 3}}>{item.label}</div>
              <div style={{marginLeft: 'auto', marginRight: 42, color: brand.colors.brick, fontSize: fit(item.value, 49, 9, 35), fontWeight: 1000, letterSpacing: item.value.length > 8 ? 0 : 2, whiteSpace: 'nowrap'}}>{item.value}</div>
            </div>
          </div>
        );
      })}

      <div style={{position: 'absolute', right: 165, bottom: 91, width: 320, height: 184, color: brand.colors.brick, opacity: stampOpacity, transform: `scale(${stampT}) rotate(${18 - 11 * stampT}deg)`, transformOrigin: '50% 50%', fontFamily: brand.fontFamily}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `9px double ${brand.colors.brick}`, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '260px 260px', backgroundBlendMode: 'multiply', opacity: .9}} />
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', fontSize: fit(conclusion, 39, 6, 31), lineHeight: 1.15, fontWeight: 1000, letterSpacing: 3}}>{conclusion}</div>
      </div>
    </BrandBackground>
  );
};
