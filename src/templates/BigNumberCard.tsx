import React from 'react';
import {Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type BigNumberCardProps = {
  headline: string;
  context: string;
  eyebrow: string;
  prefix?: string;
  value: string;
  suffix?: string;
  label: string;
  beforeLabel: string;
  beforeValue: string;
  afterLabel: string;
  afterValue: string;
  footnote?: string;
};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const numberFrom = (value: string) => {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 1;
};

const reveal = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const MiniBar: React.FC<{left: number; bottom: number; height: number; label: string; value: string; strong?: boolean; progress: number}> = ({left, bottom, height, label, value, strong = false, progress}) => (
  <div style={{position: 'absolute', left, bottom, width: 210, height, transform: `scaleY(${progress})`, transformOrigin: '50% 100%', opacity: progress}}>
    <div
      style={{
        position: 'absolute', inset: 0,
        backgroundColor: strong ? brand.colors.brick : brand.colors.paper,
        backgroundImage: `url(${staticFile(strong ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`,
        backgroundSize: strong ? '480px 480px' : '420px 150px',
        backgroundPosition: strong ? '57% 43%' : '25px 11px',
        backgroundBlendMode: strong ? 'soft-light' : 'normal',
        clipPath: 'polygon(2% 4%, 14% 1%, 29% 5%, 45% 2%, 61% 6%, 77% 1%, 98% 4%, 100% 94%, 87% 98%, 71% 94%, 54% 99%, 36% 95%, 18% 99%, 1% 95%)',
        filter: 'drop-shadow(0 10px 8px rgba(45, 32, 22, 0.16))',
      }}
    />
    <div style={{position: 'absolute', left: 0, top: 22, width: '100%', color: strong ? brand.colors.paper : brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(value, 62, 4, 44), fontWeight: 1000, lineHeight: 1, textAlign: 'center', whiteSpace: 'nowrap'}}>{value}</div>
    <div style={{position: 'absolute', left: 0, bottom: 24, width: '100%', color: strong ? brand.colors.paper : brand.colors.brick, fontFamily: brand.fontFamily, fontSize: fitFont(label, 27, 6, 21), fontWeight: 950, letterSpacing: 2, textAlign: 'center', whiteSpace: 'nowrap'}}>{label}</div>
  </div>
);

export const BigNumberCard: React.FC<BigNumberCardProps> = ({headline, context, eyebrow, prefix = '', value, suffix = '', label, beforeLabel, beforeValue, afterLabel, afterValue, footnote = ''}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const compactValue = `${prefix}${value}${suffix}`;
  const valueFontSize = fitFont(compactValue, 420, 4.7, 210);
  const beforeAmount = numberFrom(beforeValue);
  const afterAmount = numberFrom(afterValue);
  const maxAmount = Math.max(beforeAmount, afterAmount, 1);
  const beforeHeight = 128 + 205 * beforeAmount / maxAmount;
  const afterHeight = 128 + 205 * afterAmount / maxAmount;
  const titleT = reveal(frame, 4, 20);
  const contextT = reveal(frame, 15, 22);
  const gridT = reveal(frame, 24, 18);
  const dividerT = reveal(frame, 18, 22);
  const beforeBarT = spring({frame: frame - 34, fps, config: {damping: 16, stiffness: 105, mass: 0.9}});
  const afterBarT = spring({frame: frame - 48, fps, config: {damping: 15, stiffness: 110, mass: 0.88}});
  const eyebrowT = reveal(frame, 33, 18);
  const labelT = reveal(frame, 44, 18);
  const numberT = spring({frame: frame - 58, fps, config: {damping: 14, stiffness: 115, mass: 0.82}});
  const countT = reveal(frame, 60, 34);
  const lineT = reveal(frame, 86, 20);
  const footnoteT = reveal(frame, 98, 20);
  const numericValue = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  const decimals = value.includes('.') ? Math.min(2, value.split('.')[1]?.replace(/\D/g, '').length ?? 0) : 0;
  const displayedValue = Number.isFinite(numericValue) ? (numericValue * countT).toFixed(decimals) : value;

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 86, top: 74, width: 560, fontFamily: brand.fontFamily, opacity: titleT, transform: `translateY(${(1 - titleT) * 22}px)`}}>
        <div style={{color: brand.colors.ink, fontSize: fitFont(headline, 57, 17, 42), fontWeight: 1000, letterSpacing: 1, lineHeight: 1.16}}>{headline}</div>
        <div style={{marginTop: 38, width: 520, color: 'rgba(22, 20, 17, 0.72)', fontSize: fitFont(context, 25, 42, 20), fontWeight: 700, letterSpacing: 1, lineHeight: 1.55, opacity: contextT, transform: `translateY(${(1 - contextT) * 14}px)`}}>{context}</div>
      </div>

      <div style={{position: 'absolute', left: 90, top: 486, width: 550, height: 410}}>
        {[0, 1, 2].map((index) => <div key={index} style={{position: 'absolute', left: 0, bottom: 48 + index * 112, width: 550, height: 2, backgroundColor: index === 0 ? brand.colors.ink : 'rgba(22, 20, 17, 0.22)', transform: `scaleX(${gridT})`, transformOrigin: '0 50%', opacity: gridT}} />)}
        <MiniBar left={38} bottom={50} height={beforeHeight} label={beforeLabel} value={beforeValue} progress={beforeBarT} />
        <MiniBar left={296} bottom={50} height={afterHeight} label={afterLabel} value={afterValue} strong progress={afterBarT} />
      </div>

      <div style={{position: 'absolute', left: 714, top: 70, width: 3, height: 866, backgroundColor: 'rgba(22, 20, 17, 0.24)', transform: `rotate(0.15deg) scaleY(${dividerT})`, transformOrigin: '50% 0'}} />

      <div style={{position: 'absolute', left: 790, top: 94, width: 1030, fontFamily: brand.fontFamily}}>
        <div style={{color: brand.colors.brick, fontSize: fitFont(eyebrow, 31, 15, 24), fontWeight: 950, letterSpacing: 4, whiteSpace: 'nowrap', opacity: eyebrowT, transform: `translateX(${(1 - eyebrowT) * 28}px)`}}>{eyebrow}</div>
        <div style={{marginTop: 22, color: brand.colors.ink, fontSize: fitFont(label, 47, 11, 35), fontWeight: 1000, letterSpacing: 2, whiteSpace: 'nowrap', opacity: labelT, transform: `translateX(${(1 - labelT) * 28}px)`}}>{label}</div>
      </div>

      <div style={{position: 'absolute', left: 765, top: 210, width: 1090, height: 510, display: 'flex', alignItems: 'center', direction: 'ltr', color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: valueFontSize, fontWeight: 1000, letterSpacing: -16, lineHeight: 0.92, whiteSpace: 'nowrap', opacity: numberT, transform: `translateY(${(1 - numberT) * 34}px) scale(${0.78 + numberT * 0.22})`, transformOrigin: '48% 54%'}}>
        {prefix ? <span style={{order: 0, direction: 'ltr', unicodeBidi: 'isolate', color: brand.colors.brick, fontSize: valueFontSize * 0.38, letterSpacing: 0, marginRight: 18}}>{prefix}</span> : null}
        <span style={{order: 1, direction: 'ltr', unicodeBidi: 'isolate', backgroundImage: `linear-gradient(155deg, ${brand.colors.ink} 12%, ${brand.colors.brick} 112%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{displayedValue}</span>
        {suffix ? <span style={{order: 2, direction: 'ltr', unicodeBidi: 'isolate', color: brand.colors.brick, fontSize: valueFontSize * 0.42, letterSpacing: -4, marginLeft: 24}}>{suffix}</span> : null}
      </div>

      <div style={{position: 'absolute', left: 795, top: 778, width: 984, height: 8, backgroundColor: brand.colors.brick, clipPath: 'polygon(0 43%, 13% 9%, 29% 38%, 46% 0, 65% 42%, 82% 10%, 100% 48%, 91% 91%, 70% 63%, 49% 100%, 25% 64%, 7% 95%)', opacity: 0.86 * lineT, transform: `scaleX(${lineT})`, transformOrigin: '0 50%'}} />
      {footnote ? <div style={{position: 'absolute', left: 802, top: 824, width: 970, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(footnote, 34, 25, 27), fontWeight: 900, letterSpacing: 2, whiteSpace: 'nowrap', opacity: footnoteT, transform: `translateY(${(1 - footnoteT) * 18}px)`}}>{footnote}</div> : null}
    </BrandBackground>
  );
};
