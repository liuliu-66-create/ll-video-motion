import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

export type ScreenRecordingTransitionProps = {
  title: string;
  videoSrc: string;
  videoWidth?: number;
  videoHeight?: number;
  icon?: 'cursor' | 'hand' | 'keyboard' | 'magnifier' | 'gear' | 'play';
};

type Crop = {x: number; y: number; width: number; height: number};

const sheet = {width: 1672, height: 941};
const titlePlateWidth = 480;
const titleSafeAreaInCrop = {left: 45, top: 88, width: 475, height: 175};
const titleScale = titlePlateWidth / 565;
const crops: Record<NonNullable<ScreenRecordingTransitionProps['icon']> | 'arrow' | 'title', Crop> = {
  cursor: {x: 35, y: 55, width: 345, height: 445},
  hand: {x: 410, y: 45, width: 350, height: 475},
  keyboard: {x: 790, y: 70, width: 375, height: 425},
  magnifier: {x: 1210, y: 55, width: 390, height: 445},
  gear: {x: 30, y: 535, width: 360, height: 350},
  play: {x: 405, y: 555, width: 340, height: 315},
  arrow: {x: 715, y: 540, width: 405, height: 315},
  title: {x: 1085, y: 535, width: 565, height: 325},
};

const enter = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const InkText: React.FC<{text: string}> = ({text}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span>{text}</span>
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        backgroundImage: `url("${staticFile('assets/distressed-ink-wear-v1.png')}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '310px 165px',
        backgroundPosition: '9px 6px',
        opacity: 0.52,
        pointerEvents: 'none',
      }}
    >
      {text}
    </span>
  </span>
);

const Sprite: React.FC<{crop: Crop; width: number}> = ({crop, width}) => {
  const scale = width / crop.width;
  return (
    <div style={{position: 'relative', width, height: crop.height * scale, overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/screen-recording-components-sprites-v1.png')}
        style={{
          position: 'absolute',
          width: sheet.width * scale,
          height: sheet.height * scale,
          maxWidth: 'none',
          left: -crop.x * scale,
          top: -crop.y * scale,
        }}
      />
    </div>
  );
};

export const ScreenRecordingTransition: React.FC<ScreenRecordingTransitionProps> = ({
  title,
  videoSrc,
  videoWidth = 1658,
  videoHeight = 1080,
  icon = 'cursor',
}) => {
  const frame = useCurrentFrame();
  const titleT = enter(frame, 4, 20);
  const iconT = enter(frame, 20, 18);
  const arrowT = enter(frame, 31, 17);
  const recordingT = enter(frame, 38, 24);

  const sourceRatio = Math.max(videoWidth, 1) / Math.max(videoHeight, 1);
  const maxRecording = {right: 1900, width: 1320, height: 860};
  const fittedWidth = Math.min(maxRecording.width, maxRecording.height * sourceRatio);
  const fittedHeight = fittedWidth / sourceRatio;
  const recordingBox = {
    left: maxRecording.right - fittedWidth,
    top: (1080 - fittedHeight) / 2,
    width: fittedWidth,
    height: fittedHeight,
  };
  const recordingStart = 38;

  return (
    <AbsoluteFill style={{backgroundColor: '#d9d6cf', overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/newspaper-neutral-v1.png')}
        style={{position: 'absolute', left: -180, top: -10, width: 2110, height: 1187, objectFit: 'cover'}}
      />

      <div
        style={{
          position: 'absolute',
          left: 5,
          top: 285,
          width: titlePlateWidth,
          zIndex: 3,
          opacity: titleT,
          transform: `translateX(${-42 * (1 - titleT)}px) rotate(${-1.4 + 1.4 * titleT}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Sprite crop={crops.title} width={titlePlateWidth} />
        <div
          style={{
            position: 'absolute',
            left: titleSafeAreaInCrop.left * titleScale,
            top: titleSafeAreaInCrop.top * titleScale,
            width: titleSafeAreaInCrop.width * titleScale,
            height: titleSafeAreaInCrop.height * titleScale,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            color: '#11100e',
            fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
            fontWeight: 900,
            fontSize: Math.min(79, 350 / Math.max(title.length, 1)),
            letterSpacing: -3,
            textShadow: '0.7px 0 #11100e, -0.7px 0 #11100e',
          }}
        >
          <InkText text={title} />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 78,
          top: 570,
          width: 250,
          zIndex: 4,
          opacity: iconT,
          transform: `translateY(${25 * (1 - iconT)}px) scale(${0.82 + 0.18 * iconT}) rotate(${-4 * (1 - iconT)}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Sprite crop={crops[icon]} width={250} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 288,
          top: 515,
          width: 250,
          zIndex: 4,
          clipPath: 'polygon(0% 34%, 57% 34%, 57% 5%, 100% 50%, 57% 95%, 57% 68%, 0% 68%)',
          opacity: arrowT,
          transform: `translateX(${-38 * (1 - arrowT)}px) scaleX(${0.82 + 0.18 * arrowT}) rotate(-2deg)`,
          transformOrigin: 'left center',
        }}
      >
        <Sprite crop={crops.arrow} width={250} />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: recordingT,
          transform: `translateX(${54 * (1 - recordingT)}px) scale(${0.988 + 0.012 * recordingT})`,
          transformOrigin: '64% 50%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            ...recordingBox,
            overflow: 'hidden',
            borderRadius: 12,
            backgroundColor: '#d2cec5',
          }}
        >
          <Sequence from={recordingStart} layout="none">
            <OffthreadVideo
              src={staticFile(videoSrc)}
              volume={0.9}
              style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill'}}
            />
          </Sequence>
        </div>
      </div>
    </AbsoluteFill>
  );
};
