import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps extends ViewProps {
  className?: string;
  colors?: readonly [string, string, ...string[]];
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  children?: React.ReactNode;
}

const getCoordinates = (direction?: 'horizontal' | 'vertical' | 'diagonal') => {
  switch (direction) {
    case 'vertical':
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
    case 'diagonal':
      return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
    case 'horizontal':
    default:
      return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
  }
};


export default function GradientBackground({
                                     className,
                                     children,
                                     colors = ['#044984', '#2B7BBE'],
                                     direction = 'horizontal',
                                     style,
                                     ...props
                                   }: GradientBackgroundProps) {

  // 2. Tính toán toạ độ start/end dựa trên hướng
  const { start, end } = getCoordinates(direction);

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      className={cn('w-full', className)}
      style={style}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}