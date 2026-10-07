import React from 'react';
import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {brand} from '../styles/brand';

export type InputConvergenceItem = {
  label: string;
  mark?: string;
};

export type InputConvergenceProps = {
  headline: string;
  inputs: InputConvergenceItem[];
  outputLabel: string;
};

const fitFont = (text: string, preferred: number, safeChars: number, minimum: number) =>
  Math.max(minimum, Math.min(preferred, preferred * safeChars / Math.max(Array.from(text).length, safeChars)));

const sourceCrop = {x: 170, y: 4, width: 1494, height: 356};

const SourceTag: React.FC<{item: InputConvergenceItem; left: number; top: number; width: number; height: number; emphasis?: boolean}> = ({item, left, top, width, height, emphasis = false}) => {
  const circleX = width * 255 / 1494;
  const circleY = height * 210 / 356;
  const circleSize = height * .53;
  const textLeft = width * .24;
  const textWidth = width * .62;
  return (
    <div style={{position: 'absolute', left, top, width, height, filter: 'drop-shadow(0 10px 7px rgba(45,32,22,.16))'}}>
      <SpriteCrop asset="assets/multi-point-torn-paper-sprites-v1.png" sheetWidth={1672} sheetHeight={941} crop={sourceCrop} width={width} height={height} style={{position: 'absolute', inset: 0}} />
      <div style={{position: 'absolute', left: circleX - circleSize / 2, top: circleY - circleSize / 2, width: circleSize, height: circleSize, display: 'flex', alignItems: 'center', justifyContent: 'center', color: brand.colors.paper, fontFamily: brand.fontFamily, fontSize: fitFont(item.mark ?? '', emphasis ? 48 : 34, 2, emphasis ? 36 : 24), lineHeight: 1, fontWeight: 1000, paddingTop: 3, boxSizing: 'border-box', textAlign: 'center'}}>{item.mark ?? ''}</div>
      <div style={{position: 'absolute', left: textLeft, top: circleY - height * .25, width: textWidth, height: height * .5, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(item.label, emphasis ? height * .32 : height * .34, emphasis ? 6 : 6, emphasis ? height * .24 : height * .25), lineHeight: 1, fontWeight: 1000, whiteSpace: 'nowrap'}}>{item.label}</div>
    </div>
  );
};

