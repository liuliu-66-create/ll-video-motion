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

export type MultiPointBurstStickersItem = {text: string};

export type MultiPointBurstStickersProps = {
  items: MultiPointBurstStickersItem[];
  debug?: boolean;
};

type Placement = {left: number; top: number; width: number; rotate: number};
type StickerVariant = {
  id: string;
  crop: {x: number; y: number; width: number; height: number};
  numberCenter: {x: number; y: number};
  textCenter: {x: number; y: number};
  numberDiameter: number;
  textBox: {width: number; height: number};
};

const sheet = {width: 1672, height: 941};
const variants: StickerVariant[] = [
  {id: 'starburst', crop: {x: 10, y: 40, width: 570, height: 420}, numberCenter: {x: 175, y: 235}, textCenter: {x: 365, y: 235}, numberDiameter: 142, textBox: {width: 230, height: 170}},
  {id: 'cloud', crop: {x: 570, y: 70, width: 550, height: 400}, numberCenter: {x: 150, y: 220}, textCenter: {x: 345, y: 220}, numberDiameter: 142, textBox: {width: 220, height: 170}},
  {id: 'ticket', crop: {x: 1120, y: 95, width: 540, height: 330}, numberCenter: {x: 157, y: 195}, textCenter: {x: 345, y: 195}, numberDiameter: 164, textBox: {width: 180, height: 145}},
  {id: 'speech-bubble', crop: {x: 165, y: 470, width: 570, height: 420}, numberCenter: {x: 165, y: 210}, textCenter: {x: 345, y: 210}, numberDiameter: 166, textBox: {width: 180, height: 160}},
  {id: 'torn-strip', crop: {x: 770, y: 480, width: 760, height: 350}, numberCenter: {x: 150, y: 212}, textCenter: {x: 440, y: 212}, numberDiameter: 164, textBox: {width: 350, height: 145}},
];

const enter = (frame: number, at: number, duration: number) =>
  interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const placementsFor = (count: number): Placement[] => {
  if (count === 2) return [{left: 185, top: 250, width: 700, rotate: -1.1}, {left: 1035, top: 250, width: 700, rotate: 0.8}];
  if (count === 3) return [{left: 100, top: 125, width: 650, rotate: -1}, {left: 1170, top: 125, width: 650, rotate: 0.8}, {left: 660, top: 480, width: 600, rotate: -0.35}];
  if (count === 4) return [{left: 145, top: 45, width: 600, rotate: -0.9}, {left: 1175, top: 55, width: 600, rotate: 0.75}, {left: 155, top: 485, width: 600, rotate: 0.55}, {left: 1165, top: 455, width: 600, rotate: -0.6}];
  if (count === 5) return [{left: 100, top: 50, width: 610, rotate: -0.9}, {left: 1120, top: 65, width: 590, rotate: 0.65}, {left: 55, top: 525, width: 500, rotate: 0.35}, {left: 650, top: 475, width: 520, rotate: -0.45}, {left: 1210, top: 525, width: 690, rotate: 0.3}];
  return [{left: 20, top: 30, width: 545, rotate: -0.7}, {left: 695, top: 35, width: 525, rotate: 0.55}, {left: 1390, top: 55, width: 445, rotate: -0.4}, {left: 20, top: 455, width: 465, rotate: 0.45}, {left: 640, top: 485, width: 625, rotate: -0.35}, {left: 1370, top: 455, width: 545, rotate: 0.45}];
};

const SpriteCrop: React.FC<{variant: StickerVariant; width: number}> = ({variant, width}) => {
  const scale = width / variant.crop.width;
  return (
    <div style={{position: 'relative', width, height: variant.crop.height * scale, overflow: 'hidden'}}>
      <Img src={staticFile('assets/multi-point-burst-stickers-v1.png')} style={{position: 'absolute', width: sheet.width * scale, height: sheet.height * scale, maxWidth: 'none', left: -variant.crop.x * scale, top: -variant.crop.y * scale}} />
    </div>
  );
};

const BurstSticker: React.FC<{item: MultiPointBurstStickersItem; index: number; count: number; placement: Placement; debug: boolean}> = ({item, index, count, placement, debug}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = 0.12 * fps + index * 0.5 * fps;
  const paperT = enter(frame, at, 0.5 * fps);
  const numberT = enter(frame, at + 0.18 * fps, 0.34 * fps);
  const textT = enter(frame, at + 0.3 * fps, 0.4 * fps);
  const variant = variants[index % variants.length];
  const scale = placement.width / variant.crop.width;
  const numberSize = variant.numberDiameter * scale;
  const numberFontSize = count <= 5 ? 72 : 62;
  const baseFontSize = count <= 5 ? 70 : 54;
  const renderedTextWidth = variant.textBox.width * scale;
  const widthLimitedSize = renderedTextWidth / (Math.max(item.text.length, 1) * 1.18);
  const fontSize = Math.max(count <= 5 ? 34 : 30, Math.min(baseFontSize, widthLimitedSize));
  const direction = index % 2 === 0 ? -1 : 1;

  return (
    <div style={{position: 'absolute', left: placement.left, top: placement.top, width: placement.width, height: variant.crop.height * scale, opacity: paperT, transform: `translate(${direction * 35 * (1 - paperT)}px, ${20 * (1 - paperT)}px) rotate(${placement.rotate + direction * 2 * (1 - paperT)}deg) scale(${0.88 + paperT * 0.12})`, transformOrigin: 'center'}}>
      <SpriteCrop variant={variant} width={placement.width} />
      <div style={{position: 'absolute', left: variant.numberCenter.x * scale, top: variant.numberCenter.y * scale, width: numberSize, height: numberSize, transform: `translate(-50%, -50%) scale(${0.72 + numberT * 0.28})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', borderRadius: '50%', outline: debug ? '3px solid #20a45a' : undefined, color: '#efe5cf', fontFamily: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif', fontSize: numberFontSize, lineHeight: 1, letterSpacing: 1, opacity: numberT}}>
        <span style={{transform: 'translateY(-2%)'}}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div style={{position: 'absolute', left: variant.textCenter.x * scale, top: variant.textCenter.y * scale, width: variant.textBox.width * scale, height: variant.textBox.height * scale, transform: `translate(-50%, -50%) translateX(${20 * (1 - textT)}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', outline: debug ? '3px dashed #d14a3a' : undefined, color: '#171613', fontFamily: 'Microsoft YaHei, SimHei, sans-serif', fontSize, fontWeight: 900, lineHeight: 1, letterSpacing: 1, textAlign: 'center', whiteSpace: 'nowrap', opacity: textT}}>
        {item.text}
      </div>
    </div>
  );
};

export const MultiPointBurstStickers: React.FC<MultiPointBurstStickersProps> = ({items, debug = false}) => {
  const safeItems = items.slice(0, 6);
  const placements = placementsFor(safeItems.length);
  return (
    <AbsoluteFill style={{backgroundColor: '#dedbd2', overflow: 'hidden'}}>
      <Img src={staticFile('assets/newspaper-neutral-v1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      {safeItems.map((item, index) => <BurstSticker key={`${index}-${item.text}`} item={item} index={index} count={safeItems.length} placement={placements[index]} debug={debug} />)}
    </AbsoluteFill>
  );
};
