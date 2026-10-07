import React from 'react';
import {Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type DataChartVariant = 'category-bars' | 'time-line' | 'qualitative-rise' | 'step-growth';

export type DynamicDataChartProps = {
  variant: DataChartVariant;
  headline: string;
  eyebrow?: string;
  unit?: string;
  items: Array<{label: string; value?: number; displayValue?: string}>;
  conclusion?: string;
};

const reveal = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const PaperBar: React.FC<{x: number; height: number; width: number; progress: number; strong?: boolean}> = ({x, height, width, progress, strong}) => (
  <div style={{position: 'absolute', left: x, bottom: 132, width, height, transform: `scaleY(${progress})`, transformOrigin: '50% 100%'}}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundColor: strong ? brand.colors.brick : brand.colors.paper,
      backgroundImage: `url(${staticFile(strong ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`,
      backgroundSize: strong ? '430px 430px' : '360px 170px',
      backgroundBlendMode: strong ? 'soft-light' : 'normal',
      clipPath: 'polygon(2% 2%, 15% 0, 29% 3%, 43% 1%, 58% 4%, 73% 1%, 88% 3%, 99% 1%, 100% 96%, 87% 99%, 70% 96%, 52% 100%, 35% 97%, 18% 100%, 1% 97%)',
      filter: 'drop-shadow(0 12px 9px rgba(48,34,24,.16))',
    }} />
  </div>
);

const TornRibbonSegment: React.FC<{left: number; top: number; width: number; angle: number; progress: number}> = ({left, top, width, angle, progress}) => (
  <div style={{position: 'absolute', left, top, width, height: 92, transform: `rotate(${angle}deg) scaleX(${progress})`, transformOrigin: '0 50%', filter: 'drop-shadow(0 10px 8px rgba(45,30,20,.17))'}}>
    <div style={{position: 'absolute', inset: 0, backgroundColor: '#d6bd8c', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '420px 165px', backgroundBlendMode: 'multiply', clipPath: 'polygon(0 16%, 7% 8%, 15% 13%, 24% 5%, 34% 12%, 44% 4%, 55% 11%, 65% 3%, 76% 12%, 87% 5%, 100% 15%, 98% 84%, 89% 92%, 79% 86%, 69% 96%, 58% 88%, 47% 97%, 36% 87%, 25% 94%, 14% 85%, 4% 92%)'}} />
    <div style={{position: 'absolute', left: 10, right: 10, top: 34, height: 22, backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '330px 330px', backgroundBlendMode: 'soft-light', clipPath: 'polygon(0 22%, 9% 2%, 20% 20%, 33% 0, 46% 24%, 59% 3%, 72% 21%, 86% 1%, 100% 23%, 97% 79%, 84% 98%, 70% 77%, 57% 100%, 43% 78%, 29% 97%, 15% 76%, 2% 96%)'}} />
  </div>
);

const Header: React.FC<{headline: string; eyebrow?: string; t: number}> = ({headline, eyebrow, t}) => (
  <div style={{position: 'absolute', left: 92, top: 70, width: 1420, fontFamily: brand.fontFamily, opacity: t, transform: `translateY(${(1 - t) * 22}px)`}}>
    {eyebrow ? <div style={{color: brand.colors.brick, fontSize: 25, fontWeight: 950, letterSpacing: 5, marginBottom: 15}}>{eyebrow}</div> : null}
    <div style={{color: brand.colors.ink, fontSize: fit(headline, 66, 23, 48), fontWeight: 1000, lineHeight: 1.14, letterSpacing: 1}}>{headline}</div>
  </div>
);

