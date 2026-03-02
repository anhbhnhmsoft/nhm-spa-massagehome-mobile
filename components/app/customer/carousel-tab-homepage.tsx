import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';
import DefaultColor from '@/components/styles/color';
import { MapPin } from 'lucide-react-native';
import { Text } from 'moti';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApplicationStore } from '@/features/app/stores';
import { TFunction } from 'i18next';


const width = Dimensions.get('window').width;
const carouselHeight = width * 0.6;


export const CarouselBanner :FC<{
  bannerQuery: ReturnType<typeof useListBannerQuery>
  setShowLocationModal: Dispatch<SetStateAction<boolean>>;
  t: TFunction;
}> = ({ bannerQuery, setShowLocationModal, t }) => {
  const insets = useSafeAreaInsets();

  const redirectAuth = useCheckAuthToRedirect();

  const locationUser = useApplicationStore((state) => state.location);


  return (
    <View className="overflow-hidden">
      {/* --- HEADER FLOATING LOCATION --- */}
      <View
        className="absolute z-50 flex-row items-center px-4"
        style={{ top: insets.top + 20 }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => redirectAuth(() => setShowLocationModal(true))}
          className="flex-row items-center rounded-full border border-white/20 bg-black/30 px-4 py-2.5"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <MapPin size={14} color="white" />
          <Text
            className="ml-1.5 max-w-[150px] font-inter-medium text-[13px] text-white"
            numberOfLines={1}>
            {locationUser?.address || t('header_app.need_location')}
          </Text>
        </TouchableOpacity>
      </View>
      {/* --- BANNER CAROUSEL --- */}
      <Banner bannerQuery={bannerQuery} />
    </View>
  );
};


function Banner({ bannerQuery }: { bannerQuery: ReturnType<typeof useListBannerQuery> }) {

  const [activeIndex, setActiveIndex] = useState(0);

  const { data: banners, isLoading, isFetching } = bannerQuery;

  // --- HIỂN THỊ SKELETON KHI LOADING HOẶC REFETCHING ---
  if (isLoading || isFetching || !banners || banners.length === 0) {
    return (
      <View className="items-center justify-center p-0">
        {/* Skeleton phải có kích thước cố định bằng Carousel để giữ layout */}
        <Skeleton
          style={{ width: width, height: carouselHeight }} // Trừ 32px nếu bạn có padding-x-4
          className="rounded-2xl bg-gray-200"
        />
      </View>
    );
  }

  // --- HIỂN THỊ CAROUSEL KHI DỮ LIỆU ĐÃ CÓ ---
  return (
    <View className="relative">
      <Carousel
        loop
        width={width}
        height={carouselHeight}
        autoPlay={true}
        autoPlayInterval={3000}
        data={banners} // Dùng data từ query
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setActiveIndex(index)}
        renderItem={({ item }) => (
          <View className="h-full w-full">
            <Image
              source={{ uri: item.image_url }}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: DefaultColor.slate['300'],
              }}
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