import React from 'react';
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type TypicalShotFilmstripProps = {
  headline: string;
  eyebrow: string;
  note: string;
  shots: Array<{label: string; imageSrc: string; objectPosition?: string}>;
};

const filmTear = 'polygon(0 5%, 3% 2%, 7% 6%, 12% 1%, 17% 5%, 22% 2%, 28% 6%, 34% 1%, 40% 5%, 46% 2%, 52% 6%, 58% 1%, 64% 5%, 70% 2%, 76% 6%, 82% 1%, 88% 5%, 94% 2%, 100% 6%, 99% 94%, 95% 98%, 90% 94%, 84% 99%, 78% 95%, 72% 98%, 66% 94%, 60% 99%, 54% 95%, 48% 98%, 42% 94%, 36% 99%, 30% 95%, 24% 98%, 18% 94%, 12% 99%, 6% 95%, 1% 98%)';

const labelTear = 'polygon(1% 13%, 10% 4%, 22% 11%, 35% 2%, 49% 12%, 63% 4%, 78% 13%, 91% 3%, 99% 12%, 100% 87%, 88% 96%, 74% 89%, 59% 98%, 44% 90%, 28% 97%, 14% 89%, 2% 96%)';

const frameTear = 'polygon(0 4%, 7% 1%, 15% 5%, 24% 2%, 34% 6%, 44% 1%, 54% 5%, 65% 2%, 76% 6%, 87% 1%, 96% 5%, 100% 3%, 99% 93%, 92% 98%, 83% 94%, 73% 99%, 62% 95%, 51% 98%, 40% 94%, 29% 99%, 18% 94%, 8% 98%, 1% 95%)';

const holeTear = 'polygon(3% 15%, 14% 3%, 31% 10%, 48% 1%, 66% 12%, 84% 4%, 98% 16%, 95% 85%, 81% 97%, 62% 89%, 45% 98%, 27% 87%, 8% 96%)';

const enter = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

