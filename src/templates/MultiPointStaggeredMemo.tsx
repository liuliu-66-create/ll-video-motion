import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

type IconName = 'cursor' | 'hand' | 'keyboard' | 'magnifier' | 'gear' | 'play';

export type MultiPointStaggeredMemoItem = {
  text: string;
  icon?: IconName;
};

export type MultiPointStaggeredMemoProps = {
  items: MultiPointStaggeredMemoItem[];
  debug?: boolean;
};

type Placement = {left: number; top: number; width: number; rotate: number};
type MemoVariant = {
  crop: {x: number; y: number; width: number; height: number};
  numberCenter: {x: number; y: number};
  textCenter: {x: number; y: number};
  textSize: {width: number; height: number};
};

const memoSheet = {width: 2172, height: 724};
const iconSheet = {width: 1672, height: 941};

const memoVariants: MemoVariant[] = [
  {
    crop: {x: 0, y: 112, width: 724, height: 440},
    numberCenter: {x: 154, y: 215},
    textCenter: {x: 462, y: 228},
    textSize: {width: 370, height: 180},
  },
  {
    crop: {x: 724, y: 112, width: 724, height: 440},
    numberCenter: {x: 154, y: 215},
    textCenter: {x: 462, y: 228},
    textSize: {width: 420, height: 180},
  },
  {
    crop: {x: 1448, y: 112, width: 724, height: 440},
    numberCenter: {x: 154, y: 215},
    textCenter: {x: 462, y: 228},
    textSize: {width: 430, height: 180},
  },
];

const iconCrops: Record<IconName, {x: number; y: number; width: number; height: number}> = {
  cursor: {x: 35, y: 55, width: 345, height: 445},
  hand: {x: 410, y: 45, width: 350, height: 475},
  keyboard: {x: 790, y: 70, width: 375, height: 425},
  magnifier: {x: 1210, y: 55, width: 390, height: 445},
  gear: {x: 30, y: 535, width: 360, height: 350},
  play: {x: 405, y: 555, width: 340, height: 315},
};

const enter = (frame: number, at: number, duration = 18) =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const placementsFor = (count: number): Placement[] => {
  if (count === 2) {
    return [
      {left: 210, top: 70, width: 720, rotate: -1.6},
      {left: 990, top: 385, width: 720, rotate: 1.2},
    ];
  }
  if (count === 3) {
    return [
      {left: 125, top: 45, width: 680, rotate: -1.3},
      {left: 1110, top: 115, width: 680, rotate: 1.1},
      {left: 620, top: 420, width: 680, rotate: -0.7},
    ];
  }
  if (count === 4) {
    return [
      {left: 165, top: 35, width: 610, rotate: -1.2},
      {left: 1145, top: 45, width: 610, rotate: 0.8},
      {left: 255, top: 420, width: 610, rotate: 0.7},
      {left: 1055, top: 420, width: 610, rotate: -1},
    ];
  }
  if (count === 5) {
    return [
      {left: 95, top: 5, width: 520, rotate: -1.2},
      {left: 1305, top: 5, width: 520, rotate: 0.9},
      {left: 315, top: 255, width: 520, rotate: 0.8},
      {left: 1085, top: 255, width: 520, rotate: -0.9},
      {left: 700, top: 505, width: 520, rotate: 0.5},
    ];
  }
  return [
    {left: 95, top: 5, width: 520, rotate: -1.1},
    {left: 1305, top: 5, width: 520, rotate: 0.8},
    {left: 235, top: 255, width: 520, rotate: 0.7},
    {left: 1165, top: 255, width: 520, rotate: -0.8},
    {left: 95, top: 505, width: 520, rotate: -0.5},
    {left: 1305, top: 505, width: 520, rotate: 0.6},
  ];
};

