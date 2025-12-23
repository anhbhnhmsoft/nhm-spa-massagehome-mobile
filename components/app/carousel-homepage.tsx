import React, { useMemo, useState } from 'react';
import { View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import { ShieldCheck, Award, ThumbsUp, RotateCcw, Clock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useGetListKTVHomepage } from '@/features/user/hooks';
import { router } from 'expo-router';
import { KTVHomePageCard } from '@/components/app/ktv-card';
import Empty from '@/components/empty';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard from '@/components/app/category-card';

const width = Dimensions.get('window').width;
const carouselHeight = width * 0.5;

// Carousel hiển thị banner trong trang chủ
export function CarouselBanner({
  bannerQuery,
}: {
  bannerQuery: ReturnType<typeof useListBannerQuery>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Lấy thêm trạng thái isFetching (hoặc isRefetching)
  const { data: banners, isLoading, isFetching } = bannerQuery;

  // --- TRƯỜNG HỢP 1: HIỂN THỊ SKELETON KHI LOADING HOẶC REFETCHING ---
  if (isLoading || isFetching || !banners || banners.length === 0) {
    return (
      <View className="p-0 items-center justify-center">
        {/* Skeleton phải có kích thước cố định bằng Carousel để giữ layout */}
        <Skeleton
          style={{ width: width - 32, height: carouselHeight }} // Trừ 32px nếu bạn có padding-x-4
          className="rounded-2xl bg-gray-200"
        />
      </View>
    );
  }

  // --- TRƯỜNG HỢP 2: HIỂN THỊ CAROUSEL KHI DỮ LIỆU ĐÃ CÓ ---
  return (
    <View className="relative">
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
          <View className="h-full w-full px-4">
            <Image
              source={{ uri: item.image_url }}
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
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

// Dữ liệu hiển thị trong carousel Trust
const TRUST_ITEMS = [
  {
    title: 'homepage.features.verify',
    sub: 'homepage.features.verify_sub',
    icon: ShieldCheck,
  },
  {
    title: 'homepage.features.service',
    sub: 'homepage.features.service_sub',
    icon: ThumbsUp,
  },
  {
    title: 'homepage.features.cancel',
    sub: 'homepage.features.cancel_sub',
    icon: RotateCcw,
  },
  {
    title: 'homepage.features.award',
    sub: 'homepage.features.award_sub',
    icon: Award,
  },
];
export const VerifyFeatureSection = () => {
  const { t } = useTranslation();
  return (
    <View className="mx-4 mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <Text className="mb-3 text-base font-inter-bold text-slate-800">
        {t('homepage.features_trust')}
      </Text>
      <View className="flex-row flex-wrap">
        {TRUST_ITEMS.map((item, index) => {
          const IconComp = item.icon;
          return (
            <View
              key={index}
              className={`mb-4 w-1/2 flex-row ${index % 2 !== 0 ? 'pl-2' : 'pr-2'}`}>
              <View className="mr-3 mt-0.5">
                <Icon
                  as={IconComp}
                  size={20}
                  color={DefaultColor.base['primary-color-2']}
                  strokeWidth={2.5}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 font-inter-bold text-xs text-slate-700">
                  {t(item.title)}
                </Text>
                <Text className="text-[10px] leading-3 text-slate-400">{t(item.sub)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Carousel hiển thị KTV trong trang chủ
export const HomePageKTVSection = ({ queryKTV }: { queryKTV: ReturnType<typeof useGetListKTVHomepage> }) => { // Giả sử tên component cha là thế này
  const { t } = useTranslation();

  // --- LOGIC CHIA NHÓM DỮ LIỆU (QUAN TRỌNG) ---
  // Chia mảng gốc thành các mảng con, mỗi mảng con chứa tối đa 2 phần tử
  const chunkedKTVData = useMemo(() => {
    if (!queryKTV.data || queryKTV.data.length === 0) return [];

    const chunkSize = 2;
    const chunks = [];
    for (let i = 0; i < queryKTV.data.length; i += chunkSize) {
      chunks.push(queryKTV.data.slice(i, i + chunkSize));
    }
    return chunks;
    // Kết quả sẽ dạng: [ [KTV1, KTV2], [KTV3, KTV4], [KTV5] ]
  }, [queryKTV.data]);


  return (
    <View className="mt-6">
      {/* Header Section */}
      <View className="mb-3 flex-row items-center justify-between px-4">
        <Text className="text-base font-inter-bold text-slate-800">{t('homepage.technician_suggest')}</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tab)/masseurs')}>
          <Text className="text-xs font-inter-bold text-primary-color-2">
            {t('common.see_all')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View className={"px-4"}>
        {queryKTV.isLoading && queryKTV.isRefetching ? (
          // --- GIỮ NGUYÊN LOADING SKELETON CŨ ---
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className={"px-4"}>
            <View className="flex flex-row items-center gap-4 mr-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="gap-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-4 w-[100px]" /></View>
            </View>
            <View className="flex flex-row items-center gap-4 mr-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="gap-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-4 w-[100px]" /></View>
            </View>
          </ScrollView>
        ) : (
          <>
            {chunkedKTVData.length > 0 ? (
              // --- THAY THẾ BẰNG CAROUSEL ---
              <Carousel
                loop={true} // Lặp lại vô tận
                autoPlay={true} // Tự động chạy
                autoPlayInterval={3000} // 3 giây chuyển 1 lần
                width={width - 16}
                height={270} // Chiều cao ước tính của Card + padding (cần đủ lớn để chứa card)
                data={chunkedKTVData} // Dùng dữ liệu đã chia nhóm
                scrollAnimationDuration={1000}
                renderItem={({ item: ktvPair }) => (
                  // Mỗi item ở đây là một cặp [KTV1, KTV2]
                  <View className="flex-1 flex-row justify-between px-4 gap-4 pb-2 pl-1 pt-1">
                    {/* KTV thứ 1 bên trái */}
                    <View className="flex-1">
                      <KTVHomePageCard item={ktvPair[0]} />
                    </View>
                    {/* KTV thứ 2 bên phải (Nếu có) */}
                    <View className="flex-1">
                      {ktvPair[1] ? (
                        <KTVHomePageCard item={ktvPair[1]} />
                      ) : (
                        // View rỗng để giữ chỗ nếu tổng số lẻ
                        <View className="flex-1" />
                      )}
                    </View>
                  </View>
                )}
              />
            ) : (
              <Empty />
            )}
          </>
        )}
      </View>
    </View>
  );
};

export const HomePageCategorySection = ({ queryCategory }: { queryCategory: ReturnType<typeof useGetCategoryList> }) => {
  const { t } = useTranslation();

 return (
   <View className="mb-10 mt-6 px-4">
     <View className="mb-3 flex-row items-center justify-between">
       <Text className="text-base font-inter-bold text-slate-800">{t('homepage.services')}</Text>
       <TouchableOpacity onPress={() => router.push('/(app)/(tab)/services')}>
         <Text className="text-xs font-inter-bold text-primary-color-2">
           {t('common.see_all')}
         </Text>
       </TouchableOpacity>
     </View>

     <View className="gap-3">
       {queryCategory.isLoading && queryCategory.isRefetching ? (
        <>
          <View className={"px-4"}>
            <View className="flex flex-row items-center gap-4 mr-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="gap-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-4 w-[100px]" /></View>
            </View>
            <View className="flex flex-row items-center gap-4 mr-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <View className="gap-2"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-4 w-[100px]" /></View>
            </View>
          </View>
        </>
       ) : (
         <>
           {queryCategory.data && queryCategory.data.length > 0 ? (
             queryCategory.data.map((item, index) => <CategoryCard key={index} item={item} />)
           ) : (
             <Empty />
           )}
         </>
       )}
     </View>
   </View>
 )
}