export const TypicalShotFilmstrip: React.FC<TypicalShotFilmstripProps> = ({headline, eyebrow, note, shots}) => {
  if (shots.length !== 3) throw new Error('TypicalShotFilmstrip requires exactly 3 representative shots.');
  const frame = useCurrentFrame();
  const titleT = enter(frame, 2, 22);
  const eyebrowT = enter(frame, 12, 18);
  const backingT = enter(frame, 23, 24);
  const filmT = enter(frame, 30, 26);
  const noteT = enter(frame, 112, 20);

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 100, top: 72, width: 1420, fontFamily: brand.fontFamily, color: brand.colors.ink, fontSize: fit(headline, 72, 19, 54), lineHeight: 1.1, fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>{headline}</div>

      <div style={{position: 'absolute', right: 105, top: 80, width: 260, height: 70, display: 'grid', placeItems: 'center', color: '#f4e9d8', fontFamily: brand.fontFamily, fontSize: fit(eyebrow, 28, 6, 23), fontWeight: 1000, letterSpacing: eyebrow.length > 6 ? 1 : 3, backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '260px 260px', backgroundBlendMode: 'soft-light', clipPath: labelTear, filter: 'drop-shadow(0 8px 6px rgba(47,31,22,.2))', opacity: eyebrowT, transform: `rotate(${6 - 4 * eyebrowT}deg) scale(${.84 + .16 * eyebrowT})`}}>{eyebrow}</div>

      <div style={{position: 'absolute', left: 38, right: 38, top: 246, height: 604, backgroundColor: '#e9deca', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '520px 300px', clipPath: filmTear, filter: 'drop-shadow(0 23px 17px rgba(47,34,24,.24))', opacity: backingT, transformOrigin: '50% 50%', transform: `rotate(${3.5 - 2.8 * backingT}deg) scaleX(${.12 + .88 * backingT})`}} />
      <div style={{position: 'absolute', left: 66, right: 46, top: 274, height: 584, backgroundColor: '#9f3d30', backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '410px 410px', backgroundBlendMode: 'soft-light', clipPath: filmTear, filter: 'drop-shadow(0 14px 10px rgba(47,29,21,.23))', opacity: backingT, transformOrigin: '50% 50%', transform: `rotate(${-4 + 2.5 * backingT}deg) scaleX(${.08 + .92 * backingT})`}} />
      <div style={{position: 'absolute', left: 56, right: 56, top: 262, height: 578, backgroundColor: '#191817', backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '330px 330px', backgroundBlendMode: 'screen', clipPath: filmTear, filter: 'drop-shadow(0 18px 13px rgba(38,28,21,.34))', opacity: filmT, transformOrigin: '50% 50%', transform: `rotate(${-2.8 + 2.1 * filmT}deg) scaleX(${.08 + .92 * filmT})`}}>
        <div style={{position: 'absolute', left: 25, right: 25, top: 18, height: 33, display: 'flex', justifyContent: 'space-between'}}>
          {Array.from({length: 22}, (_, index) => <div key={index} style={{width: 52, height: 28, backgroundColor: '#e9dfcc', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '120px 80px', clipPath: holeTear, boxShadow: 'inset 0 0 0 2px rgba(70,55,42,.18)', transform: `rotate(${index % 2 === 0 ? -.8 : .7}deg)`}} />)}
        </div>
        <div style={{position: 'absolute', left: 25, right: 25, bottom: 18, height: 33, display: 'flex', justifyContent: 'space-between'}}>
          {Array.from({length: 22}, (_, index) => <div key={index} style={{width: 52, height: 28, backgroundColor: '#e9dfcc', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '120px 80px', clipPath: holeTear, boxShadow: 'inset 0 0 0 2px rgba(70,55,42,.18)', transform: `rotate(${index % 2 === 0 ? .8 : -.7}deg)`}} />)}
        </div>

        <div style={{position: 'absolute', left: 67, right: 67, top: 78, bottom: 78, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28}}>
          {shots.map((shot, index) => (
            <div key={`${shot.label}-${index}`} style={{position: 'relative', opacity: enter(frame, 52 + index * 17, 20), transform: `translateX(${90 * (1 - enter(frame, 52 + index * 17, 20))}px) rotate(${index === 0 ? -1 : index === 2 ? 1.1 : .25}deg) scale(${.93 + .07 * enter(frame, 52 + index * 17, 20)})`}}>
              <div style={{position: 'absolute', inset: 0, backgroundColor: '#ece2d0', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '360px 230px', padding: 18, clipPath: frameTear, filter: 'drop-shadow(0 11px 9px rgba(0,0,0,.32))', boxSizing: 'border-box'}}>
                <div style={{position: 'absolute', left: 23, top: 20, zIndex: 2, width: 58, height: 46, display: 'grid', placeItems: 'center', color: '#eee4d3', background: 'rgba(22,21,19,.88)', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 25, letterSpacing: 2}}>{String(index + 1).padStart(2, '0')}</div>
                <div style={{height: '100%', overflow: 'hidden', background: '#cac5ba'}}>
                  <Img src={staticFile(shot.imageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: shot.objectPosition ?? '50% 50%'}} />
                </div>
              </div>
              <div style={{position: 'absolute', left: '50%', bottom: -28, width: 220, height: 66, transform: 'translateX(-50%)', display: 'grid', placeItems: 'center', color: '#f4e9d8', backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '240px 240px', backgroundBlendMode: 'soft-light', clipPath: labelTear, filter: 'drop-shadow(0 7px 5px rgba(32,22,17,.32))', fontFamily: brand.fontFamily, fontWeight: 1000, fontSize: fit(shot.label, 30, 6, 24), letterSpacing: shot.label.length > 6 ? 0 : 1}}>{shot.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{position: 'absolute', left: 385, right: 385, bottom: 80, textAlign: 'center', color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fit(note, 35, 24, 27), lineHeight: 1.3, fontWeight: 900, whiteSpace: 'nowrap', opacity: noteT, transform: `translateY(${18 * (1 - noteT)}px)`}}>{note}</div>
    </BrandBackground>
  );
};
