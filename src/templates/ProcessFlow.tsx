import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

export type ProcessFlowVariant = 'zigzag' | 'journey';

export type ProcessFlowProps = {
  steps: string[];
  variant: ProcessFlowVariant;
};

type Point = {x: number; y: number};
type Crop = {x: number; y: number; width: number; height: number};

const spriteWidth = 1672;
const spriteHeight = 941;
const routeSpriteWidth = 1672;
const routeSpriteHeight = 941;
const nodeCrops: Crop[] = [
  {x: 265, y: 0, width: 380, height: 355},
  {x: 650, y: 0, width: 380, height: 355},
  {x: 1045, y: 0, width: 380, height: 355},
  {x: 265, y: 350, width: 380, height: 355},
  {x: 650, y: 345, width: 380, height: 360},
  {x: 1045, y: 345, width: 380, height: 360},
];

const statusCrops = {
  start: {x: 285, y: 700, width: 300, height: 235},
  progress: {x: 685, y: 690, width: 300, height: 250},
  complete: {x: 1080, y: 680, width: 300, height: 260},
};

const labelCrops: Crop[] = [
  {x: 43, y: 84, width: 365, height: 170},
  {x: 438, y: 88, width: 372, height: 170},
  {x: 850, y: 80, width: 382, height: 180},
  {x: 1274, y: 88, width: 370, height: 172},
];

const arrowCrops = {
  rightDown: {x: 24, y: 292, width: 430, height: 315},
  leftDown: {x: 884, y: 292, width: 388, height: 320},
};

const enter = (frame: number, at: number, duration = 18) =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const SpriteCrop: React.FC<{crop: Crop; width: number}> = ({crop, width}) => {
  const scale = width / crop.width;
  return (
    <div style={{position: 'relative', width, height: crop.height * scale, overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/process-common-sprites-v2.png')}
        style={{
          position: 'absolute',
          width: spriteWidth * scale,
          height: spriteHeight * scale,
          maxWidth: 'none',
          left: -crop.x * scale,
          top: -crop.y * scale,
          filter: 'saturate(.86) brightness(.99)',
        }}
      />
    </div>
  );
};

const RouteSpriteCrop: React.FC<{
  crop: Crop;
  width: number;
  height?: number;
}> = ({crop, width, height}) => {
  const targetHeight = height ?? width * crop.height / crop.width;
  const scaleX = width / crop.width;
  const scaleY = targetHeight / crop.height;
  return (
    <div style={{position: 'relative', width, height: targetHeight, overflow: 'hidden'}}>
      <Img
        src={staticFile('assets/process-route-label-sprites-v1.png')}
        style={{
          position: 'absolute',
          width: routeSpriteWidth * scaleX,
          height: routeSpriteHeight * scaleY,
          maxWidth: 'none',
          left: -crop.x * scaleX,
          top: -crop.y * scaleY,
        }}
      />
    </div>
  );
};

const getPoints = (variant: ProcessFlowVariant, count: number): Point[] => {
  if (variant === 'journey') {
    const sets: Record<number, Point[]> = {
      2: [{x: 400, y: 690}, {x: 1500, y: 350}],
      3: [{x: 350, y: 690}, {x: 960, y: 275}, {x: 1560, y: 690}],
      4: [{x: 260, y: 700}, {x: 700, y: 390}, {x: 1210, y: 350}, {x: 1650, y: 690}],
      5: [{x: 230, y: 710}, {x: 570, y: 430}, {x: 960, y: 255}, {x: 1340, y: 430}, {x: 1680, y: 710}],
      6: [{x: 210, y: 690}, {x: 510, y: 430}, {x: 820, y: 250}, {x: 1120, y: 250}, {x: 1430, y: 430}, {x: 1710, y: 690}],
    };
    return sets[count];
  }

  const sets: Record<number, Point[]> = {
    2: [{x: 430, y: 270}, {x: 1450, y: 720}],
    3: [{x: 350, y: 250}, {x: 960, y: 520}, {x: 1530, y: 770}],
    4: [{x: 300, y: 230}, {x: 820, y: 355}, {x: 1480, y: 520}, {x: 1030, y: 790}],
    5: [{x: 260, y: 230}, {x: 770, y: 250}, {x: 1450, y: 390}, {x: 1110, y: 690}, {x: 480, y: 780}],
    6: [{x: 250, y: 245}, {x: 790, y: 245}, {x: 1460, y: 245}, {x: 1460, y: 710}, {x: 790, y: 710}, {x: 250, y: 710}],
  };
  return sets[count];
};

const FlowRoutes: React.FC<{points: Point[]; variant: ProcessFlowVariant}> = ({points, variant}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {points.slice(0, -1).map((point, index) => {
        const progress = enter(frame, 15 + index * 22, 20);
        const next = points[index + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const width = Math.max(300, Math.abs(dx) * 0.82);
        const height = Math.max(210, Math.abs(dy) + (variant === 'journey' ? 100 : 55));
        const descends = dy >= 0;
        const movesRight = dx >= 0;
        const crop = movesRight ? arrowCrops.rightDown : arrowCrops.leftDown;
        const left = Math.min(point.x, next.x) + Math.min(90, Math.abs(dx) * 0.13);
        const top = Math.min(point.y, next.y) - 25;
        const flipY = descends ? 1 : -1;
        return (
          <div
            key={`${point.x}-${point.y}-${next.x}-${next.y}`}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              opacity: progress,
              transform: `scale(${0.94 + progress * 0.06}) scaleY(${flipY})`,
              transformOrigin: 'center',
              filter: 'saturate(.86) brightness(.96)',
              clipPath: movesRight
                ? 'polygon(0 0, 84% 0, 84% 18%, 100% 27%, 100% 100%, 0 100%)'
                : undefined,
            }}
          >
            <RouteSpriteCrop crop={crop} width={width} height={height} />
          </div>
        );
      })}
    </>
  );
};

