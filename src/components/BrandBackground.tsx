import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {brand} from '../styles/brand';

export const BrandBackground: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: brand.colors.background, overflow: 'hidden'}}>
    <Img
      src={staticFile(brand.backgroundAsset)}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    />
    {children}
  </AbsoluteFill>
);
