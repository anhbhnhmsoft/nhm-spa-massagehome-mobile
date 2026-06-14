import React, { useMemo } from 'react';
import { View,  Pressable, Linking, Alert } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { MapPin, Navigation2, Timer, User, MessageCircle, Map, Phone } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { BookingItem } from '@/features/booking/types';
import { _BookingStatus, getBookingStatusStyle } from '@/features/service/const';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import DefaultColor from '@/components/styles/color';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { cn, formatDistance, openMap } from '@/lib/utils';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { useGetRoomChat } from '@/features/chat/hooks';

export interface BookingItemProps {
  item: BookingItem;
  onPress?: (e: BookingItem) => void;
  calculateDistance: ReturnType<typeof useCalculateDistance>;
  joinRoomChat: ReturnType<typeof useGetRoomChat>;
  onApplyNow?: (e: BookingItem) => void;
  applying?: boolean;
}

export default function BookingItemKtv({ item, onPress, calculateDistance, joinRoomChat, onApplyNow, applying = false }: BookingItemProps) {
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
      className="overflow-hidden rounded-xl border border-blue-100 bg-white px-3 py-2.5">
      {/* Badge status */}
      <View
        className={`absolute right-0 top-0 rounded-bl-lg px-3 py-1`}
        style={{
          backgroundColor: styles.background,
        }}>
        <Text
          className={`font-inter-semibold text-sm`}
          style={{
            color: styles.text_color,
          }}>
          {t(styles.label)}
        </Text>
      </View>

      {/* Main content */}
      <View className="flex-1">
        {/* title on blue block */}
        <Text className="font-inter-semibold text-[16px] text-primary-color-2" numberOfLines={2}>
          {item.user.name}
        </Text>
        <View className="mt-2 flex-row items-start">
          <Timer size={16} color={DefaultColor.base['primary-color-1']} />
          <Text className="ml-2 flex-1 text-sm text-primary-color-3">
            {dayjs(item.booking_time).format('DD/MM/YYYY HH:mm')} - {item.service_duration_total || item.duration}p
          </Text>
        </View>
        <View className="mt-2 flex-row items-start">
          <Icon as={User} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">{item.customer_gender || '-'}</Text>
        </View>
        <View className="mt-2 flex-row items-start">
          <Icon as={Map} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">{item.service.name}</Text>
        </View>
        <View className="mt-2 flex-row items-start">
          <Icon as={Phone} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">
            {item.ktv_income_total ? `${item.ktv_income_total.toLocaleString()} ${t('common.currency')}` : '-'}
          </Text>
        </View>

        <View className="mt-2 flex-row items-start">
          <Icon as={Map} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
          <Text className="flex-1 text-sm text-primary-color-3">{item.address}</Text>
        </View>

        {item.can_open_map ? (
          <View className="mt-2 flex-row items-start">
            <Icon as={MapPin} size={16} className="mr-2 mt-0.5 text-primary-color-2" />
            <Text className="flex-1 text-sm text-primary-color-3">
              {distance ? formatDistance(distance) : '-'}
            </Text>
          </View>
        ) : null}

        <View className="mt-2.5 gap-1.5">
          {item.can_open_map ? (
            <Pressable
              className="flex-row items-center justify-center rounded-md bg-primary-color-2 px-3 py-2"
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
          ) : null}
          {item.status ===  _BookingStatus.OPEN_FOR_APPLICATION ? (
            <Pressable
              disabled={applying || item.has_applied || item.application_status === 1}
              className={cn(
                'flex-row items-center justify-center rounded-md px-3 py-2',
                applying || item.has_applied || item.application_status === 1 ? 'bg-slate-300' : 'bg-primary-color-2'
              )}
              onPress={() => onApplyNow?.(item)}
            >
              <Text className="font-inter-medium text-sm text-white">
                {applying ? t('common.loading') : item.has_applied || item.application_status === 1 ? t('booking.applied_label') : t('booking.apply_now')}
              </Text>
            </Pressable>
          ) : null}
          {(item.can_chat || item.can_call) ? (
            <View className="flex-row gap-2">
              {item.can_chat ? (
                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-md bg-primary-color-2 px-3 py-2"
                  onPress={() => {
                    if (item?.user?.id) {
                      joinRoomChat(
                        {
                          user_id: item?.user?.id,
                        },
                        'ktv'
                      );
                    }
                  }}>
                  <Icon as={MessageCircle} size={14} className="mr-2 text-white" />
                  <Text className="font-inter-medium text-sm text-white">{t('booking.inbox')}</Text>
                </Pressable>
              ) : null}
              {item.can_call ? (
                <Pressable
                  className="flex-1 flex-row items-center justify-center rounded-md bg-primary-color-2 px-3 py-2"
                  onPress={async () => {
                    const phoneNumber = item?.user?.phone;
                    if (phoneNumber) {
                      await Linking.openURL(`tel:${phoneNumber}`);
                    } else {
                      Alert.alert(
                        t('common.no_phone'),
                        t('common.no_phone_message'),
                        [{ text: t('common.ok') }]
                      );
                    }
                  }}>
                  <Icon as={Phone} size={14} className="mr-2 text-white" />
                  <Text className="font-inter-medium text-sm text-white">{t('common.call')}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
