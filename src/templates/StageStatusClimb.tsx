import React from 'react';
import {staticFile} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {brand} from '../styles/brand';
import type {StageStatusBoardProps} from './StageStatusBoard';

type Point = {x: number; y: number};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const pointsFor = (count: number): Point[] => count === 5
  ? [{x: 150, y: 760}, {x: 500, y: 665}, {x: 865, y: 535}, {x: 1260, y: 410}, {x: 1710, y: 320}]
  : [{x: 170, y: 755}, {x: 610, y: 645}, {x: 1100, y: 450}, {x: 1700, y: 325}];

const RibbonSegment: React.FC<{from: Point; to: Point; filled: boolean}> = ({from, to, filled}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return (
    <div style={{position: 'absolute', left: from.x, top: from.y - 22, width: length + 10, height: 44, transform: `rotate(${angle}deg)`, transformOrigin: '0 50%', backgroundColor: filled ? brand.colors.brick : brand.colors.paper, backgroundImage: `url(${staticFile(filled ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`, backgroundSize: filled ? '520px 520px' : '520px 150px', backgroundBlendMode: filled ? 'soft-light' : 'normal', clipPath: 'polygon(0 9%, 10% 2%, 23% 7%, 37% 1%, 51% 8%, 66% 2%, 81% 7%, 100% 1%, 99% 91%, 84% 98%, 69% 92%, 54% 99%, 38% 93%, 22% 99%, 8% 92%, 0 97%)', boxShadow: filled ? '0 13px 16px rgba(45,32,22,.16)' : '0 9px 13px rgba(45,32,22,.10)', border: filled ? 'none' : '1px solid rgba(45,32,22,.12)', boxSizing: 'border-box'}} />
  );
};

export const StageStatusClimb: React.FC<StageStatusBoardProps> = ({headline, stages}) => {
  const safeStages = stages.slice(0, 5);
  const total = Math.max(safeStages.length, 1);
  const activeRaw = safeStages.findIndex((item) => item.status === 'active');
  const activeIndex = activeRaw >= 0 ? activeRaw : Math.max(0, safeStages.filter((item) => item.status === 'done').length - 1);
  const points = pointsFor(total);
  const current = safeStages[activeIndex];
  const activePaperCrop = {x: 170, y: 4, width: 1494, height: 356};

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 92, top: 88, width: 1180, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(headline, 72, 18, 50), fontWeight: 1000, lineHeight: 1.12, letterSpacing: 1}}>{headline}</div>
      <div style={{position: 'absolute', right: 105, top: 78, width: 400, textAlign: 'right', color: brand.colors.ink, fontFamily: brand.fontFamily, fontWeight: 1000}}>
        <span style={{fontSize: 136, lineHeight: 1, backgroundImage: `linear-gradient(150deg, ${brand.colors.ink} 20%, ${brand.colors.brick} 115%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{activeIndex + 1}</span>
        <span style={{fontSize: 61, color: brand.colors.brick}}> / {total}</span>
      </div>
      <div style={{position: 'absolute', left: 95, top: 286, width: 1730, height: 2, backgroundColor: 'rgba(22,20,17,.20)'}} />

      <div style={{position: 'absolute', inset: 0}}>
        {points.slice(0, -1).map((point, index) => <RibbonSegment key={index} from={point} to={points[index + 1]} filled={index < activeIndex} />)}

        {points.map((point, index) => {
          const item = safeStages[index];
          const active = index === activeIndex;
          const done = index < activeIndex;
          if (!item) return null;
          if (active) {
            return (
              <div key={`${index}-${item.title}`} style={{position: 'absolute', left: point.x - 270, top: point.y - 164, width: 540, height: 128, filter: 'drop-shadow(0 13px 9px rgba(45,32,22,.18))'}}>
                <SpriteCrop asset="assets/multi-point-torn-paper-sprites-v1.png" sheetWidth={1672} sheetHeight={941} crop={activePaperCrop} width={540} height={128} style={{position: 'absolute', inset: 0}} />
                <div style={{position: 'absolute', left: 91, top: 35, width: 64, color: brand.colors.paper, fontFamily: brand.fontFamily, fontSize: 27, fontWeight: 1000, textAlign: 'center'}}>{String(index + 1).padStart(2, '0')}</div>
                <div style={{position: 'absolute', left: 184, top: 27, width: 320, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(item.title, 43, 10, 32), fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap'}}>{item.title}</div>
                <div style={{position: 'absolute', left: 187, bottom: 20, color: brand.colors.brick, fontFamily: brand.fontFamily, fontSize: 20, fontWeight: 1000, letterSpacing: 4}}>正在进行</div>
              </div>
            );
          }
          return (
            <div key={`${index}-${item.title}`}>
              <div style={{position: 'absolute', left: point.x - (done ? 12 : 10), top: point.y - (done ? 12 : 10), width: done ? 24 : 20, height: done ? 24 : 20, borderRadius: '50%', backgroundColor: done ? brand.colors.ink : brand.colors.paper, border: done ? `5px solid ${brand.colors.brick}` : '4px solid rgba(22,20,17,.28)', boxSizing: 'border-box'}} />
              <div style={{position: 'absolute', left: point.x - 155, top: point.y + 42, width: 310, textAlign: 'center', color: done ? brand.colors.ink : 'rgba(22,20,17,.34)', fontFamily: brand.fontFamily, fontSize: fitFont(item.title, 28, total === 5 ? 8 : 10, 21), fontWeight: 900, letterSpacing: 1, whiteSpace: 'nowrap'}}>{item.title}</div>
            </div>
          );
        })}

        {activeIndex > 0 ? <div style={{position: 'absolute', left: points[activeIndex].x - 28, top: points[activeIndex].y + 17, width: 76, height: 34, backgroundColor: brand.colors.mutedBrick, clipPath: 'polygon(0 0, 100% 0, 14% 100%)', opacity: .72}} /> : null}
        {current ? <div style={{position: 'absolute', left: points[activeIndex].x - 6, top: points[activeIndex].y - 6, width: 12, height: 12, borderRadius: '50%', backgroundColor: brand.colors.ink}} /> : null}
      </div>
    </BrandBackground>
  );
};
