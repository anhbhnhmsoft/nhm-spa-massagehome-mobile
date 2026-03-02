import React, { useState, useEffect, FC, useMemo } from 'react';
import { View,  StyleProp, ImageStyle } from 'react-native';
import { User } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color'; // Hoặc icon thư viện bạn dùng
import { Image } from 'expo-image';


interface AvatarProps {
  source?: string | null;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: StyleProp<ImageStyle>;
  fallbackIconSize?: number;
}

const Avatar: FC<AvatarProps> = ({
                                   source,
                                   size = 60,
                                   borderColor = DefaultColor.base['primary-color-2'],
                                   borderWidth = 2,
                                   style,
                                   fallbackIconSize = 24,
                                 }) => {

  const [imageError, setImageError] = useState(false);

  // Reset lại trạng thái error khi source thay đổi (quan trọng khi user đổi ảnh)
  useEffect(() => {
    setImageError(false);
  }, [source]);

  const containerStyle: ImageStyle = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: 9999,
    borderWidth: borderWidth,
    borderColor: borderColor,
    backgroundColor: DefaultColor.slate[100],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  }), [size, borderColor, borderWidth]);

  if (!source || imageError) {
    return (
      <View style={[containerStyle, style]}>
        <User size={fallbackIconSize} color={DefaultColor.slate[500]} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: source }}
      style={[containerStyle, style]}
      contentFit="cover"
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;