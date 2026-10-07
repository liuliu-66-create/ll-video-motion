import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand} from '../styles/brand';

export type ChapterTransitionVariant = 'dark' | 'light' | 'split';

export type ChapterTransitionCandidateProps = {
  sectionNumber: string;
  title: string;
  variant: ChapterTransitionVariant;
};

const horizontalTear =
  'polygon(0 9%, 3% 5%, 7% 8%, 12% 3%, 18% 7%, 24% 2%, 31% 8%, 38% 3%, 45% 7%, 52% 2%, 59% 8%, 66% 3%, 73% 7%, 80% 2%, 87% 8%, 94% 3%, 100% 7%, 99% 91%, 95% 96%, 89% 92%, 83% 98%, 76% 93%, 69% 97%, 62% 92%, 55% 98%, 48% 93%, 41% 97%, 34% 92%, 27% 98%, 20% 93%, 13% 97%, 6% 92%, 1% 96%)';

const splitTear =
  'polygon(0 0, 94% 0, 97% 5%, 95% 11%, 98% 17%, 96% 24%, 99% 31%, 96% 38%, 98% 45%, 95% 52%, 99% 59%, 96% 66%, 98% 73%, 95% 80%, 98% 87%, 96% 94%, 99% 100%, 0 100%)';

const titleFontSize = (title: string) => {
  if (title.length <= 7) return 132;
  if (title.length <= 10) return 112;
  if (title.length <= 14) return 92;
  return 76;
};

const PaperTexture: React.FC<{dark?: boolean; style?: React.CSSProperties}> = ({dark = false, style}) => (
  <div
    style={{
      position: 'absolute',
      backgroundColor: dark ? '#1d1a17' : '#eee4d1',
      backgroundImage: `url(${staticFile(dark ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`,
      backgroundSize: dark ? '460px 460px' : '520px 320px',
      backgroundBlendMode: dark ? 'screen' : 'multiply',
      ...style,
    }}
  />
);

