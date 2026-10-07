import React from 'react';
import {Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type StageStatus = 'done' | 'active' | 'pending';
export type StageStatusItem = {title: string; note?: string; status: StageStatus};
export type StageStatusBoardProps = {headline: string; context?: string; stages: StageStatusItem[]; nextAction?: string};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const reveal = (frame: number, start: number, duration = 18) => interpolate(frame, [start, start + duration], [0, 1], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
});

const RollingDigit: React.FC<{roll: number}> = ({roll}) => {
  const height = 152;
  return (
    <div style={{position: 'relative', width: 96, height, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 96, transform: `translateY(${-roll * height}px)`}}>
        {Array.from({length: 70}, (_, index) => <div key={index} style={{width: 96, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.colors.ink, fontSize: 152, lineHeight: 1}}>{index % 10}</div>)}
      </div>
    </div>
  );
};

export const StageStatusBoard: React.FC<StageStatusBoardProps> = ({headline, stages}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const safeStages = stages.slice(0, 5);
  const total = Math.max(safeStages.length, 1);
  const activeIndexRaw = safeStages.findIndex((item) => item.status === 'active');
  const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : Math.max(0, safeStages.filter((item) => item.status === 'done').length - 1);
  const percent = Math.min(100, Math.round(((activeIndex + 0.6) / total) * 100));
  const trackLeft = 170;
  const trackWidth = 1580;
  const trackTop = 500;
  const titleT = reveal(frame, 2, 22);
  const trackT = reveal(frame, 15, 22);
  const progressT = interpolate(frame, [30, 105], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const countT = interpolate(frame, [24, 103], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const markerT = reveal(frame, 33, 15);
  const stageT = reveal(frame, 77, 24);
  const currentT = spring({frame: frame - 96, fps, config: {damping: 14, stiffness: 145, mass: .78}});
  const fillWidth = trackWidth * percent / 100 * progressT;
  const markerX = trackLeft + fillWidth;
  const rollingCount = percent * countT;
  const tensRoll = Math.floor(percent / 10) * countT;

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 92, top: 92, width: 1120, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(headline, 72, 18, 50), fontWeight: 1000, lineHeight: 1.12, letterSpacing: 1, opacity: titleT, transform: `translateY(${(1 - titleT) * 22}px)`}}>{headline}</div>

      <div style={{position: 'absolute', right: 105, top: 72, width: 500, textAlign: 'right', fontFamily: brand.fontFamily}}>
        <div style={{color: brand.colors.brick, fontSize: 24, fontWeight: 1000, letterSpacing: 5, opacity: titleT}}>当前完成度</div>
        <div style={{marginTop: -4, height: 152, color: brand.colors.ink, fontWeight: 1000, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', opacity: reveal(frame, 18, 14)}}>
          <div style={{display: 'flex', height: 152}}>
            <RollingDigit roll={tensRoll} />
            <RollingDigit roll={rollingCount} />
          </div>
          <span style={{color: brand.colors.brick, fontSize: 70, letterSpacing: -4, marginTop: 61}}>%</span>
        </div>
      </div>

      <div style={{position: 'absolute', left: 95, top: 300, width: 1730, height: 2, backgroundColor: 'rgba(22,20,17,.20)', opacity: titleT}} />

      <div style={{position: 'absolute', left: trackLeft, top: trackTop, width: trackWidth, height: 70, borderRadius: 3, backgroundColor: 'rgba(229,222,208,.86)', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '660px 210px', boxShadow: 'inset 0 2px 2px rgba(255,255,255,.8), inset 0 -3px 5px rgba(45,32,22,.12), 0 11px 17px rgba(45,32,22,.10)', border: '1px solid rgba(65,53,40,.18)', overflow: 'hidden', opacity: trackT, transform: `scaleX(${trackT})`, transformOrigin: '0 50%'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: fillWidth, height: '100%', backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '560px 560px', backgroundBlendMode: 'soft-light', clipPath: 'polygon(0 4%, 8% 1%, 17% 4%, 28% 1%, 39% 5%, 51% 2%, 63% 5%, 75% 1%, 87% 4%, 98% 1%, 100% 16%, 98% 28%, 100% 43%, 97% 58%, 100% 72%, 98% 87%, 100% 96%, 89% 99%, 76% 96%, 64% 100%, 51% 96%, 38% 99%, 25% 95%, 12% 99%, 0 95%)'}} />
      </div>

      <div style={{position: 'absolute', left: markerX - 2, top: trackTop - 90, width: 4, height: 172, backgroundColor: brand.colors.ink, opacity: .78 * markerT}} />
      <div style={{position: 'absolute', left: markerX - 13, top: trackTop - 103, width: 30, height: 30, borderRadius: '50%', backgroundColor: brand.colors.ink, opacity: markerT, transform: `scale(${.6 + markerT * .4})`}} />
      <div style={{position: 'absolute', left: markerX - 150, top: trackTop - 178, width: 300, textAlign: 'center', color: brand.colors.brick, fontFamily: brand.fontFamily, fontSize: 25, fontWeight: 1000, letterSpacing: 4, opacity: markerT}}>正在进行</div>

      {safeStages.map((item, index) => {
        const sectionWidth = trackWidth / total;
        const x = trackLeft + sectionWidth * index;
        const done = item.status === 'done';
        const active = item.status === 'active';
        return <React.Fragment key={`${index}-${item.title}`}>
          {index > 0 ? <div style={{position: 'absolute', left: x, top: trackTop + 60, width: 2, height: 28, backgroundColor: 'rgba(22,20,17,.28)', opacity: stageT}} /> : null}
          <div style={{position: 'absolute', left: x, top: trackTop + 190, width: sectionWidth, color: active ? brand.colors.ink : done ? 'rgba(22,20,17,.58)' : 'rgba(22,20,17,.28)', fontFamily: brand.fontFamily, fontSize: active ? fitFont(item.title, 48, total === 5 ? 10 : 9, 36) : fitFont(item.title, 24, total === 5 ? 8 : 10, 18), fontWeight: active ? 1000 : 850, letterSpacing: active ? 2 : 1, textAlign: 'center', whiteSpace: 'nowrap', opacity: active ? currentT : stageT, transform: active ? `translateY(${(1 - currentT) * 18}px) scale(${.88 + currentT * .12})` : `translateY(${(1 - stageT) * 12}px)`}}>{item.title}</div>
          <div style={{position: 'absolute', left: x + sectionWidth / 2 - (active ? 5 : 3), top: trackTop + 160, width: active ? 10 : 6, height: active ? 10 : 6, borderRadius: '50%', backgroundColor: active ? brand.colors.brick : done ? brand.colors.ink : 'rgba(22,20,17,.25)', opacity: active ? currentT : stageT}} />
        </React.Fragment>;
      })}

      <div style={{position: 'absolute', left: trackLeft + fillWidth - 2, top: trackTop + 70, width: 70, height: 30, backgroundColor: brand.colors.mutedBrick, clipPath: 'polygon(0 0, 100% 0, 5% 100%)', opacity: .78 * markerT}} />
    </BrandBackground>
  );
};
