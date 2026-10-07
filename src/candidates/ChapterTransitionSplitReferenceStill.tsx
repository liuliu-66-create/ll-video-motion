import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DistressedNumber} from './ChapterTransitionReferenceStill';

/**
 * Source-locked style frame for the approved split-newspaper reference.
 *
 * This candidate deliberately keeps the supplied key art intact so the
 * typography, paper grain, torn seam, distress marks, and layout can be
 * reviewed without any reconstruction drift. It is not yet the editable or
 * animated template implementation.
 */
export const ChapterTransitionSplitReferenceStill: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#e8deca', overflow: 'hidden'}}>
    <Img
      src={staticFile('assets/chapter-transition-split-reference-v1.png')}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'fill',
      }}
    />
  </AbsoluteFill>
);

const tornLeftEdge =
  'polygon(1.4% 0, 100% 0, 100% 100%, 1.6% 100%, .8% 96%, 1.8% 91%, .7% 86%, 2% 81%, .9% 76%, 1.7% 71%, .6% 66%, 1.9% 61%, .8% 56%, 1.6% 51%, .7% 46%, 2% 41%, .9% 36%, 1.7% 31%, .7% 26%, 1.9% 21%, .8% 16%, 1.7% 11%, .7% 6%)';

export type ChapterTransitionSplitReferenceMotionProps = {
  sectionNumber?: string;
  title?: string;
};

export const ChapterTransitionSplitReferenceMotion: React.FC<ChapterTransitionSplitReferenceMotionProps> = ({
  sectionNumber = '01',
  title: titleText = '工具使用教程',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const backgroundReveal = spring({frame, fps, config: {damping: 18, stiffness: 88, mass: 0.9}});
  const numberReveal = spring({frame: frame - 18, fps, config: {damping: 14, stiffness: 112, mass: 0.78}});
  const numberOpacity = interpolate(frame, [18, 27], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleReveal = interpolate(frame, [48, 73], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [132, 149], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const backgroundScale = interpolate(frame, [0, 42], [1.028, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const number = {left: 121, top: 138, width: 632, height: 924};
  const title = {left: 867, top: 402, width: 1033, height: 264};
  const useApprovedRaster = sectionNumber === '01' && titleText === '工具使用教程';

  return (
    <AbsoluteFill style={{backgroundColor: '#e8deca', overflow: 'hidden', opacity: exit}}>
      <AbsoluteFill
        style={{
          opacity: backgroundReveal,
          transform: `scale(${backgroundScale})`,
          transformOrigin: '50% 50%',
        }}
      >
        <Img
          src={staticFile('assets/newspaper-neutral-v1.png')}
          style={{
            position: 'absolute',
            inset: 0,
            width: 815,
            height: 1080,
            objectFit: 'cover',
            objectPosition: '0 50%',
            filter: 'invert(1) grayscale(1) sepia(.2) brightness(.57) contrast(1.24)',
          }}
        />
        <Img
          src={staticFile('assets/newspaper-neutral-v1.png')}
          style={{
            position: 'absolute',
            left: 785,
            top: 0,
            width: 1165,
            height: 1080,
            objectFit: 'cover',
            objectPosition: '52% 50%',
            filter: 'sepia(.2) saturate(.68) brightness(1.03) contrast(.9)',
            clipPath: tornLeftEdge,
            boxShadow: '-15px 0 26px rgba(24,18,14,.28)',
          }}
        />
      </AbsoluteFill>

      {useApprovedRaster ? (
        <Img
          src={staticFile('assets/chapter-transition-split-number-v1.png')}
          style={{
            position: 'absolute',
            left: number.left,
            top: number.top,
            width: number.width,
            height: number.height,
            opacity: numberOpacity,
            transform: `translateX(${-430 * (1 - numberReveal)}px)`,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translate(12px, 62px) scale(.78)',
            transformOrigin: '0 0',
          }}
        >
          <DistressedNumber value={sectionNumber} progress={numberReveal * numberOpacity} exit={1} />
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: title.left,
          top: title.top,
          width: title.width * titleReveal,
          height: title.height,
          overflow: 'hidden',
        }}
      >
        {useApprovedRaster ? (
          <Img
            src={staticFile('assets/chapter-transition-split-title-v1.png')}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: title.width,
              height: title.height,
              maxWidth: 'none',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              color: '#151412',
              fontFamily: 'Noto Sans SC, Microsoft YaHei, SimHei, sans-serif',
              fontSize: titleText.length <= 7 ? 142 : titleText.length <= 10 ? 116 : 94,
              fontWeight: 900,
              letterSpacing: -5,
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {titleText}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
