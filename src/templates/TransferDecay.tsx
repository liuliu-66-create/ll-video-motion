import React from 'react';
import {Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {brand} from '../styles/brand';

export type TransferDecayLevel = {
  title: string;
  value: string;
  note: string;
  resourceCount: number;
};

export type TransferDecayProps = {
  title: string;
  subtitle?: string;
  levels: TransferDecayLevel[];
  lossLabels?: string[];
};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const enter = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const positions4 = [
  {left: 80, top: 285},
  {left: 515, top: 405},
  {left: 950, top: 525},
  {left: 1385, top: 645},
];

const positions3 = [
  {left: 155, top: 300},
  {left: 795, top: 505},
  {left: 1435, top: 710},
];

const positions5 = [
  {left: 25, top: 300},
  {left: 395, top: 410},
  {left: 765, top: 520},
  {left: 1135, top: 630},
  {left: 1505, top: 740},
];

const keywordTexturePositions = ['-640px -430px', '-760px -700px', '-610px -445px', '-785px -690px', '-670px -420px'];

const KeywordPaper: React.FC<{text: string; index: number}> = ({text, index}) => (
  <div style={{position: 'relative', width: 290, height: 92}}>
    <div
      style={{
        position: 'absolute',
        left: 11,
        top: 13,
        width: 274,
        height: 73,
        backgroundColor: brand.colors.brick,
        backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`,
        backgroundSize: '560px 560px',
        backgroundPosition: `${20 + index * 13}% ${42 + index * 7}%`,
        backgroundBlendMode: 'soft-light',
        clipPath: 'polygon(2% 8%, 96% 1%, 100% 84%, 5% 100%)',
        opacity: 0.76,
        transform: `rotate(${index % 2 === 0 ? -2.2 : 2.2}deg)`,
        filter: 'drop-shadow(0 8px 9px rgba(58, 42, 30, 0.13))',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: brand.colors.ink,
        backgroundColor: brand.colors.paper,
        backgroundImage: `url(${staticFile('assets/multi-point-torn-paper-sprites-v1.png')})`,
        backgroundSize: '1672px 941px',
        backgroundPosition: keywordTexturePositions[index % keywordTexturePositions.length],
        backgroundRepeat: 'no-repeat',
        clipPath: 'polygon(1% 10%, 10% 3%, 23% 8%, 37% 2%, 51% 7%, 67% 1%, 81% 6%, 99% 3%, 97% 88%, 85% 96%, 69% 91%, 53% 98%, 36% 92%, 19% 98%, 2% 91%)',
        filter: 'drop-shadow(0 11px 10px rgba(58, 42, 30, 0.16))',
        fontFamily: brand.fontFamily,
        fontSize: fitFont(text, 58, 4, 42),
        fontWeight: 1000,
        letterSpacing: 2,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  </div>
);

const BanknoteStack: React.FC<{count: number}> = ({count}) => {
  const safeCount = Math.max(1, Math.min(6, Math.round(count)));
  const width = 176;
  const step = 25;
  return (
    <div style={{position: 'relative', width: width + step * (safeCount - 1), height: 110}}>
      {Array.from({length: safeCount}, (_, index) => (
        <SpriteCrop
          key={index}
          asset="assets/banknote-collage-v1.png"
          sheetWidth={1536}
          sheetHeight={1024}
          crop={{x: 0, y: 145, width: 1536, height: 740}}
          width={width}
          style={{
            position: 'absolute',
            left: index * step,
            top: index * 5,
            transform: `rotate(${-5 + index * 2.2}deg)`,
            transformOrigin: 'center',
            filter: 'drop-shadow(-3px 6px 4px rgba(45, 32, 22, 0.24))',
          }}
        />
      ))}
    </div>
  );
};

const PaperArrow: React.FC<{left: number; top: number; width: number; label?: string; index: number; progress: number}> = ({left, top, width, label, index, progress}) => (
  <>
    <div style={{position: 'absolute', left, top, opacity: progress, transform: `translateX(${-34 * (1 - progress)}px) rotate(${index % 2 === 0 ? 3 : -1}deg) scale(${0.82 + 0.18 * progress})`, transformOrigin: 'left center'}}>
      <SpriteCrop
        asset="assets/paper-arrow-down-right-v1.png"
        sheetWidth={1774}
        sheetHeight={887}
        crop={{x: 88, y: 103, width: 1627, height: 689}}
        width={width}
        style={{filter: 'drop-shadow(0 7px 5px rgba(45, 32, 22, 0.18))'}}
      />
    </div>
    {label ? (
      <div
        style={{
          position: 'absolute',
          left: left - 10,
          top: top - 34,
          width: width + 16,
          color: brand.colors.brick,
          fontFamily: brand.fontFamily,
          fontSize: fitFont(label, 23, 7, 18),
          fontWeight: 900,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          opacity: progress,
          transform: `translateY(${12 * (1 - progress)}px) rotate(${index % 2 === 0 ? -2 : 2}deg)`,
        }}
      >
        {label}
      </div>
    ) : null}
  </>
);

export const TransferDecay: React.FC<TransferDecayProps> = ({title, subtitle = '', levels, lossLabels = []}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (levels.length < 3 || levels.length > 5) {
    throw new Error('TransferDecay 需要 3—5 个传递层级。');
  }
  if (lossLabels.length > 0 && lossLabels.length !== levels.length - 1) {
    throw new Error('lossLabels 数量必须比 levels 少 1。');
  }

  const visiblePositions = levels.length === 3 ? positions3 : levels.length === 4 ? positions4 : positions5;
  const compactScale = levels.length === 5 ? 0.78 : 1;
  const arrowWidth = levels.length === 3 ? 230 : levels.length === 5 ? 126 : 164;
  const titleT = enter(frame, 4, 20);
  const subtitleT = enter(frame, 19, 18);
  const levelStarts = levels.map((_, index) => 30 + index * 31);
  const levelProgress = levelStarts.map((start) => spring({frame: frame - start, fps, config: {damping: 15, stiffness: 125, mass: 0.78}}));
  const arrowProgress = levels.slice(0, -1).map((_, index) => enter(frame, levelStarts[index] + 18, 18));

  return (
    <BrandBackground>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 82,
          width: 1500,
          transform: `translateX(-50%) translateY(${22 * (1 - titleT)}px)`,
          color: brand.colors.ink,
          fontFamily: brand.fontFamily,
          fontSize: fitFont(title, 65, 20, 46),
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
            fontSize: fitFont(subtitle, 30, 22, 24),
            fontWeight: 900,
            letterSpacing: 3,
            whiteSpace: 'nowrap',
            opacity: subtitleT,
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {levels.slice(0, -1).map((_, index) => {
        const current = visiblePositions[index];
        const next = visiblePositions[index + 1];
        return (
          <PaperArrow
            key={`arrow-${index}`}
            left={current.left + 292 * compactScale}
            top={(current.top + next.top) / 2 + 58}
            width={arrowWidth}
            label={lossLabels[index]}
            index={index}
            progress={arrowProgress[index]}
          />
        );
      })}

      {levels.map((level, index) => {
        const position = visiblePositions[index];
        return (
          <div
            key={`${level.title}-${index}`}
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              width: 330,
              opacity: levelProgress[index],
              transform: `translateY(${38 * (1 - levelProgress[index])}px) scale(${compactScale * (0.86 + 0.14 * levelProgress[index])}) rotate(${(index % 2 === 0 ? -2.4 : 2.4) * (1 - levelProgress[index])}deg)`,
              transformOrigin: 'top left',
              fontFamily: brand.fontFamily,
            }}
          >
            <div
              style={{
                width: 330,
                color: brand.colors.ink,
                fontSize: fitFont(level.title, 34, 6, 27),
                fontWeight: 1000,
                letterSpacing: 2,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {level.title}
            </div>
            <div style={{height: 132, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <BanknoteStack count={level.resourceCount} />
            </div>
            <div style={{margin: '-2px auto 0', width: 290}}>
              <KeywordPaper text={level.value} index={index} />
            </div>
            <div
              style={{
                marginTop: 5,
                width: 330,
                color: brand.colors.brick,
                fontSize: fitFont(level.note, 26, 9, 21),
                fontWeight: 900,
                letterSpacing: 1,
                lineHeight: 1.25,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {level.note}
            </div>
          </div>
        );
      })}
    </BrandBackground>
  );
};
