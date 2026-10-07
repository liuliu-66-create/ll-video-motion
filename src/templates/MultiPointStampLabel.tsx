import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type MultiPointStampLabelItem = {
  text: string;
};

export type MultiPointStampLabelProps = {
  items: MultiPointStampLabelItem[];
  debug?: boolean;
};

type Placement = {left: number; top: number; width: number; rotate: number};

const baseSheet = {width: 2046, height: 768};
const baseCellWidth = 682;
const visibleBaseHeight = 540;
const badgeCenters = [
  {x: 340, y: 215},
  {x: 336, y: 221},
  {x: 334, y: 225},
];

const enter = (frame: number, at: number, duration = 18) =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const placementsFor = (count: number): Placement[] => {
  if (count === 2) {
    return [
      {left: 250, top: 270, width: 620, rotate: -1.2},
      {left: 1050, top: 270, width: 620, rotate: 1.1},
    ];
  }
  if (count === 3) {
    return [
      {left: 65, top: 300, width: 560, rotate: -0.7},
      {left: 680, top: 300, width: 560, rotate: 0.4},
      {left: 1295, top: 300, width: 560, rotate: -0.35},
    ];
  }
  if (count === 4) {
    return [
      {left: 260, top: 140, width: 430, rotate: -0.7},
      {left: 1230, top: 140, width: 430, rotate: 0.6},
      {left: 260, top: 480, width: 430, rotate: 0.45},
      {left: 1230, top: 480, width: 430, rotate: -0.55},
    ];
  }
  const lefts = [145, 780, 1415];
  const compact = (index: number): Placement => ({
    left: lefts[index % 3],
    top: index < 3 ? 150 : 480,
    width: 360,
    rotate: [-0.65, 0.35, -0.3, 0.4, -0.4, 0.55][index],
  });
  if (count === 5) {
    return [compact(0), compact(1), compact(2), {...compact(3), left: 460}, {...compact(4), left: 1100}];
  }
  return Array.from({length: 6}, (_, index) => compact(index));
};

const SpriteCrop: React.FC<{
  src: string;
  sheet: {width: number; height: number};
  crop: {x: number; y: number; width: number; height: number};
  width: number;
  clipPath?: string;
}> = ({src, sheet, crop, width, clipPath}) => {
  const scale = width / crop.width;
  return (
    <div style={{position: 'relative', width, height: crop.height * scale, overflow: 'hidden', clipPath}}>
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

const StampItem: React.FC<{
  item: MultiPointStampLabelItem;
  index: number;
  count: number;
  placement: Placement;
  debug: boolean;
}> = ({item, index, count, placement, debug}) => {
  const frame = useCurrentFrame();
  const plateT = enter(frame, 4 + index * 18, 20);
  const numberT = enter(frame, 11 + index * 18, 14);
  const textT = enter(frame, 16 + index * 18, 16);
  const scale = placement.width / baseCellWidth;
  const height = visibleBaseHeight * scale;
  const direction = index % 2 === 0 ? -1 : 1;
  const baseTextSize = count <= 3 ? 64 : count === 4 ? 52 : 43;
  const capacity = count <= 3 ? 7 : count === 4 ? 8 : 9;
  const fontSize = Math.max(34, baseTextSize * Math.min(1, capacity / Math.max(item.text.length, 1)));
  const numberSize = count <= 3 ? 88 : count === 4 ? 68 : 58;
  const badgeCenter = badgeCenters[index % badgeCenters.length];

  return (
    <div
      style={{
        position: 'absolute',
        left: placement.left,
        top: placement.top,
        width: placement.width,
        height,
        opacity: plateT,
        transform: `translate(${direction * 42 * (1 - plateT)}px, ${24 * (1 - plateT)}px) rotate(${placement.rotate + direction * 1.4 * (1 - plateT)}deg) scale(${0.93 + plateT * 0.07})`,
        transformOrigin: '50% 50%',
      }}
    >
      <SpriteCrop
        src="assets/multi-point-stamp-label-sprites-v1.png"
        sheet={baseSheet}
        crop={{x: (index % 3) * baseCellWidth, y: 0, width: baseCellWidth, height: visibleBaseHeight}}
        width={placement.width}
        clipPath="polygon(0 0, 100% 0, 100% 94%, 82% 96%, 65% 94%, 58% 91%, 42% 91%, 35% 94%, 18% 96%, 0 94%)"
      />

      <div
        style={{
          position: 'absolute',
          left: badgeCenter.x * scale,
          top: badgeCenter.y * scale,
          width: 250 * scale,
          height: 250 * scale,
          transform: `translate(-50%, -50%) rotate(${direction * 7 * (1 - numberT)}deg) scale(${0.72 + numberT * 0.28})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
          fontSize: numberSize,
          lineHeight: 1,
          color: '#efe5cf',
          letterSpacing: 1,
          opacity: numberT,
          outline: debug ? '3px solid #22a05a' : undefined,
          borderRadius: '50%',
          boxSizing: 'border-box',
        }}
      >
        <span>{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 341 * scale,
          top: 407 * scale,
          width: 560 * scale,
          height: 165 * scale,
          transform: `translate(-50%, -50%) translateX(${26 * (1 - textT)}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontFamily: 'Microsoft YaHei, SimHei, sans-serif',
          fontWeight: 900,
          fontSize,
          letterSpacing: count <= 3 ? 2 : 0,
          color: '#171613',
          opacity: textT,
          outline: debug ? '3px dashed #d14a3a' : undefined,
          boxSizing: 'border-box',
        }}
      >
        {item.text}
      </div>

    </div>
  );
};

export const MultiPointStampLabel: React.FC<MultiPointStampLabelProps> = ({items, debug = false}) => {
  const safeItems = items.slice(0, 6);
  const placements = placementsFor(safeItems.length);
  return (
    <AbsoluteFill style={{backgroundColor: '#dedbd2', overflow: 'hidden'}}>
      <Img src={staticFile('assets/newspaper-neutral-v1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      {safeItems.map((item, index) => (
        <StampItem key={`${index}-${item.text}`} item={item} index={index} count={safeItems.length} placement={placements[index]} debug={debug} />
      ))}
    </AbsoluteFill>
  );
};
