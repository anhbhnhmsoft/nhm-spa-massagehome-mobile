import React, { useEffect, useMemo, useState } from 'react';
import { View,  Pressable, Linking, Alert } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { DollarSign, MapPin, Navigation2, Timer, User, MessageCircle, Map, Phone } from 'lucide-react-native';
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

const formatCountdown = (deadline?: string | null) => {
  if (!deadline) return null;

  const diff = dayjs(deadline).diff(dayjs(), 'second');
  if (diff <= 0) return '00:00';

  const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
  const seconds = (diff % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export interface BookingItemProps {
  item: BookingItem;
  onPress?: (e: BookingItem) => void;
  calculateDistance: ReturnType<typeof useCalculateDistance>;
  joinRoomChat: ReturnType<typeof useGetRoomChat>;
  onApplyNow?: (e: BookingItem) => void;
  onConfirmNow?: (e: BookingItem) => void;
  applying?: boolean;
  confirming?: boolean;
}

export default function BookingItemKtv({
  item,
  onPress,
  calculateDistance,
  joinRoomChat,
  onApplyNow,
  onConfirmNow,
  applying = false,
  confirming = false,
}: BookingItemProps) {
  const { t } = useTranslation();

  const styles = getBookingStatusStyle(item.status);
  const isApplicationBooking = item.status === _BookingStatus.OPEN_FOR_APPLICATION;
  const isOriginalKtv = !!item.is_original_ktv;
  const hasApplied = !!item.has_applied || item.application_status === 1;
  const applicationDisabled = applying || hasApplied;
  const confirmDisabled = confirming;
  const actionDeadline = isApplicationBooking || item.status === _BookingStatus.WAITING_KTV_CONFIRM
    ? item.ktv_confirm_deadline_at
    : null;
  const [countdown, setCountdown] = useState<string | null>(formatCountdown(actionDeadline));

  const distance = useMemo(() => {
    if (item?.lat && item?.lng) {
      return calculateDistance(
        item.lat,
        item.lng
      );
    }
    return null;
  }, [calculateDistance, item.lat, item.lng]);

  useEffect(() => {
    if (!actionDeadline) {
      setCountdown(null);
      return;
    }

    setCountdown(formatCountdown(actionDeadline));
    const timer = setInterval(() => {
      setCountdown(formatCountdown(actionDeadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [actionDeadline]);

  // {distance ? formatDistance(distance) : '-'}

  return (
    <Pressable
      onPress={useSingleTouch(() => onPress?.(item))}
      className="overflow-hidden rounded-xl border border-blue-100 bg-white px-3 py-2">
      {/* Badge status */}
      <View
        className="absolute right-0 top-0 rounded-bl-lg px-2 py-0.5"
        style={{
          backgroundColor: styles.background,
        }}>
        <Text
          className="font-inter-semibold text-[11px]"
          style={{
            color: styles.text_color,
          }}>
          {t(styles.label)}
        </Text>
      </View>

      {/* Main content */}
      <View className="flex-1">
        {/* title on blue block */}
        <Text className="pr-28 font-inter-semibold text-[15px] text-primary-color-2" numberOfLines={1}>
          {item.user.name}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Timer size={14} color={DefaultColor.base['primary-color-1']} />
          <Text className="ml-1.5 flex-1 text-[12px] text-primary-color-3" numberOfLines={1}>
            {dayjs(item.booking_time).format('DD/MM/YYYY HH:mm')} - {item.service_duration_total || item.duration}p
          </Text>
        </View>

        <View className="mt-1.5 flex-row gap-3">
          <View className="min-w-[90px] flex-row items-center">
            <Icon as={User} size={14} className="mr-1.5 text-primary-color-2" />
            <Text className="flex-1 text-[12px] text-primary-color-3" numberOfLines={1}>
              {item.customer_gender || '-'}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center">
            <Icon as={DollarSign} size={14} className="mr-1.5 text-primary-color-2" />
            <Text className="flex-1 text-[12px] text-primary-color-3" numberOfLines={1}>
              {item.ktv_income_total ? `${item.ktv_income_total.toLocaleString()} ${t('common.currency')}` : '-'}
            </Text>
          </View>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <Icon as={Map} size={14} className="mr-1.5 text-primary-color-2" />
          <Text className="flex-1 text-[12px] text-primary-color-3" numberOfLines={1}>{item.service.name}</Text>
        </View>

        <View className="mt-1.5 flex-row items-center">
          <Icon as={MapPin} size={14} className="mr-1.5 text-primary-color-2" />
          <Text className="flex-1 text-[12px] text-primary-color-3" numberOfLines={1}>{item.address}</Text>
        </View>

        {item.can_open_map ? (
          <View className="mt-1.5 flex-row items-center">
            <Icon as={Navigation2} size={14} className="mr-1.5 text-primary-color-2" />
            <Text className="flex-1 text-[12px] text-primary-color-3" numberOfLines={1}>
              {distance ? formatDistance(distance) : '-'}
            </Text>
          </View>
        ) : null}

        {countdown ? (
          <View className="mt-1.5 self-start rounded-full bg-amber-50 px-2.5 py-1">
            <Text className="font-inter-semibold text-[11px] text-amber-700">
              {t('booking.confirm_deadline_label', { time: countdown })}
            </Text>
          </View>
        ) : null}

        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {item.can_open_map ? (
            <Pressable
              className="min-w-[92px] flex-1 flex-row items-center justify-center rounded-md bg-primary-color-2 px-2 py-1.5"
              onPress={() => {
                if (!item?.lat && !item?.lng) {
                  return;
                }
                openMap(item?.lat, item?.lng);
              }}>
              <Icon as={Navigation2} size={13} className="mr-1.5 text-white" />
              <Text className="font-inter-medium text-[12px] text-white" numberOfLines={1}>
                {t('booking.see_directions')}
              </Text>
            </Pressable>
          ) : null}
          {isApplicationBooking && isOriginalKtv ? (
            <Pressable
              disabled={confirmDisabled}
              className={cn(
                'min-w-[92px] flex-1 flex-row items-center justify-center rounded-md px-2 py-1.5',
                confirmDisabled ? 'bg-slate-300' : 'bg-primary-color-2'
              )}
              onPress={() => onConfirmNow?.(item)}
            >
              <Text className="font-inter-medium text-[12px] text-white" numberOfLines={1}>
                {confirming ? t('common.loading') : t('booking.confirm_booking_action')}
              </Text>
            </Pressable>
          ) : null}
          {isApplicationBooking && !isOriginalKtv ? (
            <Pressable
              disabled={applicationDisabled}
              className={cn(
                'min-w-[92px] flex-1 flex-row items-center justify-center rounded-md px-2 py-1.5',
                applicationDisabled ? 'bg-slate-300' : 'bg-primary-color-2'
              )}
              onPress={() => onApplyNow?.(item)}
            >
              <Text className="font-inter-medium text-[12px] text-white" numberOfLines={1}>
                {applying ? t('common.loading') : applicationDisabled ? t('booking.applied_label') : t('booking.apply_now')}
              </Text>
            </Pressable>
          ) : null}
          {item.can_chat ? (
            <Pressable
              className="min-w-[92px] flex-1 flex-row items-center justify-center rounded-md bg-primary-color-2 px-2 py-1.5"
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
              <Icon as={MessageCircle} size={13} className="mr-1.5 text-white" />
              <Text className="font-inter-medium text-[12px] text-white" numberOfLines={1}>{t('booking.inbox')}</Text>
            </Pressable>
          ) : null}
          {item.can_call ? (
            <Pressable
              className="min-w-[92px] flex-1 flex-row items-center justify-center rounded-md bg-primary-color-2 px-2 py-1.5"
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
              <Icon as={Phone} size={13} className="mr-1.5 text-white" />
              <Text className="font-inter-medium text-[12px] text-white" numberOfLines={1}>{t('common.call')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
