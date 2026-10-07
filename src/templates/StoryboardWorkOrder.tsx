import React from 'react';
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type StoryboardWorkOrderProps = {
  headline: string;
  shotNumber: string;
  timecode: string;
  imageSrc: string;
  subtitle: string;
  visual: string;
  materials: string[];
};

const paperTear = 'polygon(0 4%, 4% 1%, 9% 5%, 15% 2%, 22% 6%, 29% 1%, 36% 5%, 44% 2%, 52% 6%, 60% 1%, 68% 5%, 76% 2%, 84% 6%, 92% 1%, 98% 5%, 100% 3%, 99% 93%, 94% 98%, 88% 94%, 81% 99%, 74% 95%, 66% 98%, 58% 94%, 50% 99%, 42% 95%, 34% 98%, 26% 94%, 18% 99%, 10% 95%, 2% 98%)';

const labelTear = 'polygon(1% 14%, 10% 4%, 23% 12%, 36% 2%, 51% 13%, 66% 4%, 80% 12%, 93% 3%, 99% 13%, 100% 87%, 88% 96%, 73% 89%, 58% 98%, 43% 90%, 27% 97%, 13% 89%, 2% 96%)';

const enter = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

export const StoryboardWorkOrder: React.FC<StoryboardWorkOrderProps> = ({headline, shotNumber, timecode, imageSrc, subtitle, visual, materials}) => {
  if (materials.length < 2 || materials.length > 4) throw new Error('StoryboardWorkOrder requires 2–4 material tags.');
  const frame = useCurrentFrame();
  const titleT = enter(frame, 2, 22);
  const backingT = enter(frame, 22, 24);
  const sheetT = enter(frame, 28, 24);
  const metaT = enter(frame, 44, 18);
  const imageT = enter(frame, 53, 24);
  const subtitleT = enter(frame, 72, 19);
  const visualT = enter(frame, 88, 19);
  const materialsT = enter(frame, 104, 20);

  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: 100, top: 68, width: 1410, color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fit(headline, 70, 20, 54), lineHeight: 1.1, fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>{headline}</div>

      <div style={{position: 'absolute', left: 94, top: 224, width: 1730, height: 730, backgroundColor: '#9f4133', backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '430px 430px', backgroundBlendMode: 'soft-light', clipPath: paperTear, filter: 'drop-shadow(0 22px 15px rgba(47,32,23,.25))', opacity: backingT, transformOrigin: '50% 50%', transform: `rotate(${-4 + 2.9 * backingT}deg) scaleX(${.18 + .82 * backingT})`}} />
      <div style={{position: 'absolute', left: 110, top: 207, width: 1705, height: 730, padding: '54px 62px', boxSizing: 'border-box', backgroundColor: '#eee3d0', backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`, backgroundSize: '500px 310px', clipPath: paperTear, filter: 'drop-shadow(0 16px 11px rgba(47,32,23,.22))', opacity: sheetT, transform: `translateY(${44 * (1 - sheetT)}px) rotate(${2.2 - 1.85 * sheetT}deg) scale(${.96 + .04 * sheetT})`, fontFamily: brand.fontFamily}}>
        <div style={{position: 'absolute', left: 60, top: 43, color: brand.colors.brick, fontSize: 28, fontWeight: 1000, letterSpacing: 3, opacity: metaT, transform: `translateX(${-24 * (1 - metaT)}px)`}}>镜头 {shotNumber}</div>
        <div style={{position: 'absolute', left: 239, top: 35, width: 330, height: 53, display: 'grid', placeItems: 'center', color: '#f5ead9', backgroundColor: brand.colors.brick, backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`, backgroundSize: '220px 220px', backgroundBlendMode: 'soft-light', clipPath: labelTear, fontFamily: 'Consolas, monospace', fontSize: 25, fontWeight: 900, letterSpacing: 1, opacity: metaT, transform: `scale(${.84 + .16 * metaT})`}}>{timecode}</div>

        <div style={{position: 'absolute', left: 62, top: 118, width: 610, height: 470, padding: 12, boxSizing: 'border-box', border: `4px solid ${brand.colors.ink}`, background: '#ece5d8', opacity: imageT, transform: `translateY(${34 * (1 - imageT)}px) scale(${.96 + .04 * imageT})`}}>
          <Img src={staticFile(imageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%'}} />
        </div>
        <div style={{position: 'absolute', left: 210, bottom: 55, color: brand.colors.ink, fontSize: 27, fontWeight: 900, letterSpacing: 5, opacity: imageT}}>镜头画面</div>

        <div style={{position: 'absolute', left: 735, top: 112, width: 890, height: 510}}>
          <div style={{height: 151, borderBottom: '3px dashed rgba(52,43,34,.36)', opacity: subtitleT, transform: `translateX(${32 * (1 - subtitleT)}px)`}}>
            <div style={{color: brand.colors.brick, fontSize: 27, fontWeight: 1000, letterSpacing: 4}}>字幕内容</div>
            <div style={{marginTop: 22, color: brand.colors.ink, fontSize: fit(subtitle, 38, 20, 30), lineHeight: 1.3, fontWeight: 900, whiteSpace: 'nowrap'}}>{subtitle}</div>
          </div>
          <div style={{height: 170, paddingTop: 28, boxSizing: 'border-box', borderBottom: '3px dashed rgba(52,43,34,.36)', opacity: visualT, transform: `translateX(${32 * (1 - visualT)}px)`}}>
            <div style={{color: brand.colors.brick, fontSize: 27, fontWeight: 1000, letterSpacing: 4}}>画面内容</div>
            <div style={{marginTop: 20, color: brand.colors.ink, fontSize: fit(visual, 36, 21, 29), lineHeight: 1.3, fontWeight: 900, whiteSpace: 'nowrap'}}>{visual}</div>
          </div>
          <div style={{paddingTop: 27, opacity: materialsT, transform: `translateY(${22 * (1 - materialsT)}px)`}}>
            <div style={{color: brand.colors.brick, fontSize: 27, fontWeight: 1000, letterSpacing: 4}}>所需素材</div>
            <div style={{marginTop: 20, display: 'flex', gap: 18, flexWrap: 'wrap'}}>
              {materials.map((material, index) => (
                <div key={`${material}-${index}`} style={{width: 170, height: 58, display: 'grid', placeItems: 'center', color: index === 0 ? '#f5ead8' : brand.colors.ink, backgroundColor: index === 0 ? brand.colors.brick : '#dfcfb6', backgroundImage: `url(${staticFile(index === 0 ? 'assets/distressed-ink-wear-v1.png' : 'assets/paper-fiber-texture-v1.png')})`, backgroundSize: '190px 150px', backgroundBlendMode: index === 0 ? 'soft-light' : 'normal', clipPath: labelTear, filter: 'drop-shadow(0 7px 5px rgba(46,31,22,.17))', transform: `rotate(${index % 2 === 0 ? -1.2 : 1.1}deg)`, fontSize: fit(material, 27, 4, 22), fontWeight: 1000}}>{material}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{position: 'absolute', left: 720, top: -13, width: 205, height: 48, background: 'rgba(181,153,108,.8)', clipPath: labelTear, transform: 'rotate(-2deg)'}} />
      </div>
    </BrandBackground>
  );
};
