import { useGetListKTVHomepage, useGoDetailKtv } from '@/features/user/hooks';
import React, { FC, useMemo, useState } from 'react';
import { TFunction } from 'i18next';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import {Text} from "@/components/ui/text"
import { Link } from 'expo-router';
import { Skeleton } from '@/components/ui/skeleton';
import Carousel from 'react-native-reanimated-carousel';
import { useTranslation } from 'react-i18next';
import { Briefcase, CheckCircle, Star, User } from 'lucide-react-native';
import { ListKTVItem } from '@/features/user/types';
import {Image} from 'expo-image';
import DefaultColor from '@/components/styles/color';

const width = Dimensions.get('window').width;


export const CarouselTechnicalHomePage: FC<{
  queryKTV: ReturnType<typeof useGetListKTVHomepage>;
  t: TFunction;

}> = ({queryKTV, t}) => {

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
    <View className="mt-4">
      {/* Header Section */}
      <View className="mb-3 flex-row items-center justify-between px-4">
        <Text className="font-inter-bold text-base text-slate-800">
          {t('homepage.technician_suggest')}
        </Text>
        <Link href={'/(app)/(customer)/(tab)/masseurs'}>
          <Text className="font-inter-bold text-xs text-primary-color-2">
            {t('common.see_all')}
          </Text>
        </Link>
      </View>

      {/* Content Section */}
      <View>
        {queryKTV.isLoading && queryKTV.isRefetching ? (
          // Skeleton Loading (Giữ nguyên hoặc sửa nhẹ nếu cần)
          <View className="flex-row gap-2 px-4">
            <Skeleton
              style={{
                width: (width - 48) / 3,
                height: 200,
                borderRadius: 12,
              }}
            />
            <Skeleton
              style={{
                width: (width - 48) / 3,
                height: 200,
                borderRadius: 12,
              }}
            />
            <Skeleton
              style={{
                width: (width - 48) / 3,
                height: 200,
                borderRadius: 12,
              }}
            />
          </View>
        ) : (
          <>
            {chunkedKTVData.length > 0 ? (
              <Carousel
                loop={true}
                width={width}
                height={210}
                data={chunkedKTVData}
                scrollAnimationDuration={1000}
                renderItem={({ item: ktvGroup }) => (
                  <View className="flex-1 flex-row gap-2 px-4 pb-2 pt-1">
                    {/* Render các KTV có thật trong nhóm */}
                    {ktvGroup.map((ktv, index) => (
                      <View key={ktv.id || index} className="flex-1">
                        <TechnicalItem item={ktv} />
                      </View>
                    ))}

                    {/* Render các View rỗng để lấp đầy nếu nhóm thiếu người */}
                    {Array.from({ length: 3 - ktvGroup.length }).map((_, index) => (
                      <View key={`empty-${index}`} className="flex-1" />
                    ))}
                  </View>
                )}
              />
            ) : (
              <View className="items-center justify-center py-10">
                <Text className="font-inter-bold text-sm text-slate-400">
                  {t('homepage.no_ktv_available')}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const TechnicalItem = ({item}: {item: ListKTVItem}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const setKtv = useGoDetailKtv(); // Hook của bạn

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="w-full flex-1 rounded-lg border border-slate-100 bg-white p-2 shadow-sm" // Giảm padding p-3 -> p-2
      onPress={() => setKtv(item.id)}>
      {/* --- AVATAR: GIẢM CHIỀU CAO --- */}
      <View className="relative mb-2">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            style={{
              height: 96,
              width: "100%",
              borderRadius: 12,
            }}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="h-24 w-full items-center justify-center rounded-lg bg-slate-200">
            <User size={24} color="#94a3b8" />
          </View>
        )}

        {/* Icon Verified: Thu nhỏ lại chút */}
        <View className="absolute right-1 top-1 rounded-full bg-primary-color-2 p-0.5">
          <CheckCircle size={8} color="white" />
        </View>
      </View>

      {/* --- INFO --- */}
      <Text className="text-center font-inter-bold text-sm text-slate-800" numberOfLines={1}>
        {item.name}
      </Text>

      {/* Rating: Căn giữa */}
      <View className="mb-2 mt-1 flex-row items-center justify-center">
        <Star size={10} color={DefaultColor.yellow['500']} fill={DefaultColor.yellow['500']} />
        <Text className="ml-1 font-inter-bold text-[10px] text-slate-700">{item.rating || 0}</Text>
        <Text className="ml-0.5 text-[10px] text-slate-400">({item.review_count || 0})</Text>
      </View>

      {/* Services Count: Thu nhỏ font và padding */}
      <View className="flex-row items-center justify-center gap-1 rounded bg-blue-50 px-1 py-1">
        <Briefcase size={10} color={DefaultColor.base['primary-color-2']} />
        <Text className="font-inter-medium text-[10px] text-primary-color-2" numberOfLines={1}>
          {item.service_count} {t('common.service')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
