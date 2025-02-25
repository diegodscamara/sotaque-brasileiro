declare module 'react-circle-flags' {
  import React, { DetailedHTMLProps, ImgHTMLAttributes } from 'react';

  export interface CircleFlagProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    countryCode: string;
    height?: number | string;
    width?: number | string;
    cdnUrl?: string;
  }

  export const CircleFlag: React.FC<CircleFlagProps>;
  export const CircleFlagLanguage: React.FC<Omit<CircleFlagProps, 'countryCode'> & { languageCode: string }>;
} 