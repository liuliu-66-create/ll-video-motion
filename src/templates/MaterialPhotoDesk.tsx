import React from 'react';
import {Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {brand} from '../styles/brand';

export type MaterialPhotoDeskProps = {
  headline: string;
  status: string;
  screenRecordingSrc: string;
  screenRecordingLabel?: string;
  screenshotSrc: string;
  screenshotLabel?: string;
  brandVisualSrc: string;
  brandVisualLabel?: string;
  audioLabel?: string;
  audioFile: string;
  stampTop?: string;
  stampBottom?: string;
};

const torn = (points: string) => ({
  backgroundColor: '#eee4d2',
  backgroundImage: `url(${staticFile('assets/paper-fiber-texture-v1.png')})`,
  backgroundSize: '420px 240px',
  clipPath: points,
  filter: 'drop-shadow(0 18px 13px rgba(51,39,28,.24))',
});

const enter = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const fit = (text: string, preferred: number, safeChars: number, min: number) =>
  Math.max(min, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const tapeStyle = (color = 'rgba(159,65,48,.72)'): React.CSSProperties => ({
  position: 'absolute',
  width: 174,
  height: 48,
  backgroundColor: color,
  backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`,
  backgroundSize: '220px 220px',
  backgroundBlendMode: 'soft-light',
  clipPath: 'polygon(0 16%, 10% 5%, 24% 11%, 39% 2%, 55% 12%, 70% 4%, 86% 13%, 100% 6%, 98% 87%, 84% 96%, 66% 88%, 48% 98%, 30% 88%, 13% 96%, 2% 87%)',
  opacity: .9,
});

const labelStyle: React.CSSProperties = {
  position: 'absolute',
  display: 'grid',
  placeItems: 'center',
  height: 68,
  color: '#f6ecdc',
  fontFamily: brand.fontFamily,
  fontWeight: 1000,
  fontSize: 30,
  letterSpacing: 2,
  backgroundColor: brand.colors.brick,
  backgroundImage: `url(${staticFile('assets/distressed-ink-wear-v1.png')})`,
  backgroundSize: '270px 270px',
  backgroundBlendMode: 'soft-light',
  clipPath: 'polygon(1% 14%, 9% 5%, 22% 11%, 35% 3%, 49% 12%, 63% 5%, 78% 13%, 91% 4%, 99% 12%, 100% 87%, 88% 96%, 74% 89%, 59% 97%, 44% 90%, 28% 98%, 14% 89%, 2% 96%)',
  filter: 'drop-shadow(0 8px 6px rgba(47,31,22,.22))',
};

export const MaterialPhotoDesk: React.FC<MaterialPhotoDeskProps> = ({
  headline,
  status,
  screenRecordingSrc,
  screenRecordingLabel = '真实录屏',
  screenshotSrc,
  screenshotLabel = '操作截图',
  brandVisualSrc,
  brandVisualLabel = '品牌画面',
  audioLabel = '声音素材',
  audioFile,
  stampTop = '素材',
  stampBottom = '到齐',
}) => {
  const frame = useCurrentFrame();
  const titleT = enter(frame, 2, 22);
  const statusT = enter(frame, 12, 18);
  const recordingT = enter(frame, 24, 24);
  const screenshotT = enter(frame, 44, 22);
  const audioT = enter(frame, 64, 22);
  const brandT = enter(frame, 82, 22);
  const stampT = enter(frame, 112, 15);

  return <BrandBackground>
    <div style={{position: 'absolute', left: 98, top: 68, width: 1310, fontFamily: brand.fontFamily, color: brand.colors.ink, fontSize: fit(headline, 72, 18, 56), lineHeight: 1.1, fontWeight: 1000, letterSpacing: 1, whiteSpace: 'nowrap', opacity: titleT, transform: `translateY(${22 * (1 - titleT)}px)`}}>
      {headline}
    </div>

    <div style={{...labelStyle, right: 104, top: 78, width: 250, opacity: statusT, transform: `rotate(${5 - 2.8 * statusT}deg) scale(${.84 + .16 * statusT})`}}>{status}</div>

    <div style={{position: 'absolute', left: 88, top: 240, width: 760, height: 540, opacity: recordingT, transform: `translate(${-54 * (1 - recordingT)}px, ${36 * (1 - recordingT)}px) rotate(${-7 + 3.8 * recordingT}deg) scale(${.94 + .06 * recordingT})`, ...torn('polygon(0 4%, 5% 1%, 12% 5%, 20% 2%, 29% 6%, 39% 1%, 49% 5%, 58% 2%, 68% 6%, 79% 1%, 89% 5%, 97% 2%, 100% 7%, 99% 92%, 93% 98%, 84% 94%, 74% 99%, 64% 95%, 54% 98%, 44% 94%, 33% 99%, 22% 94%, 11% 98%, 1% 93%)')}}>
      <div style={{position: 'absolute', left: 30, right: 30, top: 31, height: 412, overflow: 'hidden', background: '#c9c5bc'}}>
        <Img src={staticFile(screenRecordingSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{...labelStyle, left: 248, bottom: 21, width: 230, fontSize: screenRecordingLabel.length > 5 ? 25 : 30}}>{screenRecordingLabel}</div>
      <div style={{...tapeStyle(), left: 286, top: -13, transform: 'rotate(1deg)'}} />
    </div>

    <div style={{position: 'absolute', left: 860, top: 218, width: 620, height: 408, opacity: screenshotT, transform: `translate(${58 * (1 - screenshotT)}px, ${24 * (1 - screenshotT)}px) rotate(${6 - 3.4 * screenshotT}deg) scale(${.94 + .06 * screenshotT})`, ...torn('polygon(0 6%, 8% 2%, 18% 7%, 30% 1%, 42% 6%, 54% 2%, 67% 7%, 80% 1%, 92% 5%, 100% 3%, 99% 91%, 90% 97%, 79% 93%, 67% 99%, 55% 94%, 43% 98%, 31% 93%, 18% 98%, 7% 94%, 1% 98%)')}}>
      <div style={{position: 'absolute', left: 25, right: 25, top: 26, height: 294, overflow: 'hidden', background: '#cec9bf'}}>
        <Img src={staticFile(screenshotSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '52% 40%'}} />
      </div>
      <div style={{...labelStyle, left: 202, bottom: 18, width: 220, fontSize: screenshotLabel.length > 5 ? 25 : 30}}>{screenshotLabel}</div>
      <div style={{...tapeStyle('rgba(177,153,111,.8)'), left: 226, top: -15, transform: 'rotate(-3deg)'}} />
    </div>

    <div style={{position: 'absolute', right: 86, bottom: 72, width: 650, height: 344, opacity: brandT, transform: `translate(${58 * (1 - brandT)}px, ${52 * (1 - brandT)}px) rotate(${2 - 4.2 * brandT}deg) scale(${.93 + .07 * brandT})`, ...torn('polygon(0 8%, 7% 3%, 17% 7%, 28% 1%, 40% 8%, 52% 2%, 64% 7%, 76% 1%, 87% 7%, 97% 2%, 100% 8%, 99% 90%, 91% 97%, 81% 92%, 70% 99%, 59% 94%, 47% 98%, 35% 93%, 23% 99%, 12% 93%, 1% 97%)')}}>
      <div style={{position: 'absolute', left: 24, right: 24, top: 26, height: 234, overflow: 'hidden', background: '#d4c7b1'}}>
        <Img src={staticFile(brandVisualSrc)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '52% 54%'}} />
      </div>
      <div style={{...labelStyle, left: 222, bottom: 15, width: 210, fontSize: brandVisualLabel.length > 5 ? 24 : 30}}>{brandVisualLabel}</div>
      <div style={{...tapeStyle(), left: 250, top: -17, transform: 'rotate(4deg)'}} />
    </div>

    <div style={{position: 'absolute', left: 170, bottom: 70, width: 680, height: 222, opacity: audioT, transform: `translateY(${68 * (1 - audioT)}px) rotate(${6 - 4 * audioT}deg) scale(${.93 + .07 * audioT})`, ...torn('polygon(0 10%, 8% 3%, 18% 9%, 29% 2%, 41% 8%, 54% 3%, 66% 9%, 79% 2%, 91% 8%, 100% 4%, 99% 88%, 91% 96%, 79% 91%, 67% 98%, 54% 92%, 42% 97%, 29% 91%, 17% 98%, 6% 92%, 1% 97%)')}}>
      <div style={{position: 'absolute', left: 38, top: 32, fontFamily: brand.fontFamily, fontSize: audioLabel.length > 6 ? 21 : 25, fontWeight: 1000, color: brand.colors.brick, letterSpacing: 3}}>{audioLabel}</div>
      <div style={{position: 'absolute', left: 38, right: 38, top: 86, height: 56, display: 'flex', alignItems: 'center', gap: 7}}>
        {[18, 34, 50, 29, 60, 42, 24, 55, 70, 38, 27, 64, 46, 31, 74, 52, 25, 59, 37, 68, 45, 22, 52, 76, 41, 30, 62, 48, 26, 56, 35, 67, 44, 24, 51, 71].map((height, index) => (
          <div key={index} style={{flex: 1, minWidth: 3, height: height * enter(frame, 75 + index * .7, 10), borderRadius: 3, background: index < 21 ? brand.colors.brick : 'rgba(23,21,18,.28)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', left: 40, bottom: 28, fontFamily: 'Consolas, monospace', fontSize: 25, fontWeight: 800, color: '#5b5047'}}>{audioFile}</div>
      <div style={{position: 'absolute', right: 31, bottom: 24, width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#f5ead8', background: brand.colors.ink, fontSize: 23}}>▶</div>
      <div style={{...tapeStyle('rgba(177,153,111,.76)'), left: 260, top: -16, transform: 'rotate(-2deg)'}} />
    </div>

    <div style={{position: 'absolute', left: 1030, top: 642, width: 176, height: 176, borderRadius: '50%', border: `8px double ${brand.colors.brick}`, color: brand.colors.brick, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: brand.fontFamily, fontSize: 34, lineHeight: 1.15, fontWeight: 1000, transform: `rotate(${-12 + 21 * stampT}deg) scale(${.45 + .55 * stampT})`, opacity: .9 * stampT}}>{stampTop}<br/>{stampBottom}</div>
  </BrandBackground>
};
