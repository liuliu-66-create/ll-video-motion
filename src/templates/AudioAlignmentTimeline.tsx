import React from 'react';
import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type AudioAlignmentTimelineProps = {
  headline: string;
  emphasis?: string;
  clips: Array<{time: string; line: string; shot: string}>;
};

const ease = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const wave = [18, 31, 46, 27, 58, 76, 42, 22, 66, 92, 53, 35, 71, 103, 82, 43, 29, 63, 88, 48, 25, 56, 96, 69, 34, 79, 114, 73, 39, 61, 87, 44, 24, 51, 78, 106, 65, 33, 59, 90, 48, 27, 68, 99, 72, 36, 55, 82, 43, 23, 49, 73, 94, 58, 30, 53, 84, 62, 37, 71, 98, 67, 32, 47, 76, 55, 28, 44, 69, 89, 51, 25, 41, 64, 45, 22, 36, 58, 39, 19];

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

export const AudioAlignmentTimeline: React.FC<AudioAlignmentTimelineProps> = ({headline, emphasis = '以声音为准', clips}) => {
  const frame = useCurrentFrame();
  if (clips.length < 3 || clips.length > 4) throw new Error('AudioAlignmentTimeline requires 3–4 aligned clips.');

  const titleT = ease(frame, 4, 22);
  const trackT = ease(frame, 22, 58);
  const playhead = interpolate(frame, [42, 142], [0.03, 0.86], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const left = 150;
  const width = 1620;
  const laneTop = 360;
  const segmentGap = 22;
  const segmentWidth = (width - segmentGap * (clips.length - 1)) / clips.length;

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 92, top: 72, width: 1390, fontFamily: brand.fontFamily, color: brand.colors.ink, opacity: titleT, transform: `translateY(${18 * (1 - titleT)}px)`}}>
        <div style={{fontSize: fit(headline, 70, 24, 48), lineHeight: 1.12, fontWeight: 1000, letterSpacing: 1}}>{headline}</div>
      </div>

      <div style={{position: 'absolute', right: 105, top: 82, width: 270, height: 98, display: 'grid', placeItems: 'center', color: brand.colors.paper, fontFamily: brand.fontFamily, fontSize: 32, fontWeight: 1000, letterSpacing: 3, opacity: titleT, transform: `rotate(-2deg) scale(${0.88 + titleT * 0.12})`}}>
        <div style={{position: 'absolute', inset: 0, zIndex: -1, backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '300px 300px', backgroundBlendMode: 'soft-light', clipPath: 'polygon(2% 12%, 13% 4%, 29% 8%, 44% 2%, 60% 8%, 76% 3%, 98% 10%, 100% 88%, 85% 96%, 67% 91%, 49% 98%, 31% 92%, 15% 97%, 1% 88%)', filter: 'drop-shadow(0 10px 8px rgba(48,34,24,.2))'}} />
        {emphasis}
      </div>

      <div style={{position: 'absolute', left, top: laneTop, width, height: 270}}>
        <div style={{position: 'absolute', left: -12, right: 15, top: 13, bottom: -15, backgroundColor: '#9e4436', backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '420px 420px', backgroundBlendMode: 'soft-light', opacity: .82, clipPath: 'polygon(0 9%, 4% 5%, 11% 8%, 18% 3%, 26% 7%, 35% 4%, 43% 9%, 52% 3%, 61% 7%, 69% 5%, 78% 9%, 87% 3%, 94% 7%, 100% 5%, 99% 92%, 94% 96%, 88% 93%, 81% 98%, 74% 94%, 66% 97%, 59% 92%, 51% 98%, 44% 95%, 35% 99%, 28% 93%, 20% 97%, 13% 92%, 6% 98%, 1% 94%)', filter: 'drop-shadow(0 17px 11px rgba(45,30,20,.22))', transform: 'rotate(.3deg)'}} />
        <div style={{position: 'absolute', inset: 0, backgroundColor: '#e8dcc7', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '410px 190px', clipPath: 'polygon(0 7%, 3% 3%, 9% 6%, 16% 2%, 24% 7%, 31% 4%, 39% 8%, 47% 2%, 56% 6%, 64% 3%, 73% 8%, 81% 2%, 90% 6%, 96% 3%, 100% 8%, 99% 93%, 95% 97%, 89% 94%, 82% 99%, 76% 95%, 69% 98%, 61% 93%, 54% 98%, 48% 94%, 40% 99%, 33% 95%, 25% 98%, 19% 93%, 12% 97%, 5% 94%, 1% 98%)', filter: 'drop-shadow(0 9px 7px rgba(45,30,20,.13))'}} />
        <div style={{position: 'absolute', left: 235, top: -16, width: 188, height: 44, background: 'rgba(155,66,50,.7)', transform: 'rotate(-2.6deg)', clipPath: 'polygon(0 15%, 12% 3%, 27% 12%, 44% 2%, 61% 13%, 79% 4%, 100% 16%, 98% 86%, 82% 97%, 63% 86%, 45% 98%, 24% 87%, 3% 96%)'}} />
        <div style={{position: 'absolute', left: 42, top: 28, color: brand.colors.brick, fontFamily: brand.fontFamily, fontSize: 26, fontWeight: 1000, letterSpacing: 3}}>声音</div>
        <div style={{position: 'absolute', left: 42, right: 42, top: 74, height: 144, display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden'}}>
          {wave.map((height, index) => {
            const active = index / (wave.length - 1) <= playhead;
            return <div key={index} style={{flex: 1, height: height * trackT, minWidth: 3, borderRadius: 4, background: active ? brand.colors.brick : 'rgba(23,21,18,.25)', transformOrigin: '50% 50%'}} />;
          })}
        </div>
      </div>

      <div style={{position: 'absolute', left, top: 672, width, height: 245, zIndex: 4}}>
        <div style={{position: 'absolute', left: 0, top: -30, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: 26, fontWeight: 1000, letterSpacing: 3}}>画面</div>
        {clips.map((clip, index) => {
          const itemT = ease(frame, 62 + index * 12, 18);
          const strong = index === 1;
          const x = index * (segmentWidth + segmentGap);
          const backing = strong ? '#752c25' : index % 2 === 0 ? '#a04434' : '#b89463';
          return (
            <div key={`${clip.time}-${index}`} style={{position: 'absolute', left: x, top: 18, width: segmentWidth, height: 185, opacity: itemT, transform: `translateY(${18 * (1 - itemT)}px) rotate(${index % 2 === 0 ? -0.7 : 0.6}deg)`, fontFamily: brand.fontFamily}}>
              <div style={{position: 'absolute', left: -10, right: 8, top: 10, bottom: -13, backgroundColor: backing, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '330px 330px', backgroundBlendMode: 'soft-light', clipPath: 'polygon(0 10%, 9% 4%, 21% 8%, 34% 2%, 47% 9%, 61% 3%, 74% 8%, 88% 2%, 100% 7%, 98% 91%, 90% 97%, 79% 93%, 68% 99%, 56% 94%, 44% 98%, 32% 92%, 19% 97%, 8% 93%, 1% 98%)', filter: 'drop-shadow(0 12px 8px rgba(45,30,20,.22))'}} />
              <div style={{position: 'absolute', inset: 0, backgroundColor: strong ? '#b8503f' : '#eee6d7', backgroundImage: `url(${staticFile(strong ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`, backgroundSize: strong ? '330px 330px' : '330px 160px', backgroundBlendMode: strong ? 'soft-light' : 'normal', clipPath: 'polygon(0 8%, 8% 3%, 19% 7%, 31% 2%, 44% 9%, 57% 3%, 71% 7%, 84% 2%, 94% 6%, 100% 4%, 99% 92%, 91% 97%, 81% 94%, 70% 99%, 59% 95%, 47% 98%, 36% 93%, 25% 97%, 14% 92%, 3% 98%)', filter: 'drop-shadow(0 7px 6px rgba(45,30,20,.12))'}} />
              <div style={{position: 'absolute', left: 24, top: 19, fontSize: 25, fontWeight: 900, color: strong ? '#f3eadb' : brand.colors.brick}}>{clip.time}</div>
              <div style={{position: 'absolute', left: 24, right: 22, top: 63, fontSize: fit(clip.line, 31, 10, 24), lineHeight: 1.2, fontWeight: 1000, color: strong ? '#fff8ea' : brand.colors.ink, whiteSpace: 'nowrap'}}>{clip.line}</div>
              <div style={{position: 'absolute', left: 24, right: 22, bottom: 19, fontSize: fit(clip.shot, 25, 12, 20), fontWeight: 850, color: strong ? '#f3dfd5' : '#6a5b4f', whiteSpace: 'nowrap'}}>{clip.shot}</div>
            </div>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: left + width * playhead, top: laneTop - 28, width: 5, height: 595, zIndex: 3, background: brand.colors.ink, transform: 'translateX(-2.5px)', boxShadow: '0 0 0 3px rgba(239,231,215,.7)'}}>
        <div style={{position: 'absolute', left: -12, top: -4, width: 29, height: 29, borderRadius: '50%', background: brand.colors.brick, border: '4px solid #f0e7d7', boxSizing: 'border-box'}} />
      </div>
    </BrandBackground>
  );
};
