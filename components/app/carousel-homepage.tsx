import React, { useState } from 'react';
import { View, Dimensions, Text, ScrollView } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import { UserCheck, ShieldCheck, RefreshCw, Award, LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';

const width = Dimensions.get('window').width;
const carouselHeight = width / 2;

export function CarouselBanner({bannerQuery}: {bannerQuery: ReturnType<typeof useListBannerQuery>}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Lấy thêm trạng thái isFetching (hoặc isRefetching)
  const { data: banners, isLoading, isFetching } = bannerQuery;

  // --- TRƯỜNG HỢP 1: HIỂN THỊ SKELETON KHI LOADING HOẶC REFETCHING ---
  if (isLoading || isFetching || !banners || banners.length === 0) {
    return (
      <View className="p-0">
        {/* Skeleton phải có kích thước cố định bằng Carousel để giữ layout */}
        <Skeleton
          style={{ width: width - 32, height: carouselHeight }} // Trừ 32px nếu bạn có padding-x-4
          className="rounded-lg bg-gray-200"
        />
      </View>
    );
  }

  // --- TRƯỜNG HỢP 2: HIỂN THỊ CAROUSEL KHI DỮ LIỆU ĐÃ CÓ ---
  return (
    <View className="relative items-center justify-center">
      <Carousel
        loop
        width={width}
        height={carouselHeight} // Dùng chiều cao cố định
        autoPlay={true}
        autoPlayInterval={3000}
        data={banners} // Dùng data từ query
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <View className="flex-1 justify-center">
            <Image
              source={{ uri: item.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={500}
            />
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View className="absolute bottom-2.5 flex-row self-center">
        {banners.map((_, index) => (
          <View
            key={index}
            className={`mx-1 h-2 w-2 rounded-full ${
              index === activeIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </View>
    </View>
  );
}


const FeatureCard = ({ IconComponent , text }: { IconComponent: LucideIcon, text: string }) => (
  <View
    className="flex-row items-center justify-center p-2"
  >
    <View className="flex-row items-center">
      <View className="mr-1.5 p-1 rounded-full border border-primary-color-2 bg-blue-50">
        <IconComponent size={16} color={DefaultColor.base['primary-color-1']} />
      </View>
      <Text className="text-primary-color-1 text-sm font-inter-medium pr-1">
        {text}
      </Text>
    </View>
  </View>
);

export const ScrollCommit = () => {
  const {t} = useTranslation();
  return (
    <ScrollView
      className="bg-blue-200 border border-primary-color-2 rounded-xl mt-4"
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <FeatureCard IconComponent={UserCheck} text={t('homepage.features.verify')} />
      <FeatureCard IconComponent={ShieldCheck} text={t('homepage.features.service')} />
      <FeatureCard IconComponent={RefreshCw} text={t('homepage.features.cancel')} />
      <FeatureCard IconComponent={Award} text={t('homepage.features.award')} />
    </ScrollView>
  );
}