const NumberText: React.FC<{
  value: string;
  color: string;
  progress: number;
  exit: number;
  left: number;
  top: number;
  width: number;
}> = ({value, color, progress, exit, left, top, width}) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width,
      height: 820,
      display: 'grid',
      placeItems: 'center',
      color,
      fontFamily: 'Georgia, Times New Roman, serif',
      fontSize: value.length > 1 ? 680 : 730,
      fontWeight: 900,
      lineHeight: 0.88,
      letterSpacing: -54,
      backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`,
      backgroundSize: '520px 520px',
      backgroundBlendMode: 'soft-light',
      textShadow: '9px 13px 0 rgba(35, 26, 20, 0.1)',
      opacity: progress * exit,
      transform: `translateX(${-110 * (1 - progress) - 24 * (1 - exit)}px) scale(${0.68 + 0.32 * progress}) rotate(${-3.5 * (1 - progress)}deg)`,
      transformOrigin: '48% 58%',
    }}
  >
    {value}
  </div>
);

const TitleStrip: React.FC<{
  title: string;
  paperProgress: number;
  titleProgress: number;
  exit: number;
  left: number;
  top: number;
  width: number;
}> = ({title, paperProgress, titleProgress, exit, left, top, width}) => (
  <div style={{position: 'absolute', left, top, width, height: 282, opacity: exit}}>
    <div
      style={{
        position: 'absolute',
        inset: '17px -8px -18px 12px',
        background: 'rgba(31, 24, 19, 0.24)',
        clipPath: horizontalTear,
        filter: 'blur(5px)',
        opacity: paperProgress,
        transform: `translateY(${8 * (1 - paperProgress)}px) scaleX(${0.08 + 0.92 * paperProgress})`,
        transformOrigin: '0 50%',
      }}
    />
    <PaperTexture
      style={{
        inset: 0,
        clipPath: horizontalTear,
        filter: 'drop-shadow(0 16px 11px rgba(39, 28, 20, 0.18))',
        opacity: paperProgress,
        transform: `translateX(${80 * (1 - paperProgress)}px) scaleX(${0.08 + 0.92 * paperProgress})`,
        transformOrigin: '0 50%',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '22px 60px 28px',
        boxSizing: 'border-box',
        color: brand.colors.ink,
        fontFamily: brand.fontFamily,
        fontSize: titleFontSize(title),
        fontWeight: 1000,
        lineHeight: 1,
        letterSpacing: -6,
        whiteSpace: 'nowrap',
        opacity: titleProgress,
        transform: `translateY(${42 * (1 - titleProgress)}px) scale(${0.82 + 0.18 * titleProgress})`,
        transformOrigin: '50% 70%',
      }}
    >
      {title}
    </div>
  </div>
);

export const ChapterTransitionCandidate: React.FC<ChapterTransitionCandidateProps> = ({sectionNumber, title, variant}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const numberProgress = spring({frame: frame - 7, fps, config: {damping: 10, stiffness: 130, mass: 0.72}});
  const paperProgress = spring({frame: frame - 27, fps, config: {damping: 15, stiffness: 118, mass: 0.8}});
  const titleProgress = spring({frame: frame - 43, fps, config: {damping: 11, stiffness: 150, mass: 0.65}});
  const splitProgress = spring({frame: frame - 1, fps, config: {damping: 18, stiffness: 95, mass: 0.9}});
  const exit = interpolate(frame, [126, 149], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const backgroundScale = interpolate(frame, [0, 149], [1.035, 1]);

  if (variant === 'split') {
    return (
      <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#e7ddca'}}>
        <Img src={staticFile(brand.backgroundAsset)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `scale(${backgroundScale})`}} />
        <PaperTexture
          dark
          style={{
            left: 0,
            top: 0,
            width: 805,
            height: 1080,
            clipPath: splitTear,
            opacity: splitProgress * exit,
            transform: `translateX(${-100 * (1 - splitProgress)}px) scaleX(${0.82 + 0.18 * splitProgress})`,
            transformOrigin: '0 50%',
            boxShadow: '20px 0 35px rgba(24, 18, 14, 0.22)',
          }}
        />
        <NumberText value={sectionNumber} color="#eee3d0" progress={numberProgress} exit={exit} left={55} top={105} width={650} />
        <div
          style={{
            position: 'absolute',
            left: 830,
            top: 345,
            width: 1035,
            height: 390,
            background: 'rgba(239, 231, 215, 0.84)',
            backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`,
            backgroundSize: '520px 320px',
            clipPath: horizontalTear,
            opacity: paperProgress * exit,
            transform: `translateX(${92 * (1 - paperProgress)}px) scaleX(${0.12 + 0.88 * paperProgress})`,
            transformOrigin: '0 50%',
            filter: 'drop-shadow(0 14px 10px rgba(43, 31, 22, 0.12))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 850,
            top: 425,
            width: 990,
            height: 225,
            display: 'grid',
            placeItems: 'center',
            color: brand.colors.ink,
            fontFamily: brand.fontFamily,
            fontSize: titleFontSize(title),
            fontWeight: 1000,
            letterSpacing: -6,
            whiteSpace: 'nowrap',
            opacity: titleProgress * exit,
            transform: `translateY(${44 * (1 - titleProgress)}px) scale(${0.82 + 0.18 * titleProgress})`,
          }}
        >
          {title}
        </div>
      </AbsoluteFill>
    );
  }

  const dark = variant === 'dark';
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: dark ? '#1c1916' : brand.colors.background}}>
      <Img
        src={staticFile(brand.backgroundAsset)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: `scale(${backgroundScale})`,
          filter: dark ? 'grayscale(1) sepia(.18) brightness(.25) contrast(1.55)' : 'sepia(.12) contrast(1.04)',
        }}
      />
      {dark ? <AbsoluteFill style={{background: 'rgba(18, 15, 13, 0.28)'}} /> : null}
      <NumberText value={sectionNumber} color={dark ? '#eee3d0' : '#ad3a2d'} progress={numberProgress} exit={exit} left={70} top={100} width={650} />
      <TitleStrip title={title} paperProgress={paperProgress} titleProgress={titleProgress} exit={exit} left={790} top={398} width={1130} />
    </AbsoluteFill>
  );
};
