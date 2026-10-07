import React from 'react';
import {Img, staticFile} from 'remotion';

export type SpriteCropRect = {x: number; y: number; width: number; height: number};

export const SpriteCrop: React.FC<{
  asset: string;
  sheetWidth: number;
  sheetHeight: number;
  crop: SpriteCropRect;
  width: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({asset, sheetWidth, sheetHeight, crop, width, height, style}) => {
  const targetHeight = height ?? width * crop.height / crop.width;
  const scaleX = width / crop.width;
  const scaleY = targetHeight / crop.height;
  return (
    <div style={{position: 'relative', width, height: targetHeight, overflow: 'hidden', ...style}}>
      <Img
        src={staticFile(asset)}
        style={{
          position: 'absolute',
          width: sheetWidth * scaleX,
          height: sheetHeight * scaleY,
          maxWidth: 'none',
          left: -crop.x * scaleX,
          top: -crop.y * scaleY,
        }}
      />
    </div>
  );
};
