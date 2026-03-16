import Carousel from 'react-native-reanimated-carousel';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ChevronLeft, ImageOff } from 'lucide-react-native';
import { goBack } from '@/lib/utils';
import React, { FC, useState } from 'react';
import { TFunction } from 'i18next';
import { Image } from 'expo-image';

const { width: PAGE_WIDTH } = Dimensions.get('window');

const CAROUSEL_HEIGHT = PAGE_WIDTH * 1.2; // Tỷ lệ ảnh dọc (giống hình mẫu)

type Props = {
  images: { id: string; url: string }[];
  t: TFunction;
  ktvId: string;
};

/**
 * Hiển thị ảnh review của KTV trong màn hình chi tiết KTV
 * @constructor
 */
export const CarouselImageKtvSection: FC<Props> = ({ images, t, ktvId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <View className="relative">
      {/* --- CAROUSEL --- */}
      <Carousel
        loop
        width={PAGE_WIDTH}
        height={CAROUSEL_HEIGHT}
        autoPlay={false}
        data={images}
        scrollAnimationDuration={1000}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => (
          <View className="flex-1 justify-center">
            <ImageDisplay source={item.url} width={PAGE_WIDTH} height={CAROUSEL_HEIGHT} />
          </View>
        )}
      />

      {/* Badge đếm số ảnh (Overlay ở góc dưới) */}
      <View
        style={{ bottom: 32, right: 16 }}
        className="absolute rounded-full bg-black/50 px-3 py-1">
        <Text className="font-inter-medium text-xs text-white">
          {t('masseurs_detail.display_image')} {currentIndex + 1}/{images.length}
        </Text>
      </View>

      {/* Nút Back hoặc Action phía trên */}
      <TouchableOpacity
        onPress={() => goBack()}
        className="absolute left-4 top-12 rounded-full bg-white/80 p-2">
        {/* Icon Back ở đây nếu cần */}
        <Icon as={ChevronLeft} size={20} className="text-primary-color-2" />
      </TouchableOpacity>
    </View>
  );
};

const ImageDisplay = ({
  source,
  width,
  height,
}: {
  source: string;
  width: number;
  height: number;
}) => {
  const [hasError, setHasError] = useState(false);

  // Nếu có lỗi, render ra khung Placeholder (Icon + Text)
  if (hasError || !source) {
    return (
      <View style={{ width, height }} className={`items-center justify-center bg-gray-200`}>
        <Icon as={ImageOff} size={32} className="text-slate-400" />
      </View>
    );
  }

  // Nếu bình thường, render ra ảnh gốc
  return (
    <Image
      source={source}
      style={{ width, height }}
      contentFit={'cover'}
      onError={() => setHasError(true)}
    />
  );
};
