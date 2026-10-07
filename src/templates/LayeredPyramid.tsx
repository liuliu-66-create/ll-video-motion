import React from 'react';
import {Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type LayeredPyramidLevel = {
  title: string;
  note: string;
};

export type LayeredPyramidProps = {
  title: string;
  subtitle?: string;
  levels: LayeredPyramidLevel[];
};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const enter = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const PyramidBand: React.FC<{
  level: LayeredPyramidLevel;
  index: number;
  count: number;
  top: number;
  width: number;
  height: number;
  bandT: number;
  noteT: number;
}> = ({level, index, count, top, width, height, bandT, noteT}) => {
  const left = 960 - width / 2;
  const noteOnLeft = index % 2 === 1;
  const noteWidth = 310;
  const noteLeft = noteOnLeft ? 78 : 1532;
  const bandEdge = noteOnLeft ? left : left + width;
  const lineLeft = noteOnLeft ? noteLeft + noteWidth + 14 : bandEdge + 12;
  const lineWidth = Math.max(34, noteOnLeft ? left - lineLeft - 12 : noteLeft - lineLeft - 12);
  const rotation = [-1.1, 0.7, -0.5, 0.5, -0.3][index % 5];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: left + 12,
          top: top + 13,
          width: width - 8,
          height: height - 7,
          backgroundColor: brand.colors.brick,
          backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`,
          backgroundSize: '650px 650px',
          backgroundPosition: `${24 + index * 11}% ${36 + index * 9}%`,
          backgroundBlendMode: 'soft-light',
          clipPath: 'polygon(1% 7%, 98% 1%, 100% 88%, 3% 100%)',
          opacity: 0.78 * bandT,
          transform: `translateY(${28 * (1 - bandT)}px) rotate(${rotation * -0.7}deg) scaleX(${0.72 + 0.28 * bandT})`,
          transformOrigin: 'center bottom',
          filter: 'drop-shadow(0 9px 9px rgba(45, 32, 22, 0.14))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left,
          top,
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: brand.colors.ink,
          backgroundColor: brand.colors.paper,
          backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`,
          backgroundSize: '600px 160px',
          backgroundPosition: `${index * 83}px ${index * 17}px`,
          backgroundRepeat: 'repeat',
          clipPath: 'polygon(1% 10%, 7% 3%, 15% 8%, 24% 2%, 34% 7%, 45% 1%, 56% 6%, 68% 2%, 80% 7%, 91% 2%, 99% 9%, 98% 88%, 90% 96%, 79% 91%, 67% 98%, 54% 92%, 42% 98%, 29% 91%, 16% 97%, 2% 90%)',
          opacity: bandT,
          transform: `translateY(${28 * (1 - bandT)}px) rotate(${rotation}deg) scaleX(${0.72 + 0.28 * bandT})`,
          transformOrigin: 'center bottom',
          filter: 'drop-shadow(0 12px 11px rgba(45, 32, 22, 0.16))',
          fontFamily: brand.fontFamily,
          fontSize: fitFont(level.title, count === 5 ? 44 : 51, 7, 34),
          fontWeight: 1000,
          letterSpacing: 3,
          whiteSpace: 'nowrap',
        }}
      >
        {level.title}
      </div>

      <div
        style={{
          position: 'absolute',
          left: lineLeft,
          top: top + height / 2 - 2,
          width: lineWidth,
          height: 5,
          backgroundColor: brand.colors.brick,
          clipPath: 'polygon(0 38%, 20% 8%, 44% 38%, 68% 0, 100% 42%, 87% 88%, 53% 61%, 18% 100%)',
          opacity: 0.74 * noteT,
          transform: `rotate(${noteOnLeft ? -1.5 : 1.5}deg) scaleX(${noteT})`,
          transformOrigin: noteOnLeft ? 'right center' : 'left center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: noteLeft,
          top: top + height / 2 - 36,
          width: noteWidth,
          color: brand.colors.brick,
          fontFamily: brand.fontFamily,
          fontSize: fitFont(level.note, count === 5 ? 24 : 27, 10, 20),
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1.25,
          textAlign: noteOnLeft ? 'right' : 'left',
          whiteSpace: 'nowrap',
          opacity: noteT,
          transform: `translateX(${(noteOnLeft ? 18 : -18) * (1 - noteT)}px)`,
        }}
      >
        {level.note}
      </div>
    </>
  );
};

export const LayeredPyramid: React.FC<LayeredPyramidProps> = ({title, subtitle = '', levels}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (levels.length < 3 || levels.length > 5) {
    throw new Error('LayeredPyramid 需要 3—5 个层级。');
  }

  const count = levels.length;
  const height = count === 5 ? 108 : 126;
  const stepY = count === 5 ? 112 : 124;
  const startTop = count === 5 ? (subtitle ? 330 : 300) : (subtitle ? 365 : 330);
  const topWidth = count === 5 ? 300 : 340;
  const widthStep = count === 5 ? 185 : count === 4 ? 250 : 330;
  const titleT = enter(frame, 4, 20);
  const subtitleT = enter(frame, 19, 18);
  const bottomUpOrder = levels.map((_, index) => count - 1 - index);
  const bandStarts = levels.map((_, index) => 31 + bottomUpOrder[index] * 25);
  const bandProgress = bandStarts.map((start) => spring({frame: frame - start, fps, config: {damping: 14, stiffness: 135, mass: 0.78}}));
  const noteProgress = bandStarts.map((start) => enter(frame, start + 14, 17));

  return (
    <BrandBackground>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 82,
          width: 1450,
          transform: `translateX(-50%) translateY(${22 * (1 - titleT)}px)`,
          color: brand.colors.ink,
          fontFamily: brand.fontFamily,
          fontSize: fitFont(title, 66, 18, 47),
          fontWeight: 1000,
          letterSpacing: 1,
          lineHeight: 1.1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          opacity: titleT,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            position: 'absolute',
            left: 960,
            top: 178,
            transform: `translateX(-50%) translateY(${14 * (1 - subtitleT)}px) rotate(-1deg)`,
            color: brand.colors.brick,
            fontFamily: brand.fontFamily,
            fontSize: fitFont(subtitle, 30, 20, 24),
            fontWeight: 900,
            letterSpacing: 3,
            whiteSpace: 'nowrap',
            opacity: subtitleT,
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {levels.map((level, index) => (
        <PyramidBand
          key={`${level.title}-${index}`}
          level={level}
          index={index}
          count={count}
          top={startTop + index * stepY}
          width={topWidth + index * widthStep}
          height={height}
          bandT={bandProgress[index]}
          noteT={noteProgress[index]}
        />
      ))}
    </BrandBackground>
  );
};