export const InputConvergence: React.FC<InputConvergenceProps> = ({headline, inputs, outputLabel}) => {
  const frame = useCurrentFrame();
  const progress = (start: number, duration: number) => interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const titleIn = progress(0, 16);
  const resultIn = progress(108, 18);
  const safeInputs = inputs.slice(0, 6);
  const count = Math.max(1, safeInputs.length);
  const compact = count >= 5;
  const tagWidth = compact ? 460 : 500;
  const tagHeight = tagWidth * sourceCrop.height / sourceCrop.width;
  const firstTop = compact ? 270 : 300;
  const available = compact ? 575 : 430;
  const step = count === 1 ? 0 : available / (count - 1);
  const mergeY = 586;
  const ribbonWidth = compact ? 78 : 94;
  const tones = ['#b79a72', '#e7dbc6', brand.colors.brick, '#c7aa80', '#e7dbc6', '#b79a72'];

  return (
    <BrandBackground>
      <div style={{position: 'absolute', inset: 0, opacity: titleIn, transform: `translateY(${(1 - titleIn) * 14}px)`}}>
      <div style={{position: 'absolute', left: 90, top: 54, width: 1740, textAlign: 'center', color: brand.colors.ink, fontFamily: brand.fontFamily, fontSize: fitFont(headline, 76, 20, 46), fontWeight: 1000, lineHeight: 1.13, letterSpacing: 1, whiteSpace: 'nowrap'}}>{headline}</div>
      <div style={{position: 'absolute', left: 840, top: 167, width: 710, height: 8, backgroundColor: brand.colors.brick, clipPath: 'polygon(0 38%, 9% 3%, 22% 42%, 36% 9%, 51% 47%, 66% 4%, 82% 40%, 100% 7%, 98% 86%, 83% 62%, 68% 94%, 51% 66%, 34% 96%, 18% 65%, 2% 100%)'}} />

      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id="input-convergence-fiber" patternUnits="userSpaceOnUse" width="600" height="200">
            <image href={staticFile('assets/paper-fiber-texture-v1.png')} x="0" y="0" width="600" height="200" preserveAspectRatio="none" />
          </pattern>
          <marker id="input-convergence-arrow" markerWidth="15" markerHeight="15" refX="13" refY="7.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M1,1 L14,7.5 L1,14 Z" fill={brand.colors.ink} />
          </marker>
          {safeInputs.map((_, index) => (
            <filter key={index} id={`input-convergence-torn-${index}`} x="-12%" y="-35%" width="124%" height="170%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.055" numOctaves="2" seed={index + 11} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={compact ? 7 : 10} xChannelSelector="R" yChannelSelector="B" />
            </filter>
          ))}
        </defs>
        {safeInputs.map((_, index) => {
          const startY = firstTop + index * step + tagHeight * .58;
          const endY = mergeY + (index - (count - 1) / 2) * 7;
          const controlY = startY + (endY - startY) * .55;
          const ribbonPath = `M 650 ${startY} C 790 ${startY}, 845 ${controlY}, 1180 ${endY}`;
          const arrowStartY = startY + (mergeY - startY) * .10;
          const arrowControlY = startY + (endY - startY) * .38;
          const arrowEndY = startY + (endY - startY) * .56;
          const arrowPath = `M 720 ${arrowStartY} C 780 ${arrowStartY}, 830 ${arrowControlY}, 900 ${arrowEndY}`;
          const ribbonIn = progress(26 + index * 10, 30);
          const arrowIn = progress(46 + index * 10, 14);
          return (
            <g key={index}>
              <defs><mask id={`ribbon-reveal-${index}`} maskUnits="userSpaceOnUse" x="600" y="200" width="650" height="850"><path d={ribbonPath} fill="none" stroke="white" strokeWidth={ribbonWidth + 65} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ribbonIn} /></mask></defs>
              <g mask={`url(#ribbon-reveal-${index})`} opacity={ribbonIn > 0 ? 1 : 0}>
              <path d={ribbonPath} fill="none" stroke={brand.colors.mutedBrick} strokeWidth={ribbonWidth + 12} strokeLinecap="butt" opacity=".34" transform="translate(5 7)" filter={`url(#input-convergence-torn-${index})`} />
              <path d={ribbonPath} fill="none" stroke={tones[index]} strokeWidth={ribbonWidth} strokeLinecap="butt" filter={`url(#input-convergence-torn-${index})`} />
              <path d={ribbonPath} fill="none" stroke="url(#input-convergence-fiber)" strokeWidth={ribbonWidth - 4} strokeLinecap="butt" opacity={tones[index] === brand.colors.brick ? .28 : .60} style={{mixBlendMode: 'multiply'}} filter={`url(#input-convergence-torn-${index})`} />
              </g>
              <path d={arrowPath} fill="none" stroke={brand.colors.ink} strokeWidth="3" strokeLinecap="round" markerEnd="url(#input-convergence-arrow)" opacity={arrowIn} />
            </g>
          );
        })}
      </svg>

      {safeInputs.map((item, index) => (
        <div key={`${item.label}-${index}`} style={{position: 'absolute', inset: 0, opacity: progress(14 + index * 10, 16), transform: `translateX(${(1 - progress(14 + index * 10, 16)) * -28}px)`}}><SourceTag item={item} left={280} top={firstTop + index * step} width={tagWidth} height={tagHeight} /></div>
      ))}

      <div style={{position: 'absolute', inset: 0, opacity: resultIn, transform: `translateY(${(1 - resultIn) * 16}px)`}}>
      <SourceTag item={{label: outputLabel, mark: '▤'}} left={1125} top={520} width={550} height={550 * sourceCrop.height / sourceCrop.width} emphasis />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: progress(126, 10)}}>
      <div style={{position: 'absolute', left: 1570, top: 471, width: 9, height: 42, backgroundColor: brand.colors.brick, transform: 'rotate(19deg)'}} />
      <div style={{position: 'absolute', left: 1607, top: 486, width: 9, height: 39, backgroundColor: brand.colors.brick, transform: 'rotate(43deg)'}} />
      <div style={{position: 'absolute', left: 1632, top: 516, width: 9, height: 35, backgroundColor: brand.colors.brick, transform: 'rotate(69deg)'}} />
      </div>
    </BrandBackground>
  );
};
