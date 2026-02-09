import { KTVWorkSchedule, ListKTVItem } from '@/features/user/types';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import {
  Award,
  Briefcase,
  CheckCircle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Clock,
} from 'lucide-react-native';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { cn, formatDistance, getCurrentDayKey } from '@/lib/utils';
import { useSetKtv } from '@/features/user/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import StarRating from '@/components/star-rating';
import { Text } from '@/components/ui/text';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { _KTVConfigSchedulesLabel } from '@/features/ktv/consts';
import { Icon } from '@/components/ui/icon';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);


export const KTVHomePageCard = ({ item }: { item: ListKTVItem }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const setKtv = useSetKtv(); // Hook của bạn

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="w-full flex-1 rounded-xl border border-slate-100 bg-white p-2 shadow-sm" // Giảm padding p-3 -> p-2
      onPress={() => setKtv(item.id)}>
      {/* --- AVATAR: GIẢM CHIỀU CAO --- */}
      <View className="relative mb-2">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            className="h-24 w-full rounded-lg bg-slate-100" // Giảm h-32 -> h-24
            resizeMode="cover"
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
        <Star size={10} color="#EAB308" fill="#EAB308" />
        <Text className="ml-1 font-inter-bold text-[10px] text-slate-700">{item.rating || 0}</Text>
        <Text className="ml-0.5 text-[10px] text-slate-400">({item.review_count || 0})</Text>
      </View>

      {/* Services Count: Thu nhỏ font và padding */}
      <View className="flex-row items-center justify-center gap-1 rounded bg-blue-50 px-1 py-1">
        <Briefcase size={10} color="#2563eb" />
        <Text className="font-inter-medium text-[10px] text-blue-600" numberOfLines={1}>
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

  const distance = useMemo(() => {
    if (item.location.latitude && item.location.longitude) {
      return calculateDistance(
        item.location.latitude,
        item.location.longitude,
      );
    }
    return null;
  }, [item.location, calculateDistance]);

  const setKtv = useSetKtv();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mb-3 flex-row rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
      onPress={() => setKtv(item.id)}>
      <View className="relative mr-3 h-20 w-20">
        {item.profile?.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            className="h-20 w-20 rounded-full bg-slate-200"
            resizeMode="cover"
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
 * Card Skeleton hiển thị thông tin của massager trong trang dịch vụ
 */
export const KTVServiceCardSkeleton = () => {
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


/**
 * Hiển thị thông tin lịch làm việc của massager
 */
export const ScheduleSection = ({ schedule, isOnlineRealtime }: {
  schedule: KTVWorkSchedule,
  isOnlineRealtime: boolean
}) => {
  const { t } = useTranslation();
  const currentDayKey = getCurrentDayKey();


  // Sắp xếp lịch để hiển thị từ Thứ 2 -> CN (nếu data trả về lộn xộn)
  const sortedSchedule = useMemo(() => {
    return [...(schedule?.schedule_time || [])].sort((a, b) => a.day_key - b.day_key);
  }, [schedule]);

  if (!schedule) return null;

  return (
    <View className="mt-2 bg-white px-4 py-4">
      {/* Header Section */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {/* Icon Đồng hồ */}
          <Icon as={Clock} size={20} className="text-primary-color-2" />
          <Text className="font-inter-bold text-base text-gray-800">
            {t('masseurs_detail.working_hours')}
          </Text>
        </View>

        {/* Badge Trạng thái hiện tại */}
        <View
          className={cn(
            'rounded-md px-2 py-1',
            isOnlineRealtime ? 'bg-green-100' : 'bg-gray-100',
          )}>
          <Text
            className={cn(
              'text-xs',
              isOnlineRealtime ? 'font-inter-bold text-green-700' : 'text-gray-500',
            )}>
            {isOnlineRealtime ? t('common.online') : t('common.offline')}
          </Text>
        </View>
      </View>

      {/* List Lịch */}
      <View className="rounded-xl bg-gray-50 p-3">
        {sortedSchedule.map((item, index) => {
          const isToday = item.day_key === currentDayKey;

          return (
            <View
              key={item.day_key}
              className={`flex-row items-center justify-between py-2 ${
                index !== sortedSchedule.length - 1 ? 'border-b border-dashed border-gray-200' : ''
              }`}>
              {/* Cột Thứ */}
              <View className="flex-row items-center gap-2">
                {isToday && <View className="h-1.5 w-1.5 rounded-full bg-primary-color-2" />}
                <Text
                  className={cn(
                    'text-sm',
                    isToday ? 'font-inter-bold text-primary-color-2' : 'text-gray-700',
                  )}>
                  {t(_KTVConfigSchedulesLabel[item.day_key])}
                </Text>
              </View>

              {/* Cột Giờ */}
              <View>
                {item.active ? (
                  <Text
                    className={cn(
                      'text-sm',
                      isToday ? 'font-inter-bold text-primary-color-2' : 'text-gray-700',
                    )}>
                    {item.start_time} - {item.end_time}
                  </Text>
                ) : (
                  <Text className="font-inter-italic text-sm text-gray-400">
                    {t('common.day_off')}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};