const SpriteCrop: React.FC<{
  src: string;
  sheet: {width: number; height: number};
  crop: {x: number; y: number; width: number; height: number};
  width: number;
}> = ({src, sheet, crop, width}) => {
  const scale = width / crop.width;
  return (
    <div style={{position: 'relative', width, height: crop.height * scale, overflow: 'hidden'}}>
      <Img
        src={staticFile(src)}
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

const WornText: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span>{children}</span>
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
        backgroundSize: '260px 145px',
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    >
      {children}
    </span>
  </span>
);

const MemoItem: React.FC<{
  item: MultiPointStaggeredMemoItem;
  index: number;
  count: number;
  placement: Placement;
  debug: boolean;
}> = ({item, index, count, placement, debug}) => {
  const frame = useCurrentFrame();
  const plateT = enter(frame, 5 + index * 18, 20);
  const contentT = enter(frame, 13 + index * 18, 16);
  const iconT = enter(frame, 20 + index * 18, 15);
  const variant = memoVariants[index % memoVariants.length];
  const scale = placement.width / variant.crop.width;
  const height = variant.crop.height * scale;
  const numberSize = count <= 3 ? 92 : count === 4 ? 78 : 62;
  const baseTextSize = count <= 3 ? 58 : count === 4 ? 50 : 40;
  const capacity = count <= 3 ? 8 : count === 4 ? 9 : 10;
  const textSize = Math.max(34, baseTextSize * Math.min(1, capacity / Math.max(item.text.length, 1)));
  const direction = index % 2 === 0 ? -1 : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: placement.left,
        top: placement.top,
        width: placement.width,
        height,
        opacity: plateT,
        transform: `translate(${direction * 50 * (1 - plateT)}px, ${20 * (1 - plateT)}px) rotate(${placement.rotate + direction * 1.2 * (1 - plateT)}deg) scale(${0.94 + 0.06 * plateT})`,
        transformOrigin: 'center',
      }}
    >
      <SpriteCrop
        src="assets/multi-point-staggered-memo-sprites-v1.png"
        sheet={memoSheet}
        crop={variant.crop}
        width={placement.width}
      />

      <div
        style={{
          position: 'absolute',
          left: variant.numberCenter.x * scale,
          top: variant.numberCenter.y * scale,
          width: 190 * scale,
          height: 180 * scale,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
          fontSize: numberSize,
          lineHeight: 1,
          color: '#171613',
          opacity: contentT,
          outline: debug ? '3px solid #2a9d58' : undefined,
        }}
      >
        <span style={{transform: 'translateX(-4%)'}}>
          <WornText>{String(index + 1).padStart(2, '0')}</WornText>
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: variant.textCenter.x * scale,
          top: variant.textCenter.y * scale,
          width: variant.textSize.width * scale,
          height: variant.textSize.height * scale,
          transform: `translate(-50%, -50%) translateX(${24 * (1 - contentT)}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
          fontWeight: 900,
          fontSize: textSize,
          letterSpacing: count <= 3 ? 2 : 0,
          color: '#171613',
          opacity: contentT,
          outline: debug ? '3px dashed #d14a3a' : undefined,
          boxSizing: 'border-box',
        }}
      >
        <WornText>{item.text}</WornText>
      </div>

      {item.icon ? (
        <div
          style={{
            position: 'absolute',
            right: 8 * scale,
            top: -16 * scale,
            width: 125 * scale,
            opacity: iconT,
            transform: `translateY(${18 * (1 - iconT)}px) rotate(${direction * 5 * (1 - iconT)}deg) scale(${0.78 + 0.22 * iconT})`,
            transformOrigin: 'center',
          }}
        >
          <SpriteCrop
            src="assets/screen-recording-components-sprites-v1.png"
            sheet={iconSheet}
            crop={iconCrops[item.icon]}
            width={125 * scale}
          />
        </div>
      ) : null}
    </div>
  );
};

export const MultiPointStaggeredMemo: React.FC<MultiPointStaggeredMemoProps> = ({items, debug = false}) => {
  const safeItems = items.slice(0, 6);
  const placements = placementsFor(safeItems.length);
  return (
    <AbsoluteFill style={{backgroundColor: '#d9d6cf', overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/newspaper-neutral-v1.png')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
      />
      {safeItems.map((item, index) => (
        <MemoItem
          key={`${index}-${item.text}`}
          item={item}
          index={index}
          count={safeItems.length}
          placement={placements[index]}
          debug={debug}
        />
      ))}
    </AbsoluteFill>
  );
};
