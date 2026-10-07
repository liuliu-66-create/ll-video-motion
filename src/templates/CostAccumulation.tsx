import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop, SpriteCropRect} from '../components/SpriteCrop';
import {enter} from '../components/motion';
import {brand} from '../styles/brand';

type Art = {src: string; width: number; height: number; crop?: SpriteCropRect};
type Slot = 'pile' | 'addition' | 'container' | 'resource';
export type CostAccumulationProps = {
  leftTitle?: string; leftCaption?: string;
  rightTitle?: string; rightCaption?: string;
  resourceCount?: number; remainingCount?: number;
  /** One addition is paired with each resource consumed. */
  art?: Partial<Record<Slot, Art>>;
};
const sheet = 'assets/cost-accumulation-sprites-v1.png';
const source = (crop: SpriteCropRect): Art => ({src: sheet, width: 1672, height: 941, crop});
const defaults: Record<Slot, Art> = {
  pile: source({x: 4, y: 6, width: 1112, height: 629}),
  container: source({x: 1133, y: 109, width: 531, height: 508}),
  addition: source({x: 312, y: 639, width: 420, height: 302}),
  resource: source({x: 1170, y: 702, width: 338, height: 178}),
};
const Visual: React.FC<{art: Art; width: number}> = ({art, width}) =>
  art.crop ? <SpriteCrop asset={art.src} sheetWidth={art.width} sheetHeight={art.height}
    crop={art.crop} width={width} /> :
    <Img src={staticFile(art.src)} style={{width, height: width * art.height / art.width, objectFit: 'contain'}} />;
const aspect = (art: Art) => art.crop ? art.crop.height / art.crop.width : art.height / art.width;
const placements = [
  {x: 200, bottom: 638, angle: -12},
  {x: 700, bottom: 550, angle: 13},
  {x: 415, bottom: 420, angle: -4},
  {x: 840, bottom: 685, angle: 9},
  {x: 500, bottom: 675, angle: -9},
  {x: 160, bottom: 735, angle: 8},
  {x: 695, bottom: 755, angle: -3},
];
export const CostAccumulation: React.FC<CostAccumulationProps> = ({
  leftTitle = '反复生成', leftCaption = '尝试越多，成本越高',
  rightTitle = '预算消耗', rightCaption = '还没交付，费用已累积',
  resourceCount = 6, remainingCount = 1, art = {},
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  if (!Number.isInteger(resourceCount) || resourceCount < 2 || resourceCount > 8 ||
      !Number.isInteger(remainingCount) || remainingCount < 0 || remainingCount >= resourceCount ||
      resourceCount - remainingCount > 7) {
    throw new Error('资源数量须为2—8，剩余量须小于起始量，每镜头消耗1—7个。');
  }
  for (const [label, value, max] of [
    ['左标题', leftTitle, 8], ['右标题', rightTitle, 8],
    ['左说明', leftCaption, 18], ['右说明', rightCaption, 18],
  ] as const) {
    if (Array.from(value).length > max) throw new Error(label + '过长，请精简，不自动缩小或截断。');
  }
  const resolved = {...defaults, ...art};
  Object.values(resolved).forEach(a => {
    if (!a.src || !Number.isFinite(a.width) || !Number.isFinite(a.height) || a.width <= 0 || a.height <= 0)
      throw new Error('替换插画必须提供有效路径和真实宽高。');
    if (a.crop && (a.crop.width <= 0 || a.crop.height <= 0 || a.crop.x < 0 || a.crop.y < 0 ||
      a.crop.x + a.crop.width > a.width || a.crop.y + a.crop.height > a.height))
      throw new Error('插画裁切范围越界。');
  });
  const count = resourceCount - remainingCount;
  const at = (i: number) => Math.round(durationInFrames * (0.20 + 0.52 * (count === 1 ? 0.5 : i / (count - 1))));
  const intro = enter(frame, 0, 20);
  // Independent content layers: art settles first, then title, then caption.
  const titleEnter = enter(frame, Math.round(0.8 * fps), Math.round(0.4 * fps));
  const captionEnter = enter(frame, Math.round(1.25 * fps), Math.round(0.35 * fps));
  const fitWidth = (slot: Slot, width: number, height: number) => Math.min(width, height / aspect(resolved[slot]));
  const pileWidth = fitWidth('pile', 1080, 680);
  const purseWidth = fitWidth('container', 515, 550);
  const additionWidth = fitWidth('addition', 255, 195);
  const resourceWidth = fitWidth('resource', 155, 90);
  return <BrandBackground>
    <div style={{position: 'absolute', inset: '0 0 300px 0', overflow: 'hidden', opacity: intro}}>
      <div style={{position: 'absolute', left: 65 + (1080 - pileWidth) / 2,
        top: 765 - pileWidth * aspect(resolved.pile), transform: `translateY(${(1-intro)*15}px)`}}>
        <Visual art={resolved.pile} width={pileWidth}/>
      </div>
      {Array.from({length: count}, (_, i) => {
        const p = enter(frame, at(i), 20);
        const pos = placements[i];
        return <div key={i} style={{position: 'absolute', left: pos.x,
          top: pos.bottom - additionWidth * aspect(resolved.addition),
          opacity: p, transformOrigin: '50% 80%',
          transform: `translateY(${-65*(1-p)}px) rotate(${pos.angle+(1-p)*8}deg)`}}>
          <Visual art={resolved.addition} width={additionWidth}/>
        </div>;
      })}
      <div style={{position: 'absolute', left: 1210 + (515-purseWidth)/2,
        top: 765 - purseWidth * aspect(resolved.container)}}>
        <Visual art={resolved.container} width={purseWidth}/>
      </div>
      {Array.from({length: resourceCount}, (_, i) => {
        const consumedIndex = resourceCount - 1 - i;
        const spent = consumedIndex < count ? enter(frame, at(consumedIndex), 20) : 0;
        return <div key={i} style={{position: 'absolute', left: 1715,
          top: 750 - resourceWidth * aspect(resolved.resource) - i * 19,
          opacity: 1-spent, transform: `translate(${-130*spent}px, ${-40*spent}px)`}}>
          <Visual art={resolved.resource} width={resourceWidth}/>
        </div>;
      })}
    </div>
    {[{x: 80, width: 1070, title: leftTitle, caption: leftCaption},
      {x: 1190, width: 650, title: rightTitle, caption: rightCaption}].map((item, i) =>
      <div key={i} style={{position: 'absolute', left: item.x, top: 823, width: item.width,
        textAlign: 'center', fontFamily: brand.fontFamily}}>
        {item.title && <div style={{fontSize: 40, fontWeight: 700, lineHeight: '54px',
          color: brand.colors.ink, opacity: titleEnter,
          transform: `translateY(${18 * (1 - titleEnter)}px)`}}>{item.title}</div>}
        {item.caption && <div style={{marginTop: 9, fontSize: 28, fontWeight: 700,
          lineHeight: '40px', color: brand.colors.mutedBrick, opacity: captionEnter,
          transform: `translateY(${14 * (1 - captionEnter)}px)`}}>{item.caption}</div>}
      </div>)}
  </BrandBackground>;
};
