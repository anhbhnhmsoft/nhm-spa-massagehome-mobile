import React, { useMemo, useState } from 'react';
import { View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/skeleton';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import {
  ChevronRight,
  BriefcaseBusiness, Handshake,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';
import { useGetListKTVHomepage } from '@/features/user/hooks';
import { Href, router } from 'expo-router';
import { KTVHomePageCard } from '@/components/app/ktv-card';
import Empty from '@/components/empty';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard from '@/components/app/category-card';
import { useCheckAuth } from '@/features/auth/hooks';


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
              style={{ width: '100%', height: '100%', borderRadius: 16, backgroundColor: DefaultColor.slate['300'] }}
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


export const InviteKtv = () => {
  const { t } = useTranslation();

  const checkAuth = useCheckAuth();

  const handlePress = (path: Href) => {
    if (checkAuth) {
      router.push(path);
    } else {
      router.push('/(auth)');
    }
  };

  return (
    <View className="w-full flex-row gap-3 px-1">
      {/* === BUTTON 1: KỸ THUẬT VIÊN (KTV) === */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress('/(app)/(profile)/partner-register-individual')}
        className="relative flex-1 overflow-hidden rounded-[24px] bg-primary-color-2 p-4 shadow-sm shadow-blue-900/20"
      >
        {/* Background Decorations */}
        <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
        <View className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

        {/* Content Container */}
        <View className="flex-1 flex-col justify-between">
          {/* Header: Icon & Arrow */}
          <View className="flex-row items-start justify-between">
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/20">
              <Handshake size={24} color="white" strokeWidth={1.5} />
            </View>
            <View className="rounded-full bg-white/10 p-1.5">
              <ChevronRight size={16} color="white" />
            </View>
          </View>

          {/* Text Content */}
          <View className="mt-3">
            <Text className="font-inter-bold text-base leading-tight text-white" numberOfLines={2}>
              {t('homepage.invite_ktv.title')}
            </Text>
            {/*<Text*/}
            {/*  className="mt-1 font-inter-medium text-xs text-blue-100 opacity-90"*/}
            {/*  numberOfLines={2}>*/}
            {/*  {t('homepage.invite_ktv.description')}*/}
            {/*</Text>*/}
          </View>
        </View>
      </TouchableOpacity>

      {/* === BUTTON 2: ĐỐI TÁC (PARTNER) === */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress('/(app)/(profile)/partner-register-agency')}
        className="relative flex-1 overflow-hidden rounded-[24px] bg-primary-color-1 p-4 shadow-sm shadow-blue-900/20"
      >
        {/* Background Decorations */}
        <View className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <View className="absolute bottom-0 right-0 h-28 w-16 -rotate-12 bg-white/5" />

        {/* Content Container */}
        <View className="flex-1 flex-col justify-between">
          {/* Header: Icon & Arrow */}
          <View className="flex-row items-start justify-between">
            <View className="h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/20">
              <BriefcaseBusiness size={24} color="white" strokeWidth={1.5} />
            </View>
            <View className="rounded-full bg-white/10 p-1.5">
              <ChevronRight size={16} color="white" />
            </View>
          </View>

          {/* Text Content */}
          <View className="mt-3">
            <Text className="font-inter-bold text-base leading-tight text-white" numberOfLines={2}>
              {t('homepage.invite_partner.title')}
            </Text>
            {/*<Text*/}
            {/*  className="mt-1 font-inter-medium text-xs text-blue-100 opacity-90"*/}
            {/*  numberOfLines={2}>*/}
            {/*  {t('homepage.invite_partner.description')}*/}
            {/*</Text>*/}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Carousel hiển thị KTV trong trang chủ
export const HomePageKTVSection = ({
  queryKTV,
}: {
  queryKTV: ReturnType<typeof useGetListKTVHomepage>;
}) => {
  const { t } = useTranslation();

  const chunkedKTVData = useMemo(() => {
    if (!queryKTV.data || queryKTV.data.length === 0) return [];

    const chunkSize = 3;
    const chunks = [];
    for (let i = 0; i < queryKTV.data.length; i += chunkSize) {
      chunks.push(queryKTV.data.slice(i, i + chunkSize));
    }
    return chunks;
  }, [queryKTV.data]);

  return (
    <View className="mt-6">
      {/* Header Section */}
      <View className="mb-3 flex-row items-center justify-between px-4">
        <Text className="font-inter-bold text-base text-slate-800">
          {t('homepage.technician_suggest')}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tab)/masseurs')}>
          <Text className="font-inter-bold text-xs text-primary-color-2">
            {t('common.see_all')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View>
        {queryKTV.isLoading && queryKTV.isRefetching ? (
          // Skeleton Loading (Giữ nguyên hoặc sửa nhẹ nếu cần)
          <View className="flex-row gap-2 px-4">
            <Skeleton style={{
              width: (width - 48) / 3,
              height: 200,
              borderRadius: 12,
            }} />
            <Skeleton style={{
              width: (width - 48) / 3,
              height: 200,
              borderRadius: 12,
            }} />
            <Skeleton style={{
              width: (width - 48) / 3,
              height: 200,
              borderRadius: 12,
            }} />
          </View>
        ) : (
          <>
            {chunkedKTVData.length > 0 ? (
              <Carousel
                loop={true}
                width={width} // Lấy full width màn hình
                height={210}
                data={chunkedKTVData}
                scrollAnimationDuration={1000}
                // --- 2. SỬA RENDER ITEM CHO 3 CỘT ---
                renderItem={({ item: ktvGroup }) => (
                  <View className="flex-1 flex-row gap-2 px-4 pb-2 pt-1">
                    {/* Render các KTV có thật trong nhóm */}
                    {ktvGroup.map((ktv, index) => (
                      <View key={ktv.id || index} className="flex-1">
                        <KTVHomePageCard item={ktv} />
                      </View>
                    ))}

                    {/* Render các View rỗng để lấp đầy nếu nhóm thiếu người (ví dụ nhóm cuối chỉ có 1 người) */}
                    {Array.from({ length: 3 - ktvGroup.length }).map((_, index) => (
                      <View key={`empty-${index}`} className="flex-1" />
                    ))}
                  </View>
                )}
              />
            ) : (
              // <Empty /> component của bạn
              <View className="items-center justify-center py-10">
                <Text>No Data</Text>
              </View>
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