const FlowNode: React.FC<{
  point: Point;
  text: string;
  index: number;
  count: number;
}> = ({point, text, index, count}) => {
  const frame = useCurrentFrame();
  const nodeT = enter(frame, 2 + index * 22);
  const nodeSize = count <= 3 ? 255 : count === 4 ? 215 : 180;
  const labelWidth = count <= 3 ? 315 : count === 4 ? 265 : 225;
  const labelHeight = count <= 3 ? 122 : count === 4 ? 105 : 92;
  const fontSize = Math.max(34, (count <= 3 ? 54 : 43) * Math.min(1, 5 / Math.max(text.length, 1)));
  const labelTop = point.y + nodeSize * 0.33;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: point.x - nodeSize / 2,
          top: point.y - nodeSize / 2,
          opacity: nodeT,
          transform: `scale(${0.72 + nodeT * 0.28}) rotate(${(index % 2 === 0 ? -1 : 1) * 4 * (1 - nodeT)}deg)`,
          transformOrigin: 'center',
        }}
      >
        <SpriteCrop crop={nodeCrops[index]} width={nodeSize} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: point.x - labelWidth / 2,
          top: labelTop,
          opacity: nodeT,
          transform: `translateY(${12 * (1 - nodeT)}px)`,
        }}
      >
        <RouteSpriteCrop crop={labelCrops[index % labelCrops.length]} width={labelWidth} height={labelHeight} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 3,
            color: '#151512',
            fontFamily: 'Microsoft YaHei, sans-serif',
            fontWeight: 900,
            boxSizing: 'border-box',
          }}
        >
          <span style={{fontSize, whiteSpace: 'nowrap'}}>{text}</span>
        </div>
      </div>
    </>
  );
};

const StatusMarks: React.FC<{points: Point[]; count: number}> = ({points, count}) => {
  const frame = useCurrentFrame();
  const first = points[0];
  const last = points[points.length - 1];
  const startT = enter(frame, 0, 14);
  const doneT = enter(frame, 4 + (count - 1) * 22 + 18, 16);
  return (
    <>
      <div style={{position: 'absolute', left: first.x - 220, top: first.y - 65, opacity: startT, transform: `scale(${0.8 + startT * 0.2})`}}>
        <SpriteCrop crop={statusCrops.start} width={155} />
      </div>
      <div style={{position: 'absolute', left: last.x + 110, top: last.y - 70, opacity: doneT, transform: `scale(${0.65 + doneT * 0.35})`}}>
        <SpriteCrop crop={statusCrops.complete} width={145} />
      </div>
    </>
  );
};

export const ProcessFlow: React.FC<ProcessFlowProps> = ({steps, variant}) => {
  const safeSteps = steps.slice(0, 6);
  const points = getPoints(variant, Math.max(2, safeSteps.length));
  return (
    <AbsoluteFill style={{background: '#dedbd2', overflow: 'hidden'}}>
      <Img src={staticFile('assets/newspaper-neutral-v1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <FlowRoutes points={points} variant={variant} />
      <StatusMarks points={points} count={safeSteps.length} />
      {safeSteps.map((text, index) => (
        <FlowNode key={`${index}-${text}`} point={points[index]} text={text} index={index} count={safeSteps.length} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, background: 'linear-gradient(to bottom, rgba(222,219,210,0), rgba(222,219,210,.28))'}} />
    </AbsoluteFill>
  );
};
