import React from 'react';
import {Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {SpriteCrop} from '../components/SpriteCrop';
import {enter} from '../components/motion';
import {brand} from '../styles/brand';

// Measured alpha bounds of the four isolated objects. No nonuniform scaling.
export const timelineIllustrations = {
  delivery: {x: 152, y: 56, width: 593, height: 423},
  calendar: {x: 1020, y: 19, width: 521, height: 454},
  waiting: {x: 254, y: 499, width: 526, height: 381},
  disconnected: {x: 995, y: 506, width: 586, height: 368},
} as const;
export type TimelineEvent = {
  time: string;
  title: string;
  illustration: keyof typeof timelineIllustrations;
  imageSrc?: string;
  atSeconds?: number;
};
export type TimelineEventsProps = {events: TimelineEvent[]; debug?: boolean};

const requireShortText = (text: string, max: number, field: string) => {
  if (!text.trim() || Array.from(text).length > max) {
    throw new Error(field + ' must contain 1–' + max + ' characters; shorten the display text.');
  }
};
export const TimelineEvents: React.FC<TimelineEventsProps> = ({events, debug = false}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  if (events.length < 3 || events.length > 5) {
    throw new Error('TimelineEvents requires 3–5 events. Do not duplicate or truncate events.');
  }
  events.forEach((event, index) => {
    requireShortText(event.time, 8, 'events[' + index + '].time');
    requireShortText(event.title, 10, 'events[' + index + '].title');
    if (!(event.illustration in timelineIllustrations)) throw new Error('Unknown illustration');
    if (event.atSeconds !== undefined && (!Number.isFinite(event.atSeconds) || event.atSeconds < 0 ||
        event.atSeconds * fps + 24 >= durationInFrames)) {
      throw new Error('atSeconds must leave at least 24 frames for entry.');
    }
  });
  const margin = 56;
  const span = 1920 - margin * 2;
  const cell = span / events.length;
  const axisY = 708;
  const axisT = enter(frame, 0, 24);
  return (
    <BrandBackground>
      <div style={{position: 'absolute', left: margin - 16, width: span + 32,
        top: axisY, height: 3, background: brand.colors.brick,
        transform: 'scaleX(' + axisT + ')', transformOrigin: 'left'}} />
      {events.map((event, index) => {
        const start = event.atSeconds === undefined ? 10 + index * 28 : Math.round(event.atSeconds * fps);
        const progress = enter(frame, start, 24);
        const textProgress = enter(frame, start + 10, 16);
        const centerX = margin + cell * (index + 0.5);
        const crop = timelineIllustrations[event.illustration];
        const artWidth = cell + 8;
        const artHeight = crop.height * artWidth / crop.width;
        const textWidth = cell - 24;
        // Explicit protected bands: art <= 700; dates >= 771; subtitles >= 940.
        return (
          <React.Fragment key={index}>
            <div style={{position: 'absolute', left: centerX - artWidth / 2,
              top: axisY - 8 - (event.imageSrc ? 440 : artHeight),
              width: artWidth, height: event.imageSrc ? 440 : artHeight,
              opacity: progress, transform: 'translateY(' + (-18 * (1 - progress)) + 'px)',
              outline: debug ? '2px solid green' : undefined}}>
              {event.imageSrc ? (
                <Img src={staticFile(event.imageSrc)} style={{width:'100%', height:'100%',
                  objectFit:'contain', objectPosition:'center bottom'}} />
              ) : (
                <SpriteCrop asset="assets/timeline-collage-sprites-v1.png"
                  sheetWidth={1774} sheetHeight={887} crop={crop} width={artWidth} />
              )}
            </div>
            <div style={{position:'absolute', left:centerX - 1.5, top:axisY, width:3, height:48,
              background:brand.colors.brick, opacity:textProgress}} />
            <div style={{position:'absolute', left:centerX - 7, top:axisY - 5.5,
              width:14, height:14, borderRadius:'50%', background:brand.colors.brick,
              opacity:textProgress}} />
            <div style={{position:'absolute', left:centerX - textWidth / 2, top:771,
              width:textWidth, height:100, textAlign:'center', fontFamily:brand.fontFamily,
              opacity:textProgress, outline:debug ? '2px dashed blue' : undefined}}>
              <div style={{fontSize:Math.min(40, (textWidth - 16) / Array.from(event.time).length),
                fontWeight:900, color:brand.colors.ink, lineHeight:'50px', whiteSpace:'nowrap'}}>{event.time}</div>
              <div style={{fontSize:Math.min(30, (textWidth - 16) / Array.from(event.title).length),
                fontWeight:700, color:brand.colors.brick, lineHeight:'42px', whiteSpace:'nowrap'}}>{event.title}</div>
            </div>
          </React.Fragment>
        );
      })}
      {debug ? <div style={{position:'absolute', top:940, width:'100%', borderTop:'2px dashed blue'}} /> : null}
    </BrandBackground>
  );
};
