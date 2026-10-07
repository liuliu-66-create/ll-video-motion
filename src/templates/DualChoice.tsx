import React from 'react';
import {Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop, type SpriteCropRect} from '../components/SpriteCrop';
import {brand} from '../styles/brand';

export type DualChoiceProps = {
  title: string;
  leftEyebrow: string;
  leftTitle: string;
  leftImageSrc?: string;
  rightEyebrow: string;
  rightTitle: string;
  rightImageSrc?: string;
  connector?: string;
  footer?: string;
  footerMarker?: string;
  durationSeconds?: number;
};

type Side = 'left' | 'right';

const productionSheet = {
  asset: 'assets/production-icons.png',
  width: 2048,
  height: 2048,
};

const fallbackArtCrops: Record<Side, SpriteCropRect> = {
  left: {x: 0, y: 0, width: 1024, height: 1024},
  right: {x: 1024, y: 0, width: 1024, height: 1024},
};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(text.length, safeChars)));

const enter = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const ChoiceArtwork: React.FC<{side: Side; imageSrc?: string}> = ({side, imageSrc}) => (
  <div
    style={{
      position: 'relative',
      width: 350,
      height: 350,
      borderRadius: '50%',
      background: brand.colors.brick,
      boxShadow: '0 18px 32px rgba(58, 42, 30, 0.14)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: -18,
        border: '2px solid rgba(154, 56, 45, 0.45)',
        borderRadius: '48% 53% 46% 55%',
        transform: `rotate(${side === 'left' ? -7 : 8}deg)`,
      }}
    />
    {imageSrc ? (
      <Img
        src={staticFile(imageSrc)}
        style={{
          position: 'absolute',
          left: -30,
          top: -30,
          width: 410,
          height: 410,
          objectFit: 'contain',
          filter: 'drop-shadow(0 15px 9px rgba(45, 32, 22, 0.2))',
        }}
      />
    ) : (
      <SpriteCrop
        asset={productionSheet.asset}
        sheetWidth={productionSheet.width}
        sheetHeight={productionSheet.height}
        crop={fallbackArtCrops[side]}
        width={420}
        style={{
          position: 'absolute',
          left: -42,
          top: -38,
          transform: `rotate(${side === 'left' ? -5 : 5}deg)`,
          filter: 'drop-shadow(0 15px 9px rgba(45, 32, 22, 0.2))',
        }}
      />
    )}
  </div>
);

const KeywordPaper: React.FC<{text: string; side: Side}> = ({text, side}) => (
  <div style={{position: 'relative', width: 430, height: 124}}>
    <div
      style={{
        position: 'absolute',
        left: side === 'left' ? 20 : 8,
        top: 17,
        width: 402,
        height: 100,
        backgroundColor: brand.colors.brick,
        backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`,
        backgroundSize: '620px 620px',
        backgroundPosition: side === 'left' ? '18% 42%' : '72% 58%',
        backgroundBlendMode: 'soft-light',
        clipPath: 'polygon(2% 11%, 96% 2%, 100% 84%, 5% 100%)',
        transform: `rotate(${side === 'left' ? -2.2 : 2.2}deg)`,
        opacity: 0.72,
        filter: 'drop-shadow(0 9px 10px rgba(58, 42, 30, 0.12))',
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
        backgroundPosition: side === 'left' ? '-650px -430px' : '-790px -700px',
        backgroundRepeat: 'no-repeat',
        clipPath: 'polygon(1% 8%, 8% 3%, 19% 7%, 31% 2%, 43% 6%, 56% 1%, 69% 5%, 82% 2%, 99% 8%, 97% 89%, 87% 95%, 74% 91%, 60% 97%, 47% 92%, 32% 98%, 18% 92%, 2% 96%)',
        filter: 'drop-shadow(0 14px 12px rgba(58, 42, 30, 0.16))',
        fontFamily: brand.fontFamily,
        fontSize: fitFont(text, 66, 6, 46),
        fontWeight: 1000,
        letterSpacing: 3,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  </div>
);

const ChoiceColumn: React.FC<{
  side: Side;
  eyebrow: string;
  title: string;
  imageSrc?: string;
  artworkT: number;
  keywordT: number;
  eyebrowT: number;
}> = ({side, eyebrow, title, imageSrc, artworkT, keywordT, eyebrowT}) => {
  const left = side === 'left' ? 245 : 1245;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 392,
        width: 430,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity: artworkT,
          transform: `translateY(${42 * (1 - artworkT)}px) scale(${0.84 + 0.16 * artworkT}) rotate(${(side === 'left' ? -3 : 3) * (1 - artworkT)}deg)`,
          transformOrigin: 'center bottom',
        }}
      >
        <ChoiceArtwork side={side} imageSrc={imageSrc} />
      </div>
      <div
        style={{
          marginTop: 26,
          opacity: keywordT,
          transform: `translateY(${28 * (1 - keywordT)}px) scale(${0.9 + 0.1 * keywordT}) rotate(${(side === 'left' ? -2 : 2) * (1 - keywordT)}deg)`,
        }}
      >
        <KeywordPaper text={title} side={side} />
      </div>
      <div
        style={{
          width: 430,
          marginTop: 13,
          color: brand.colors.brick,
          fontFamily: brand.fontFamily,
          fontSize: fitFont(eyebrow, 31, 11, 24),
          fontWeight: 900,
          letterSpacing: 2,
          lineHeight: 1.25,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          opacity: eyebrowT,
          transform: `translateY(${16 * (1 - eyebrowT)}px)`,
        }}
      >
        {eyebrow}
      </div>
    </div>
  );
};

const ForkPath: React.FC<{connector: string; pathT: number; connectorT: number}> = ({connector, pathT, connectorT}) => (
  <>
    <svg
      width="1920"
      height="1080"
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0}}
      aria-hidden="true"
    >
      <path
        d="M960 278 C960 322 960 344 960 368 C960 403 900 414 828 425 C720 441 638 453 548 480"
        fill="none"
        stroke="rgba(239, 231, 215, 0.9)"
        strokeWidth="13"
        strokeLinecap="round"
        opacity={pathT}
      />
      <path
        d="M960 278 C960 322 960 344 960 368 C960 403 1020 414 1092 425 C1200 441 1282 453 1372 480"
        fill="none"
        stroke="rgba(239, 231, 215, 0.9)"
        strokeWidth="13"
        strokeLinecap="round"
        opacity={pathT}
      />
      <path
        d="M960 278 C960 322 960 344 960 368 C960 403 900 414 828 425 C720 441 638 453 548 480"
        fill="none"
        stroke={brand.colors.brick}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="15 9"
        strokeDashoffset={28 * (1 - pathT)}
        opacity={pathT}
      />
      <path
        d="M960 278 C960 322 960 344 960 368 C960 403 1020 414 1092 425 C1200 441 1282 453 1372 480"
        fill="none"
        stroke={brand.colors.brick}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="15 9"
        strokeDashoffset={-28 * (1 - pathT)}
        opacity={pathT}
      />
      <circle cx="548" cy="480" r={10 * pathT} fill={brand.colors.brick} />
      <circle cx="1372" cy="480" r={10 * pathT} fill={brand.colors.brick} />
    </svg>
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: 366,
        width: 102,
        height: 102,
        transform: `translate(-50%, -50%) rotate(${-8 + 6 * connectorT}deg) scale(${0.62 + 0.38 * connectorT})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        color: brand.colors.paper,
        background: brand.colors.ink,
        boxShadow: '0 11px 20px rgba(45, 32, 22, 0.17)',
        fontFamily: brand.fontFamily,
        fontSize: fitFont(connector, 42, 2, 30),
        fontWeight: 1000,
        opacity: connectorT,
      }}
    >
      {connector}
    </div>
  </>
);

