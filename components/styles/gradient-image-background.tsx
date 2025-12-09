import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Image, ImageSourcePropType, ViewProps, ImageStyle } from 'react-native';
import { cn } from '@/lib/utils';

interface GradientBackgroundProps extends ViewProps {
  className?: string;
  colors?: readonly [string, string, ...string[]];
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  imageSource?: ImageSourcePropType;
  imageStyle?: ImageStyle;
  gradientOpacity?: number;
  children?: React.ReactNode;
}

export default function GradientImageBackground({
                                             className,
                                             children,
                                             colors = ['#044984', '#2B7BBE'],
                                             direction = 'horizontal',
                                             imageSource,
                                             imageStyle,
                                             gradientOpacity = 0.9, // Tăng mặc định lên 0.9 cho đậm màu
                                             style,
                                             ...props
                                           }: GradientBackgroundProps) {

  const getCoordinates = () => {
    switch (direction) {
      case 'vertical': return { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } };
      case 'diagonal': return { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      case 'horizontal': default: return { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };
    }
  };

  const { start, end } = getCoordinates();

  // Tách các class liên quan đến layout/border ra khỏi padding
  // Mục đích: Container chịu trách nhiệm bo góc và kích thước, KHÔNG chịu trách nhiệm padding
  return (
    <View
      className={cn('relative overflow-hidden', className)}
      style={style}
      {...props}
    >
      {/* 1. LỚP ẢNH: Luôn full 100% */}
      {imageSource && (
        <Image
          source={imageSource}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
          style={imageStyle}
        />
      )}

      {/* 2. LỚP GRADIENT */}
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={{
          position:"absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width:"100%",
          height:"100%",
          opacity: imageSource ? gradientOpacity : 1
      }}
      />

      {/* 3. LỚP NỘI DUNG: Đây là nơi an toàn để chứa children */}
      <View className="relative z-10 flex-1">
        {children}
      </View>
    </View>
  );
}