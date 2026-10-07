import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type ChapterTransitionReferenceStillProps = {
  sectionNumber: string;
  title: string;
  animated?: boolean;
};

export const DistressedNumber: React.FC<{value: string; progress: number; exit: number}> = ({value, progress, exit}) => {
  const distressTexture = staticFile('assets/distressed-ink-wear-v1.png');
  const tiles = Array.from({length: 10}, (_, index) => ({
    x: (index % 2) * 434,
    y: Math.floor(index / 2) * 217,
  }));
  const broadWearTiles = Array.from({length: 8}, (_, index) => ({
    x: -70 + (index % 2) * 520,
    y: -35 + Math.floor(index / 2) * 265,
  }));

  return (
    <svg
      viewBox="0 0 700 860"
      style={{
        position: 'absolute',
        left: 116,
        top: 96,
        width: 665,
        height: 875,
        overflow: 'visible',
        opacity: progress * exit,
        transform: `translateX(${-135 * (1 - progress)}px) scale(${0.72 + 0.28 * progress}) rotate(${-3.2 * (1 - progress)}deg)`,
        transformOrigin: '48% 58%',
      }}
    >
      <defs>
        <mask id="number-glyph" x="-120" y="-120" width="980" height="1100" maskUnits="userSpaceOnUse">
          <rect x="-120" y="-120" width="980" height="1100" fill="black" />
          <text
            x="0"
            y="820"
            fill="white"
            fontFamily="Impact, Arial Black, sans-serif"
            fontSize="900"
            fontWeight="400"
            textLength="760"
            lengthAdjust="spacingAndGlyphs"
            transform="matrix(.82 0 0 1.28 0 -205)"
          >
            {value}
          </text>
        </mask>
        <mask id="number-wear" x="0" y="0" width="780" height="900" maskUnits="userSpaceOnUse" style={{maskType: 'luminance'}}>
          <rect width="780" height="900" fill="black" />
          {tiles.map((tile, index) => (
            <image key={index} href={distressTexture} x={tile.x} y={tile.y} width="434" height="217" preserveAspectRatio="none" />
          ))}
          <g style={{mixBlendMode: 'screen'}}>
            {broadWearTiles.map((tile, index) => (
              <image key={`broad-${index}`} href={distressTexture} x={tile.x} y={tile.y} width="520" height="260" preserveAspectRatio="none" />
            ))}
          </g>
        </mask>
      </defs>
      <g mask="url(#number-glyph)">
        <rect x="-80" y="-120" width="900" height="1100" fill="#ece1cd" />
        <rect x="-80" y="-120" width="900" height="1100" fill="#1b1714" mask="url(#number-wear)" />
      </g>
    </svg>
  );
};

const TornTitlePaper: React.FC<{title: string; paperProgress: number; titleProgress: number; exit: number}> = ({
  title,
  paperProgress,
  titleProgress,
  exit,
}) => {
  const sourceWidth = 1672;
  const sourceHeight = 941;
  const crop = {x: 535, y: 78, width: 1137, height: 270};
  const targetWidth = 1350;
  const targetHeight = 267;
  const scaleX = targetWidth / crop.width;
  const scaleY = targetHeight / crop.height;

  return (
    <div
      style={{
        position: 'absolute',
        left: 840,
        top: 395,
        width: targetWidth,
        height: targetHeight,
        overflow: 'hidden',
        filter: 'drop-shadow(0 17px 10px rgba(0, 0, 0, .34)) saturate(.58) sepia(.13) brightness(.91)',
        opacity: paperProgress * exit,
        transform: `translateX(${150 * (1 - paperProgress)}px) scaleX(${0.38 + 0.62 * paperProgress})`,
        transformOrigin: '100% 50%',
      }}
    >
      <Img
        src={staticFile('assets/multi-point-torn-paper-sprites-v1.png')}
        style={{
          position: 'absolute',
          width: sourceWidth * scaleX,
          height: sourceHeight * scaleY,
          maxWidth: 'none',
          left: -crop.x * scaleX,
          top: -crop.y * scaleY,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 10,
          top: 12,
          bottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: 72,
          boxSizing: 'border-box',
          color: '#171512',
          fontFamily: 'Noto Sans SC, Microsoft YaHei, SimHei, sans-serif',
          fontSize: title.length <= 7 ? 144 : title.length <= 10 ? 116 : 92,
          fontWeight: 900,
          letterSpacing: -5,
          whiteSpace: 'nowrap',
          lineHeight: 1,
          opacity: titleProgress,
          transform: `translateY(${-8 + 42 * (1 - titleProgress)}px) scaleX(1.1) scale(${0.82 + 0.18 * titleProgress})`,
          transformOrigin: '0 50%',
        }}
      >
        {title}
      </div>
    </div>
  );
};

export const ChapterTransitionReferenceStill: React.FC<ChapterTransitionReferenceStillProps> = ({sectionNumber, title, animated = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const numberProgress = animated
    ? spring({frame: frame - 6, fps, config: {damping: 10, stiffness: 135, mass: 0.72}})
    : 1;
  const paperProgress = animated
    ? spring({frame: frame - 27, fps, config: {damping: 15, stiffness: 120, mass: 0.8}})
    : 1;
  const titleProgress = animated
    ? spring({frame: frame - 43, fps, config: {damping: 10, stiffness: 155, mass: 0.66}})
    : 1;
  const exit = animated
    ? interpolate(frame, [126, 149], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  const backgroundScale = animated ? interpolate(frame, [0, 149], [1.025, 1]) : 1.012;

  return (
  <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#181512', opacity: exit}}>
    <Img
      src={staticFile('assets/newspaper-neutral-v1.png')}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        filter: 'invert(1) grayscale(1) sepia(.58) saturate(.62) brightness(.68) contrast(1.14)',
        transform: `scale(${backgroundScale})`,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 48% 48%, rgba(104, 83, 62, .03) 0%, rgba(13, 11, 10, .05) 70%, rgba(5, 4, 3, .13) 100%)',
      }}
    />
    <Img
      src={staticFile('assets/paper-fiber-texture-v1.png')}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.2,
        mixBlendMode: 'overlay',
      }}
    />
    <DistressedNumber value={sectionNumber} progress={numberProgress} exit={exit} />
    <TornTitlePaper title={title} paperProgress={paperProgress} titleProgress={titleProgress} exit={exit} />
  </AbsoluteFill>
  );
};