export const DualChoice: React.FC<DualChoiceProps> = ({
  title,
  leftEyebrow,
  leftTitle,
  leftImageSrc,
  rightEyebrow,
  rightTitle,
  rightImageSrc,
  connector = '或',
  footer = '',
  footerMarker = '!',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleT = enter(frame, 4, 20);
  const underlineT = enter(frame, 22, 15);
  const pathT = enter(frame, 29, 24);
  const connectorT = spring({frame: frame - 35, fps, config: {damping: 13, stiffness: 150, mass: 0.72}});
  const leftArtworkT = spring({frame: frame - 49, fps, config: {damping: 15, stiffness: 120, mass: 0.8}});
  const rightArtworkT = spring({frame: frame - 57, fps, config: {damping: 15, stiffness: 120, mass: 0.8}});
  const leftKeywordT = spring({frame: frame - 75, fps, config: {damping: 12, stiffness: 165, mass: 0.7}});
  const rightKeywordT = spring({frame: frame - 83, fps, config: {damping: 12, stiffness: 165, mass: 0.7}});
  const leftEyebrowT = enter(frame, 92, 16);
  const rightEyebrowT = enter(frame, 100, 16);
  const footerT = enter(frame, 115, 20);

  return (
  <BrandBackground>
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: 112,
        width: 1280,
        transform: `translateX(-50%) translateY(${24 * (1 - titleT)}px)`,
        color: brand.colors.ink,
        fontFamily: brand.fontFamily,
        fontSize: fitFont(title, 76, 15, 54),
        fontWeight: 1000,
        letterSpacing: 3,
        lineHeight: 1.1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        opacity: titleT,
      }}
    >
      {title}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 830,
        top: 224,
        width: 260,
        height: 7,
        background: brand.colors.brick,
        clipPath: 'polygon(0 38%, 19% 8%, 43% 32%, 67% 0, 100% 45%, 88% 88%, 52% 62%, 21% 100%)',
        transform: `rotate(-1deg) scaleX(${underlineT})`,
        transformOrigin: 'left center',
        opacity: underlineT,
      }}
    />

    <ForkPath connector={connector} pathT={pathT} connectorT={connectorT} />
    <ChoiceColumn side="left" eyebrow={leftEyebrow} title={leftTitle} imageSrc={leftImageSrc} artworkT={leftArtworkT} keywordT={leftKeywordT} eyebrowT={leftEyebrowT} />
    <ChoiceColumn side="right" eyebrow={rightEyebrow} title={rightTitle} imageSrc={rightImageSrc} artworkT={rightArtworkT} keywordT={rightKeywordT} eyebrowT={rightEyebrowT} />

    {footer ? (
      <div
        style={{
          position: 'absolute',
          left: 960,
          bottom: 54,
          width: 1140,
          transform: `translateX(-50%) translateY(${18 * (1 - footerT)}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          color: brand.colors.ink,
          fontFamily: brand.fontFamily,
          fontSize: fitFont(footer, 38, 19, 30),
          fontWeight: 900,
          letterSpacing: 3,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          opacity: footerT,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            width: 54,
            height: 54,
            flex: '0 0 auto',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: brand.colors.paper,
            background: brand.colors.brick,
            fontFamily: brand.fontFamily,
            fontSize: 36,
            transform: 'rotate(-4deg)',
          }}
        >
          {footerMarker}
        </span>
        <span>{footer}</span>
      </div>
    ) : null}
  </BrandBackground>
  );
};
