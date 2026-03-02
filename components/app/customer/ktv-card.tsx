import { ListKTVItem } from '@/features/user/types';
import React, { useMemo, useState } from 'react';
import { useGoDetailKtv } from '@/features/user/hooks';
import { TouchableOpacity, View } from 'react-native';
import { Award, MapPin, ShieldCheck, TrendingUp, User } from 'lucide-react-native';
import StarRating from '@/components/star-rating';
import { formatDistance } from '@/lib/utils';
import { Image } from 'expo-image';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { TFunction } from 'i18next';
import {Text} from "@/components/ui/text"
import { Skeleton } from '@/components/ui/skeleton';
/**
 * Card hiển thị thông tin của massager trong trang dịch vụ
 */
export const KTVCard = ({ item, calculateDistance, t }: {
  item: ListKTVItem,
  calculateDistance: ReturnType<typeof useCalculateDistance>,
  t: TFunction,

}) => {
  const [imageError, setImageError] = useState(false);

  const distance = useMemo(() => {
    if (item.location.latitude && item.location.longitude) {
      return calculateDistance(
        item.location.latitude,
        item.location.longitude,
      );
    }
    return null;
  }, [item.location, calculateDistance]);

  const setKtv = useGoDetailKtv();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mb-3 flex-row rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
      onPress={() => setKtv(item.id)}>
      <View className="relative mr-3 h-20 w-20">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            style={{
              height: 80,
              width: 80,
              borderRadius: 9999,
            }}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="h-20 w-20 items-center justify-center rounded-full bg-slate-200">
            <User size={32} color="#94a3b8" />
          </View>
        )}
        <View className="absolute bottom-0 right-0 rounded-full bg-white p-0.5">
          <View className="rounded-full bg-primary-color-2 p-1">
            <ShieldCheck size={10} color="white" />
          </View>
        </View>
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="font-inter-bold text-base text-slate-800">{item.name}</Text>
            <View className="mt-0.5 flex-row items-center">
              <StarRating rating={item.rating} size={10} />
              <Text className="ml-1 font-inter-bold text-xs text-slate-700">{item.rating}</Text>
              <Text className="text-xs text-slate-400"> ({item.review_count || 0})</Text>
            </View>
          </View>
        </View>

        <View className="mt-2 flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Award size={10} color="#64748b" />
            <Text className="text-[10px] text-slate-500">
              {item.review_application.experience} {t('common.year')}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={10} color="#64748b" />
            <Text className="text-[10px] text-slate-500">{distance ? formatDistance(distance) : '-'} </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <TrendingUp size={10} color="#64748b" />
            <Text className="text-[10px] text-slate-500">
              {item.jobs_received_count} {t('common.jobs_received_count')}
            </Text>
          </View>
        </View>

        <View className="mt-3 w-full flex-row items-center justify-between pt-2">
          <View className="rounded-md bg-primary-color-2 px-4 py-2 shadow-sm">
            <Text className="font-inter-bold text-xs text-white">{t('services.btn_booking')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};


/**
 * Card hiển thị skeleton khi loading thông tin của massager trong trang dịch vụ
 */
export const KTVCardSkeleton = () => {
  return (
    <View className="mb-3 flex-row rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <View className="mr-3 h-20 w-20">
        <Skeleton className="h-20 w-20 rounded-full bg-slate-200" />
      </View>

      <View className="flex-1 justify-between">
        <View className="flex-row items-start justify-between">
          <View>
            <Skeleton className="mb-2 h-5 w-32 rounded-lg bg-slate-200" />
            <Skeleton className="h-4 w-20 rounded-lg bg-slate-200" />
          </View>
        </View>

        <View className="mt-2 flex-row items-center gap-3">
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
        </View>

        <View className="mt-3 w-full flex-row items-center justify-between pt-2">
          <View />
          <Skeleton className="h-8 w-20 rounded-md bg-slate-200" />
        </View>
      </View>
    </View>
  );
};
