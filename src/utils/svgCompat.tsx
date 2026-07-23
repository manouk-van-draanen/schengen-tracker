/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { View } from 'react-native-web';

export const Svg = React.forwardRef(({ style, width, height, viewBox, children, ...props }: any, ref: any) => {
  return (
    <View style={style} ref={ref} {...props}>
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </svg>
    </View>
  );
});

export const Circle = React.forwardRef((props: any, ref: any) => {
  return <circle ref={ref} {...props} />;
});

export const Rect = React.forwardRef((props: any, ref: any) => {
  return <rect ref={ref} {...props} />;
});

export const Path = React.forwardRef((props: any, ref: any) => {
  return <path ref={ref} {...props} />;
});

export const G = React.forwardRef((props: any, ref: any) => {
  return <g ref={ref} {...props} />;
});

export default Svg;
