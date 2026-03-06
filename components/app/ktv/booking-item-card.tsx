import React, { useMemo } from 'react';
import { View,  Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { MapPin, Navigation2, Timer, User, MessageCircle, Map } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { BookingItem } from '@/features/booking/types';
import {  getBookingStatusStyle } from '@/features/service/const';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DefaultColor from '@/components/styles/color';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { formatDistance, openMap } from '@/lib/utils';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { useGetRoomChat } from '@/features/chat/hooks';

export interface BookingItemProps {
  item: BookingItem;
  onPress?: (e: BookingItem) => void;
  calculateDistance: ReturnType<typeof useCalculateDistance>;
  joinRoomChat: ReturnType<typeof useGetRoomChat>;
}

export default function BookingItemKtv({ item, onPress, calculateDistance, joinRoomChat }: BookingItemProps) {
  const { t } = useTranslation();

  const styles = getBookingStatusStyle(item.status);

  const distance = useMemo(() => {
    if (item?.lat && item?.lng) {
      return calculateDistance(
        item.lat,
        item.lng
      );
    }
    return null;
  }, [item]);

  // {distance ? formatDistance(distance) : '-'}

  return (
    <Pressable
      onPress={useSingleTouch(() => onPress?.(item))}
      className="overflow-hidden rounded-xl border border-blue-100 bg-white p-3">
      {/* Badge status */}
      <View className={`absolute right-0 top-0 rounded-bl-lg px-3 py-1`} style={{
          backgroundColor: styles.background,
        }}>
        <Text
          className={`font-inter-semibold text-sm`}
          style={{
            color: styles.text_color,
          }}
        >
          {t(styles.label)}
        </Text>
      </View>

      {/* Main content */}
      <View className="flex-1">
        {/* title on blue block */}
        <Text className="font-inter-semibold text-lg text-primary-color-2" numberOfLines={2}>
          {item.service.name}
        </Text>
        <View className="mt-2 flex-row items-start">
          <Timer size={16} color={DefaultColor.base['primary-color-1']} />
          <Text className="ml-2 flex-1 text-sm text-primary-color-3">
            {dayjs(item.booking_time).format('DD/MM/YYYY HH:mm')}
          </Text>
        </View>
        <View className="mt-2 flex-row items-start">
          <Icon as={User} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">{item.user.name}</Text>
        </View>
        <View className="mt-2 flex-row items-start">
          <Icon as={Map} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">{item.address}</Text>
        </View>

        <View className="mt-2 flex-row items-start">
          <Icon as={MapPin} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">{distance ? formatDistance(distance) : '-'}</Text>
        </View>

        <View className="mt-2 flex-row items-center gap-2">
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
          <Pressable
            className="mt-3 flex-row items-center self-start rounded-md bg-primary-color-2 px-3 py-2"
            onPress={() => {
              if (item?.user?.id) {
                joinRoomChat({
                  user_id: item?.user?.id,
                },'ktv')
              }
            }}>
            <Icon as={MessageCircle} size={14} className="mr-2 text-white" />
            <Text className="font-inter-medium text-sm text-white">
              {t('booking.inbox')}
            </Text>
          </Pressable>
        </View>

      </View>
    </Pressable>
  );
}
