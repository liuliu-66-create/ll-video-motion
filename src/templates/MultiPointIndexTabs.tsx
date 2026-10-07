import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type MultiPointIndexTabsItem = {
  text: string;
};

export type MultiPointIndexTabsProps = {
  items: MultiPointIndexTabsItem[];
  debug?: boolean;
};

type Placement = {left: number; top: number; width: number; rotate: number};
type LabelVariant = {
  crop: {x: number; y: number; width: number; height: number};
  numberCenter: {x: number; y: number};
  textCenter: {x: number; y: number};
};

const spriteSheet = {width: 1672, height: 941};

const variants: LabelVariant[] = [
  {
    crop: {x: 375, y: 15, width: 920, height: 295},
    numberCenter: {x: 190, y: 165},
    textCenter: {x: 575, y: 165},
  },
  {
    crop: {x: 375, y: 325, width: 920, height: 285},
    numberCenter: {x: 190, y: 155},
    textCenter: {x: 575, y: 155},
  },
  {
    crop: {x: 375, y: 620, width: 920, height: 290},
    numberCenter: {x: 190, y: 165},
    textCenter: {x: 575, y: 165},
  },
];

const enter = (frame: number, at: number, duration: number) =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const placementsFor = (count: number): Placement[] => {
  if (count === 2) {
    return [
      {left: 210, top: 315, width: 680, rotate: -0.5},
      {left: 1030, top: 315, width: 680, rotate: 0.45},
    ];
  }
  if (count === 3) {
    return [
      {left: 210, top: 180, width: 680, rotate: -0.45},
      {left: 1030, top: 180, width: 680, rotate: 0.4},
      {left: 620, top: 500, width: 680, rotate: -0.2},
    ];
  }
  if (count === 4) {
    return [
      {left: 210, top: 170, width: 680, rotate: -0.4},
      {left: 1030, top: 170, width: 680, rotate: 0.35},
      {left: 210, top: 500, width: 680, rotate: 0.3},
      {left: 1030, top: 500, width: 680, rotate: -0.35},
    ];
  }
  if (count === 5) {
    return [
      {left: 235, top: 45, width: 610, rotate: -0.4},
      {left: 1075, top: 45, width: 610, rotate: 0.35},
      {left: 235, top: 310, width: 610, rotate: 0.3},
      {left: 1075, top: 310, width: 610, rotate: -0.3},
      {left: 655, top: 575, width: 610, rotate: 0.15},
    ];
  }
  return Array.from({length: 6}, (_, index) => ({
    left: index % 2 === 0 ? 235 : 1075,
    top: 35 + Math.floor(index / 2) * 270,
    width: 610,
    rotate: [-0.4, 0.35, 0.3, -0.3, -0.25, 0.25][index],
  }));
};

const SpriteCrop: React.FC<{variant: LabelVariant; width: number}> = ({variant, width}) => {
  const scale = width / variant.crop.width;
  return (
    <div style={{position: 'relative', width, height: variant.crop.height * scale, overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/multi-point-index-tabs-sprites-v1.png')}
        style={{
          position: 'absolute',
          width: spriteSheet.width * scale,
          height: spriteSheet.height * scale,
          maxWidth: 'none',
          left: -variant.crop.x * scale,
          top: -variant.crop.y * scale,
        }}
      />
    </div>
  );
};

const IndexTab: React.FC<{
  item: MultiPointIndexTabsItem;
  index: number;
  count: number;
  placement: Placement;
  debug: boolean;
}> = ({item, index, count, placement, debug}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = 0.15 * fps + index * 0.55 * fps;
  const paperT = enter(frame, at, 0.55 * fps);
  const numberT = enter(frame, at + 0.2 * fps, 0.38 * fps);
  const textT = enter(frame, at + 0.34 * fps, 0.42 * fps);
  const variant = variants[index % variants.length];
  const scale = placement.width / variant.crop.width;
  const height = variant.crop.height * scale;
  const numberBox = 170 * scale;
  const textBox = {width: 560 * scale, height: 150 * scale};
  const baseFontSize = count <= 4 ? 60 : 48;
  const capacity = count <= 4 ? 7 : 9;
  const fontSize = Math.max(34, baseFontSize * Math.min(1, capacity / Math.max(item.text.length, 1)));
  const direction = index % 2 === 0 ? -1 : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: placement.left,
        top: placement.top,
        width: placement.width,
        height,
        opacity: paperT,
        transform: `translate(${direction * 36 * (1 - paperT)}px, ${18 * (1 - paperT)}px) rotate(${placement.rotate + direction * 0.8 * (1 - paperT)}deg) scale(${0.95 + paperT * 0.05})`,
        transformOrigin: 'center',
      }}
    >
      <SpriteCrop variant={variant} width={placement.width} />

      <div
        style={{
          position: 'absolute',
          left: variant.numberCenter.x * scale,
          top: variant.numberCenter.y * scale,
          width: numberBox,
          height: numberBox,
          transform: `translate(-50%, -50%) scale(${0.78 + numberT * 0.22})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          borderRadius: '50%',
          outline: debug ? '3px solid #20a45a' : undefined,
          color: '#efe7d3',
          fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
          fontSize: numberBox * 0.49,
          lineHeight: 1,
          letterSpacing: 1,
          opacity: numberT,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div
        style={{
          position: 'absolute',
          left: variant.textCenter.x * scale,
          top: variant.textCenter.y * scale,
          width: textBox.width,
          height: textBox.height,
          transform: `translate(-50%, -50%) translateX(${22 * (1 - textT)}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          outline: debug ? '3px dashed #d14a3a' : undefined,
          color: '#181715',
          fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
          fontSize,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: count <= 4 ? 2 : 0,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          opacity: textT,
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

export const MultiPointIndexTabs: React.FC<MultiPointIndexTabsProps> = ({items, debug = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safeItems = items.slice(0, 6);
  const backingT = enter(frame, 0, 0.65 * fps);
  const placements = placementsFor(safeItems.length);

  return (
    <AbsoluteFill style={{backgroundColor: '#dedbd2', overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/newspaper-neutral-v1.png')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <Img
        src={staticFile('assets/multi-point-index-tabs-backing-v1.png')}
        style={{
          position: 'absolute',
          left: 100,
          top: -15,
          width: 1720,
          height: 968,
          opacity: backingT,
          transform: `translateY(${20 * (1 - backingT)}px) scale(${0.97 + backingT * 0.03})`,
        }}
      />
      {safeItems.map((item, index) => (
        <IndexTab
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