const Conclusion: React.FC<{text?: string; t: number}> = ({text, t}) => text ? (
  <div style={{position: 'absolute', right: 86, top: 83, width: 345, minHeight: 112, padding: '26px 34px', display: 'grid', placeItems: 'center', color: brand.colors.paper, fontFamily: brand.fontFamily, fontSize: fit(text, 31, 9, 23), fontWeight: 1000, textAlign: 'center', letterSpacing: 2, opacity: t, transform: `rotate(-1.4deg) scale(${0.88 + 0.12 * t})`}}>
    <div style={{position: 'absolute', inset: 0, zIndex: -1, backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '360px 360px', backgroundBlendMode: 'soft-light', clipPath: 'polygon(2% 8%, 14% 2%, 30% 7%, 46% 1%, 62% 6%, 78% 2%, 98% 7%, 100% 91%, 84% 97%, 68% 92%, 50% 99%, 31% 94%, 15% 98%, 1% 92%)', filter: 'drop-shadow(0 10px 8px rgba(45,30,20,.2))'}} />
    {text}
  </div>
) : null;

export const DynamicDataChart: React.FC<DynamicDataChartProps> = ({variant, headline, eyebrow, unit = '', items, conclusion}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleT = reveal(frame, 4, 20);
  const conclusionT = reveal(frame, 92, 20);
  const values = items.map((item, index) => item.value ?? index + 1);
  const maxValue = Math.max(...values, 1);
  const chartLeft = 152;
  const chartTop = 292;
  const chartWidth = 1615;
  const chartHeight = 610;

  if (variant === 'category-bars') {
    const barWidth = 210;
    const gap = (chartWidth - barWidth * items.length) / Math.max(items.length - 1, 1);
    return (
      <BrandBackground>
        <Header headline={headline} eyebrow={eyebrow} t={titleT} />
        <Conclusion text={conclusion} t={conclusionT} />
        <div style={{position: 'absolute', left: chartLeft, top: chartTop, width: chartWidth, height: chartHeight, fontFamily: brand.fontFamily}}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: 0, bottom: 132 + i * 135, width: chartWidth, height: i === 0 ? 3 : 2, background: i === 0 ? brand.colors.ink : 'rgba(23,21,18,.17)'}} />)}
          {items.map((item, index) => {
            const start = 24 + index * 10;
            const p = spring({frame: frame - start, fps, config: {damping: 16, stiffness: 105, mass: .86}});
            const height = 115 + 335 * (values[index] / maxValue);
            const x = index * (barWidth + gap);
            const countT = reveal(frame, start + 8, 30);
            const shown = Math.round(values[index] * countT);
            return <React.Fragment key={`${item.label}-${index}`}>
              <PaperBar x={x} height={height} width={barWidth} progress={p} strong={index === items.length - 1} />
              <div style={{position: 'absolute', left: x, bottom: 152 + height, width: barWidth, color: brand.colors.ink, fontSize: 42, fontWeight: 1000, textAlign: 'center', opacity: p}}>{item.displayValue ?? `${shown}${unit}`}</div>
              <div style={{position: 'absolute', left: x - 12, bottom: 70, width: barWidth + 24, color: brand.colors.ink, fontSize: fit(item.label, 30, 7, 23), fontWeight: 950, textAlign: 'center', letterSpacing: 2, whiteSpace: 'nowrap'}}>{item.label}</div>
            </React.Fragment>;
          })}
        </div>
      </BrandBackground>
    );
  }

  if (variant === 'time-line') {
    const innerLeft = 95;
    const innerRight = chartWidth - 85;
    const innerTop = 55;
    const innerBottom = chartHeight - 105;
    const points = items.map((item, index) => ({
      x: innerLeft + index * ((innerRight - innerLeft) / Math.max(items.length - 1, 1)),
      y: innerBottom - (values[index] / maxValue) * (innerBottom - innerTop),
    }));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const lineT = reveal(frame, 28, 62);
    return (
      <BrandBackground>
        <Header headline={headline} eyebrow={eyebrow} t={titleT} />
        <Conclusion text={conclusion} t={conclusionT} />
        <div style={{position: 'absolute', left: chartLeft, top: chartTop, width: chartWidth, height: chartHeight, fontFamily: brand.fontFamily}}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: innerLeft, top: innerTop + i * ((innerBottom - innerTop) / 3), width: innerRight - innerLeft, height: 2, background: 'rgba(23,21,18,.17)'}} />)}
          <svg width={chartWidth} height={chartHeight} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <path d={path} fill="none" stroke="#d7c5a8" strokeWidth="31" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2200" strokeDashoffset={2200 * (1 - lineT)} />
            <path d={path} fill="none" stroke={brand.colors.brick} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2200" strokeDashoffset={2200 * (1 - lineT)} />
          </svg>
          {points.map((point, index) => {
            const p = reveal(frame, 30 + index * 9, 14);
            return <React.Fragment key={`${items[index].label}-${index}`}>
              <div style={{position: 'absolute', left: point.x - 17, top: point.y - 17, width: 34, height: 34, borderRadius: '50%', background: brand.colors.brick, border: `7px solid ${brand.colors.paper}`, boxShadow: '0 4px 8px rgba(30,20,14,.22)', opacity: p, transform: `scale(${p})`}} />
              <div style={{position: 'absolute', left: point.x - 85, top: point.y - 74, width: 170, color: brand.colors.ink, fontSize: 31, fontWeight: 1000, textAlign: 'center', opacity: p}}>{items[index].displayValue ?? `${values[index]}${unit}`}</div>
              <div style={{position: 'absolute', left: point.x - 78, bottom: 45, width: 156, color: brand.colors.ink, fontSize: 25, fontWeight: 900, textAlign: 'center'}}>{items[index].label}</div>
            </React.Fragment>;
          })}
        </div>
      </BrandBackground>
    );
  }

  if (variant === 'qualitative-rise') {
    const arrowT = reveal(frame, 24, 66);
    const lineT = reveal(frame, 34, 58);
    const trendPath = 'M 112 505 C 385 520, 616 474, 820 425 C 1044 370, 1242 315, 1490 250';
    const nodes = [
      {x: 132, y: 505},
      {x: 610, y: 475},
      {x: 1035, y: 372},
      {x: 1480, y: 252},
    ];
    return (
      <BrandBackground>
        <Header headline={headline} eyebrow={eyebrow} t={titleT} />
        <div style={{position: 'absolute', left: chartLeft, top: chartTop + 40, width: chartWidth, height: chartHeight - 20, fontFamily: brand.fontFamily}}>
          <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <defs>
              <linearGradient id="riseArrowGradient" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor={brand.colors.brick} stopOpacity="0.06" />
                <stop offset="24%" stopColor={brand.colors.brick} stopOpacity="0.28" />
                <stop offset="58%" stopColor={brand.colors.brick} stopOpacity="0.68" />
                <stop offset="100%" stopColor="#b3231f" stopOpacity="1" />
              </linearGradient>
              <filter id="paperGrain" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="8" result="noise" />
                <feColorMatrix in="noise" type="saturate" values="0" result="grayNoise" />
                <feComponentTransfer in="grayNoise" result="softNoise">
                  <feFuncA type="table" tableValues="0 0.13" />
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="softNoise" mode="multiply" />
              </filter>
              <clipPath id="riseArrowReveal">
                <rect x="0" y="0" width={chartWidth * arrowT} height={chartHeight} />
              </clipPath>
            </defs>
            <g clipPath="url(#riseArrowReveal)">
              <path
                d="M 225 348 C 520 344, 760 292, 982 219 C 1162 160, 1288 106, 1402 61 L 1356 14 L 1534 26 L 1470 191 L 1436 123 C 1315 171, 1186 224, 1001 282 C 769 356, 520 404, 229 406 Z"
                fill="url(#riseArrowGradient)"
                filter="url(#paperGrain)"
              />
              <path
                d="M 290 376 C 545 373, 775 322, 991 251 C 1170 192, 1302 137, 1435 82"
                fill="none"
                stroke="rgba(255,244,224,.34)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
            <path d={trendPath} fill="none" stroke="#d5bd91" strokeWidth="35" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2100" strokeDashoffset={2100 * (1 - lineT)} />
            <path d={trendPath} fill="none" stroke={brand.colors.brick} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2100" strokeDashoffset={2100 * (1 - lineT)} />
          </svg>
          {nodes.map((node, index) => {
            const p = spring({frame: frame - 47 - index * 11, fps, config: {damping: 15, stiffness: 115}});
            return <div key={index} style={{position: 'absolute', left: node.x - 18, top: node.y - 18, width: 36, height: 36, borderRadius: '50%', background: brand.colors.brick, border: `7px solid ${brand.colors.paper}`, boxShadow: '0 5px 9px rgba(40,25,16,.2)', transform: `scale(${p})`}} />;
          })}
          {conclusion ? <div style={{position: 'absolute', left: 810, top: 72, width: 340, color: brand.colors.brick, fontSize: fit(conclusion, 40, 8, 32), fontWeight: 1000, letterSpacing: 2, textAlign: 'center', whiteSpace: 'nowrap', opacity: conclusionT}}>{conclusion}</div> : null}
        </div>
      </BrandBackground>
    );
  }

  const stepWidth = 385;
  const stepPositions = [
    {left: 35, bottom: 55},
    {left: 400, bottom: 165},
    {left: 765, bottom: 275},
    {left: 1130, bottom: 385},
  ];
  return (
    <BrandBackground>
      <Header headline={headline} eyebrow={eyebrow} t={titleT} />
      <Conclusion text={conclusion} t={conclusionT} />
      <div style={{position: 'absolute', left: 132, top: 315, width: 1655, height: 630, fontFamily: brand.fontFamily}}>
        {items.map((item, index) => {
          const position = stepPositions[index] ?? {left: 35 + index * 365, bottom: 55 + index * 110};
          const p = spring({frame: frame - 24 - index * 13, fps, config: {damping: 16, stiffness: 108, mass: .88}});
          return <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 ? <div style={{position: 'absolute', left: position.left - 20, bottom: position.bottom - 99, width: 22, height: 116, backgroundColor: brand.colors.brick, clipPath: 'polygon(13% 0, 83% 4%, 100% 19%, 79% 35%, 96% 53%, 75% 70%, 92% 88%, 78% 100%, 13% 96%, 0 81%, 18% 63%, 2% 45%, 19% 26%, 3% 11%)', opacity: p}} /> : null}
          <div style={{position: 'absolute', left: position.left, bottom: position.bottom, width: stepWidth, height: 118, opacity: p, transform: `translateX(${(1 - p) * -34}px)`}}>
            <div style={{position: 'absolute', inset: 0, backgroundColor: index === items.length - 1 ? brand.colors.brick : brand.colors.paper, backgroundImage: `url(${staticFile(index === items.length - 1 ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`, backgroundSize: index === items.length - 1 ? '430px 430px' : '390px 180px', backgroundBlendMode: index === items.length - 1 ? 'soft-light' : 'normal', clipPath: 'polygon(1% 3%, 13% 0, 28% 4%, 45% 1%, 61% 4%, 76% 1%, 99% 4%, 100% 96%, 86% 99%, 69% 96%, 52% 100%, 34% 97%, 17% 100%, 0 96%)', filter: 'drop-shadow(0 12px 10px rgba(45,30,20,.17))'}} />
            <div style={{position: 'absolute', left: 28, top: 33, color: index === items.length - 1 ? brand.colors.paper : brand.colors.brick, fontSize: 28, fontWeight: 1000, letterSpacing: 3}}>0{index + 1}</div>
            <div style={{position: 'absolute', left: 105, right: 24, top: 27, color: index === items.length - 1 ? brand.colors.paper : brand.colors.ink, fontSize: fit(item.label, 42, 6, 31), fontWeight: 1000, textAlign: 'center', letterSpacing: 3, whiteSpace: 'nowrap'}}>{item.label}</div>
          </div>
          </React.Fragment>;
        })}
      </div>
    </BrandBackground>
  );
};
