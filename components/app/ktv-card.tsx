import { ListKTVItem } from '@/features/user/types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Award, Briefcase, CheckCircle, TrendingUp, MapPin, ShieldCheck, Star, User } from 'lucide-react-native';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { formatDistance } from '@/lib/utils';
import { useSetKtv } from '@/features/user/hooks';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Card hiển thị thông tin của massager trong trang chủ
 * @param item
 * @constructor
 */
export const KTVHomePageCard = ({ item }: { item: ListKTVItem }) => {
  const { t } = useTranslation();

  // State quản lý lỗi ảnh
  const [imageError, setImageError] = useState(false);

  const setKtv = useSetKtv();

  return (
    <TouchableOpacity className="mr-4 w-44 rounded-xl border border-slate-100 bg-white p-3 shadow-sm" onPress={() => setKtv(item.id)}>
      {/* --- PHẦN AVATAR --- */}
      <View className="relative mb-2">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            className="h-32 w-full rounded-lg bg-slate-100"
            resizeMode="cover"
            // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI khi không có ảnh hoặc ảnh lỗi
          <View className="h-32 w-full items-center justify-center rounded-lg bg-slate-200">
            <User size={32} color="#94a3b8" />
          </View>
        )}

        {/* Icon Verified */}
        <View className="absolute right-2 top-2 rounded-full border border-white bg-blue-500 p-1">
          <CheckCircle size={10} color="white" />
        </View>
      </View>

      {/* --- INFO --- */}
      <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
        {item.name}
      </Text>

      {/* Rating */}
      <View className="mb-3 mt-1 flex-row items-center">
        <Star size={14} color="#eab308" fill="#eab308" />
        <Text className="ml-1 text-xs font-bold text-slate-700">{item.rating || 0}</Text>
        <Text className="ml-1 text-xs text-slate-400">({item.review_count || 0})</Text>
      </View>

      {/* Services Count */}
      <View className="flex-row items-center justify-center gap-1 rounded-lg bg-blue-50 py-2">
        <Briefcase size={14} color="#2563eb" />
        <Text className="text-xs font-medium text-blue-600">
          {item.service_count} {t('common.service')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Card hiển thị thông tin của massager trong trang dịch vụ
 * @param item
 * @constructor
 */
export const KTVServiceCard = ({ item }: { item: ListKTVItem }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const calculateDistance = useCalculateDistance();

  const distance = calculateDistance(item.review_application.latitude, item.review_application.longitude);

  const setKtv = useSetKtv();

  return (
    <TouchableOpacity activeOpacity={0.8} className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm flex-row" onPress={() => setKtv(item.id)}>
      {/* --- CỘT TRÁI: AVATAR --- */}
      <View className="relative mr-3 w-20 h-20">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            className="h-20 w-20 rounded-full bg-slate-200"
            resizeMode="cover"
            // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI khi không có ảnh hoặc ảnh lỗi
          <View className="h-20 w-20 items-center justify-center rounded-full bg-slate-200">
            <User size={32} color="#94a3b8" />
          </View>
        )}
        {/* Icon Verified/Status ở góc dưới */}
        <View className="absolute bottom-0 right-0 rounded-full bg-white p-0.5">
          <View className="bg-emerald-500 p-1 rounded-full">
            <ShieldCheck size={10} color="white" />
          </View>
        </View>
      </View>

      {/* --- CỘT PHẢI: INFO --- */}
      <View className="flex-1 justify-between">
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="text-base font-bold text-slate-800">{item.name}</Text>
            {/* Rating */}
            <View className="flex-row items-center mt-0.5">
              {/* 5 ngôi sao (Demo vẽ 1 cái + số) */}
              <View className="flex-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill={i < Math.floor(item.rating) ? "#facc15" : "#e2e8f0"} color={i < Math.floor(item.rating) ? "#facc15" : "#e2e8f0"} />
                ))}
              </View>
              <Text className="ml-1 text-xs font-bold text-slate-700">{item.rating}</Text>
              <Text className="text-xs text-slate-400"> ({item.review_count || 0})</Text>
            </View>
          </View>
        </View>


        {/* Stats: Năm, Km, Jobs */}
        <View className="mt-2 flex-row items-center gap-3">
          {/* Năm kinh nghiệm */}
          <View className="flex-row items-center gap-1">
            <Award size={10} color="#64748b" />
            <Text className="text-[10px] text-slate-500">{item.review_application.experience} {t('common.year')}</Text>
          </View>
          {distance && (
            <View className="flex-row items-center gap-1">
              <MapPin size={10} color="#64748b" />
              <Text className="text-[10px] text-slate-500">{formatDistance(distance)}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <TrendingUp size={10} color="#64748b" />
            <Text className="text-[10px] text-slate-500">{item.jobs_received_count}</Text>
          </View>
        </View>

        {/* Nút Đặt lịch */}
        <View className="mt-3 w-full flex-row items-center justify-between pt-2">
          <View/>
          <View className="rounded-md bg-emerald-500 px-4 py-2 shadow-sm">
            <Text className="text-xs font-bold text-white">Đặt lịch</Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
};


/** * Card Skeleton hiển thị thông tin của massager trong trang dịch vụ
 * @constructor
 */
export const KTVServiceCardSkeleton = () => {
  return (
    <View className="mb-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm flex-row">
      {/* --- CỘT TRÁI: AVATAR --- */}
      <View className="mr-3 w-20 h-20">
        <Skeleton className="h-20 w-20 rounded-full bg-slate-200" />
      </View>

      {/* --- CỘT PHẢI: INFO --- */}
      <View className="flex-1 justify-between">
        {/* Header */}
        <View className="flex-row items-start justify-between">
          <View>
            <Skeleton className="h-5 w-32 rounded-lg bg-slate-200 mb-2" />
            <Skeleton className="h-4 w-20 rounded-lg bg-slate-200" />
          </View>
        </View>

        {/* Stats: Năm, Km, Jobs */}
        <View className="mt-2 flex-row items-center gap-3">
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-16 rounded-lg bg-slate-200" />
        </View>

        {/* Nút Đặt lịch */}
        <View className="mt-3 w-full flex-row items-center justify-between pt-2">
          <View/>
          <Skeleton className="h-8 w-20 rounded-md bg-slate-200" />
        </View>
      </View>
    </View>
  );
}
