import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

export type MultiPointTornItem = {
  text: string;
};

export type MultiPointTornListProps = {
  items: MultiPointTornItem[];
  debug?: boolean;
};

type RowVariant = {
  crop: {x: number; y: number; width: number; height: number};
  badge: {centerX: number; centerY: number; diameter: number};
  textAnchor: {centerX: number; centerY: number; maxWidth: number};
};

type Placement = {left: number; top: number; width: number};

const sourceWidth = 1672;
const sourceHeight = 941;

// All measurements are relative to each crop. They are measured once from the
// transparent source asset; runtime text never relies on visual guesswork.
const rowVariants: RowVariant[] = [
  {
    crop: {x: 170, y: 4, width: 1494, height: 356},
    badge: {centerX: 265, centerY: 224, diameter: 205},
    textAnchor: {centerX: 747, centerY: 224, maxWidth: 780},
  },
  {
    crop: {x: 176, y: 356, width: 1490, height: 302},
    badge: {centerX: 260, centerY: 160, diameter: 205},
    textAnchor: {centerX: 745, centerY: 160, maxWidth: 780},
  },
  {
    crop: {x: 170, y: 642, width: 1494, height: 296},
    badge: {centerX: 265, centerY: 158, diameter: 205},
    textAnchor: {centerX: 747, centerY: 158, maxWidth: 780},
  },
];

const enter = (frame: number, at: number) =>
  interpolate(frame, [at, at + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const getPlacements = (count: number): Placement[] => {
  if (count <= 2) {
    return [
      {left: 320, top: 125, width: 1280},
      {left: 320, top: 570, width: 1280},
    ].slice(0, count);
  }
  if (count === 3) {
    return [
      {left: 320, top: 35, width: 1280},
      {left: 320, top: 375, width: 1280},
      {left: 320, top: 685, width: 1280},
    ];
  }
  if (count === 4) {
    return Array.from({length: 4}, (_, index) => ({
      left: 410,
      top: 20 + index * 245,
      width: 1100,
    }));
  }
  if (count === 5) {
    return Array.from({length: 5}, (_, index) => ({
      left: 550,
      top: 20 + index * 190,
      width: 820,
    }));
  }
  return Array.from({length: 6}, (_, index) => ({
    left: index % 2 === 0 ? 70 : 1110,
    top: 110 + Math.floor(index / 2) * 300,
    width: 740,
  }));
};

const getFontSize = (text: string, count: number, scale: number) => {
  const base = count <= 3 ? 82 : count === 4 ? 72 : count === 5 ? 62 : 54;
  const capacity = count === 6 ? 7 : count === 5 ? 10 : 13;
  const lengthFactor = Math.min(1, capacity / Math.max(text.length, 1));
  return Math.max(36, base * lengthFactor * Math.min(1, scale / 0.74));
};

const SpriteCrop: React.FC<{variant: RowVariant; width: number}> = ({variant, width}) => {
  const {crop} = variant;
  const scale = width / crop.width;
  return (
    <div style={{position: 'relative', width, height: crop.height * scale, overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/multi-point-torn-paper-sprites-v1.png')}
        style={{
          position: 'absolute',
          width: sourceWidth * scale,
          height: sourceHeight * scale,
          maxWidth: 'none',
          left: -crop.x * scale,
          top: -crop.y * scale,
          filter: 'saturate(.82) brightness(.99)',
        }}
      />
    </div>
  );
};

const TornRow: React.FC<{
  text: string;
  index: number;
  count: number;
  placement: Placement;
  debug: boolean;
}> = ({text, index, count, placement, debug}) => {
  const frame = useCurrentFrame();
  const rowT = enter(frame, 6 + index * 20);
  const textT = enter(frame, 14 + index * 20);
  const variant = rowVariants[index % rowVariants.length];
  const {crop, badge, textAnchor} = variant;
  const scale = placement.width / crop.width;
  const rowHeight = crop.height * scale;
  const badgeSize = badge.diameter * scale;
  const fontSize = getFontSize(text, count, scale);

  return (
    <div
      style={{
        position: 'absolute',
        left: placement.left,
        top: placement.top,
        width: placement.width,
        height: rowHeight,
        opacity: rowT,
        transform: `translateX(${(index % 2 === 0 ? -1 : 1) * 42 * (1 - rowT)}px) translateY(${16 * (1 - rowT)}px) rotate(${(index % 2 === 0 ? -0.65 : 0.55) * (1 - rowT)}deg) scale(${0.96 + rowT * 0.04})`,
        transformOrigin: 'center',
      }}
    >
      <SpriteCrop variant={variant} width={placement.width} />

      <div
        style={{
          position: 'absolute',
          left: badge.centerX * scale,
          top: badge.centerY * scale,
          width: badgeSize,
          height: badgeSize,
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#efe5cf',
          fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
          fontSize: badgeSize * 0.45,
          lineHeight: 1,
          letterSpacing: 1,
          opacity: textT,
          textShadow: '1px 1px 0 rgba(70,32,25,.22)',
          outline: debug ? '3px solid #18a558' : undefined,
          borderRadius: debug ? '50%' : undefined,
        }}
      >
        <span style={{transform: `translateY(${-badgeSize * 0.025}px) scale(${0.84 + textT * 0.16})`}}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: textAnchor.centerX * scale,
          top: textAnchor.centerY * scale,
          width: textAnchor.maxWidth * scale,
          height: Math.min(190, crop.height * 0.65) * scale,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#181815',
          fontFamily: 'Microsoft YaHei, sans-serif',
          fontWeight: 900,
          fontSize,
          letterSpacing: count >= 5 ? 1 : 3,
          whiteSpace: 'nowrap',
          opacity: textT,
          transform: `translate(-50%, -50%) translateX(${26 * (1 - textT)}px)`,
          outline: debug ? '3px dashed #d14a3a' : undefined,
          boxSizing: 'border-box',
        }}
      >
        {text}
      </div>

      {debug ? (
        <>
          <div style={{position: 'absolute', left: badge.centerX * scale - 12, top: badge.centerY * scale, width: 24, height: 2, background: '#18a558'}} />
          <div style={{position: 'absolute', left: badge.centerX * scale, top: badge.centerY * scale - 12, width: 2, height: 24, background: '#18a558'}} />
        </>
      ) : null}
    </div>
  );
};

export const MultiPointTornList: React.FC<MultiPointTornListProps> = ({items, debug = false}) => {
  const safeItems = items.slice(0, 6);
  const count = safeItems.length;
  const placements = getPlacements(count);

  return (
    <AbsoluteFill style={{background: '#dedbd2', overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/newspaper-neutral-v1.png')}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
      />
      {safeItems.map((item, index) => (
        <TornRow
          key={`${index}-${item.text}`}
          text={item.text}
          index={index}
          count={count}
          placement={placements[index]}
          debug={debug}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 90,
          background: 'linear-gradient(to bottom, rgba(222,219,210,0), rgba(222,219,210,.28))',
        }}
      />
    </AbsoluteFill>
  );
};
