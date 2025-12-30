import React, { useCallback } from 'react';
import { View, Image, Pressable, GestureResponderEvent } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { MapPin, Navigation2, ChevronRight, Timer, User } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { BookingItem } from '@/features/booking/types';
import { _BookingStatusMap, getStatusColor } from '@/features/service/const';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DefaultColor from '@/components/styles/color';
import { router } from 'expo-router';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { openMap } from '@/lib/utils';

export interface BookingItemProps {
  item: BookingItem;

  onPress?: (e: BookingItem) => void;
}

export default function BookingItemKtv({ item, onPress }: BookingItemProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={useSingleTouch(() => onPress?.(item))}
      className="shadow-sd overflow-hidden rounded-xl border border-blue-100 bg-white p-4">
      {/* Badge top-right */}
      <View className={`absolute right-0 top-0 rounded-bl-lg bg-blue-100 px-3 py-1`}>
        <Text className={`font-inter-bold text-sm text-primary-color-2`}>
          {t(_BookingStatusMap[item.status])}
        </Text>
      </View>

      <View className="flex-row">
        {/* LEFT: date + time column */}
        <View className="w-16 items-center">
          <Text className="mt-3 font-inter-extrabold text-xl text-primary-color-2">
            {item.start_time ? dayjs(item.start_time).format('HH:mm') : '--:--'}
          </Text>
          <Text className="text-xs text-gray-400">
            {item.end_time ? dayjs(item.end_time).format('HH:mm') : '--:--'}
          </Text>
          <View className="mt-4 rounded-sm bg-slate-100 px-2 py-1">
            <Text className="font-inter-semibold text-xs text-primary-color-2">
              {dayjs(item.booking_time).format(' DD/MM')}
            </Text>
          </View>

          {/* vertical line */}
          <View className="mt-3 h-24 w-0.5 bg-gray-200" />
        </View>

        {/* CENTER: content */}
        <View className="mt-4 flex-1 pl-4">
          {/* title on blue block */}
          <Text className="font-inter-semibold text-lg text-primary-color-1" numberOfLines={2}>
            {item.service.name}
          </Text>
          <View className="mt-3 flex-row items-start">
            <Timer size={16} color={DefaultColor.base['primary-color-1']} />
            <Text className="ml-2 flex-1 text-sm text-primary-color-3">
              {dayjs(item.booking_time).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>

          <View className="mt-3 flex-row items-start">
            <Icon as={MapPin} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
            <Text className="flex-1 text-sm text-primary-color-3">{item.address}</Text>
          </View>

          <Pressable
            className="mt-3 flex-row items-center self-start rounded-md bg-primary-color-2 px-3 py-2"
            onPress={() => {
              if (!item?.lat && !item?.lng) {
                return;
              }
              openMap(item?.lat, item?.lng);
            }}>
            <Icon as={Navigation2} size={14} className="mr-2 text-white" />
            <Text className="font-inter-medium text-sm text-white">
              {t('booking.see_directions')}
            </Text>
          </Pressable>

          {/* bottom row: avatar + name + chevron */}
          <View className="mt-4 flex-row items-center justify-between pr-8">
            <View className="flex-row items-center">
              {item.user.avatar_url ? (
                <Image source={{ uri: item.user.avatar_url }} className="h-10 w-10 rounded-full" />
              ) : (
                <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <User size={24} color={DefaultColor.slate[400]} />
                </View>
              )}

              <Text
                className="ml-3 flex-1 font-inter-semibold text-sm text-primary-color-3"
                numberOfLines={1}>
                {item.user.name}
              </Text>
            </View>

            <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Icon as={ChevronRight} size={18} className="text-blue-600" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
