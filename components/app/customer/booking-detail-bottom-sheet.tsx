import { _BookingStatus, _BookingStatusMap, getBookingStatusStyle } from '@/features/service/const';
import React, { FC, useMemo, useState } from 'react';
import { View } from 'react-native';
import { BookingItem } from '@/features/booking/types';
import { Icon } from '@/components/ui/icon';
import { Calendar, Clock, ImageOff, X } from 'lucide-react-native';
import { formatBalance } from '@/lib/utils';
import dayjs from 'dayjs';
import { Text } from '@/components/ui/text';
import Avatar from '@/components/ui/avatar';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TFunction } from 'i18next';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import InfoRow from '@/components/ui/info-row';

type Props = {
  item: BookingItem | null;
  ref: React.Ref<BottomSheetModal>,
  onDismiss: () => void,
  t: TFunction,
};

export const BookingDetailBottomSheet: FC<Props> = ({ item, ref, onDismiss, t }) => {

  const styleStatus = useMemo(() => {
    if (item) {
      return getBookingStatusStyle(item.status);
    }
    return null;
  }, [item]);

  return (
    <AppBottomSheet
      ref={ref}
      isScrollable={true}
      snapPoints={['90%']}
      onDismiss={onDismiss}
    >
      {item && styleStatus ?
        <View>
          {/* 2. KTV Info */}
          <View className="mb-6">
            <Text className="mb-3 font-inter-bold text-sm uppercase text-slate-500">
              {t('booking.technician')}
            </Text>
            <View className="flex-row items-center rounded-xl border border-slate-100 bg-slate-50 p-3">
              <View className="mr-3">
                <Avatar
                  source={item.ktv_user.avatar_url}
                  size={48}
                />
              </View>
              <View>
                <Text className="font-inter-bold text-base text-slate-800">
                  {item.ktv_user.name}
                </Text>
                <Text className="font-inter-bold text-xs text-slate-500">
                  ID: {item.ktv_user.id}
                </Text>
              </View>
            </View>
          </View>

          {/* 3. Service Info */}
          <View className="mb-6">
            <Text className="mb-3 font-inter-bold text-sm uppercase text-slate-500">
              {t('booking.service_info')}
            </Text>
            <View className="gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              {/* Service Name */}
              <InfoRow label={t('booking.service_name')} value={item.service.name} showDivider />

              {/* Duration */}
              <InfoRow label={t('booking.duration')} value={`${item.duration} ${t('common.minute')}`} showDivider />

              {/* Status */}
              <InfoRow label={t('common.status')} value={<View
                className="rounded-full px-2.5 py-1 mb-1.5"
                style={{ backgroundColor: styleStatus.background }}
              >
                <Text
                  className="font-inter-bold text-[10px]"
                  style={{ color: styleStatus.text_color }}
                >
                  {t(styleStatus.label)}
                </Text>
              </View>} showDivider />

              {/* Price */}
              <InfoRow label={t('booking.original_price')} value={`${formatBalance(item.price)} ${t('common.currency')}`} showDivider />

              {/* Discount Price */}
              <InfoRow label={t('booking.discount_price')} value={`${formatBalance(item.price_discount)} ${t('common.currency')}`} showDivider />

              {/* Price Transportation */}
              <InfoRow label={t('booking.price_transportation')} value={`${formatBalance(item.price_transportation)} ${t('common.currency')}`} showDivider />

              {/* Total Price */}
              <InfoRow
                valueClassName={"text-primary-color-2 text-base font-inter-bold"}
                label={t('common.total')}
                value={`${formatBalance(item.total_price)} ${t('common.currency')}`}
              />

            </View>
          </View>

          {/* Time & Location */}
          <View className="mb-6">
            <Text className="mb-3 font-inter-bold text-sm uppercase text-slate-500">
              {t('booking.time_place')}
            </Text>

            {/* Time */}
            <View className="mb-3 flex-row items-start">
              <Icon as={Calendar} size={18} className="mr-3 mt-0.5 text-slate-400" />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-800">
                  {dayjs(item.booking_time).format('HH:mm - DD/MM/YYYY')}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">{t('booking.booking_time')}</Text>
              </View>
            </View>

            {/* Actual Start/End Time */}
            <View className="mb-3 flex-row items-start">
              <Icon as={Clock} size={18} className="mr-3 mt-0.5 text-slate-400" />
              <View className="flex-1">
                <Text className="text-xs text-slate-600">
                  {item.start_time ? dayjs(item.start_time).format('HH:mm') : '-'}
                  {item.end_time ? `- ${dayjs(item.end_time).format('HH:mm')}` : '-'}
                </Text>
              </View>
            </View>
          </View>

          {/* Note */}
          <View className="mb-8">
            <Text className="mb-3 font-inter-bold text-sm uppercase text-slate-500">
              {t('booking.note')}
            </Text>
            <View className="p-3">
              <Text className="text-sm text-slate-700">
                {item.note ? item.note : t('booking.no_desc')}
              </Text>
            </View>
          </View>

          {/* Note cancel */}
          {(item.status === _BookingStatus.CANCELED ||
            item.status === _BookingStatus.WAITING_CANCEL) && (
            <View className="mb-8">
              <Text className="mb-3 font-inter-bold text-sm uppercase text-slate-500">
                {t('booking.cancel_reasons')}
              </Text>
              <View className="p-3">
                <Text className="text-sm text-slate-700">
                  {item.reason_cancel ? item.reason_cancel : t('booking.no_cancel_reason')}
                </Text>
              </View>
            </View>
          )}
        </View> : <View />}
    </AppBottomSheet>
  );
};