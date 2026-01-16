import { BookingItem } from '@/features/booking/types';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Calendar, Clock, ImageOff, MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import DefaultColor from '@/components/styles/color';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn, formatBalance } from '@/lib/utils';
import dayjs from 'dayjs';
import { _BookingStatus, _BookingStatusMap, getStatusColor } from '@/features/service/const';
import { useGetRoomChat } from '@/features/chat/hooks';
import { ReviewModal } from '@/components/app/review-modal';

export const BookingCard = ({
  item,
  onRefresh,
  cancelBooking,
}: {
  item: BookingItem;
  onRefresh: () => void;
  cancelBooking: (bookingId: string) => void;
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const getRoomChat = useGetRoomChat();
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <>
      <View className="mb-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        {/* 2. Info: Avatar, Name, Price */}
        <View className="mb-4 flex-row items-center">
          {/* Avatar */}
          {item.ktv_user.avatar_url && !imageError ? (
            <Image
              source={{ uri: item.ktv_user.avatar_url }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 9999,
                backgroundColor: DefaultColor.gray[200],
                marginRight: 12,
              }}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 9999,
                backgroundColor: DefaultColor.gray[200],
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
              <Icon as={ImageOff} size={24} className="text-slate-400" />
            </View>
          )}

          {/* Detail */}
          <View className="flex-1">
            <Text className="font-inter-bold text-base text-slate-800">{item.ktv_user.name}</Text>
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              {item.service.name}
            </Text>
          </View>

          {/* Price */}
          <Text className="font-inter-bold text-base text-primary-color-1">
            {formatBalance(item.price)} {t('common.currency')}
          </Text>
        </View>

        {/* 3. Time & Address Lines */}
        <View className="mb-4 gap-2">
          {/* Date line */}
          <View className="flex-row items-center">
            <View className="w-1/2 flex-row items-center">
              <Icon as={Calendar} size={14} className="mr-1.5 text-slate-600" />
              <Text className="text-xs text-slate-600">
                {dayjs(item.booking_time).format('DD/MM/YYYY HH:mm')}
              </Text>
            </View>
          </View>

          {/* Address line */}
          <View className="flex-row items-start">
            <MapPin size={14} color="#64748b" className="mr-1.5 mt-0.5" />
            <Text className="flex-1 text-xs text-slate-600" numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>

        {/* 4. Action Buttons (3 nút dưới cùng) */}
        <View className="flex-row gap-2">
          {/* Reviews Button */}
          {item.status === _BookingStatus.COMPLETED ? (
            <>
              <TouchableOpacity
                disabled={item.has_reviews}
                onPress={() => setShowReviewModal(true)}
                className={cn(
                  'flex-1 items-center justify-center rounded-lg bg-orange-500 py-2',
                  item.has_reviews && 'cursor-not-allowed bg-slate-400'
                )}>
                <Text className="font-inter-bold text-xs text-white">
                  {item.has_reviews ? t('booking.has_reviews') : t('booking.reviews')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Inbox Button */}
              <TouchableOpacity
                onPress={() => getRoomChat({ user_id: item.ktv_user.id })}
                className="flex-1 items-center justify-center rounded-lg bg-primary-color-2 py-2">
                <Text className="font-inter-bold text-xs text-white">{t('booking.inbox')}</Text>
              </TouchableOpacity>
            </>
          )}
          {/* Detail Button */}
          <TouchableOpacity
            onPress={() => setShowDetailModal(true)}
            className="flex-1 items-center justify-center rounded-lg bg-slate-100 py-2">
            <Text className="font-inter-bold text-xs text-slate-600">{t('booking.detail')}</Text>
          </TouchableOpacity>

          {/* cancel Button */}
          {item.status === _BookingStatus.CONFIRMED && (
            <TouchableOpacity
              onPress={() => cancelBooking(item.id)}
              className="flex-1 items-center justify-center rounded-lg bg-slate-100 py-2">
              <Text className="font-inter-bold text-xs text-slate-600">{t('common.cancel')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Booking Detail Modal */}
      <BookingDetailModal
        isVisible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={item}
      />
      {/* Review Modal */}
      <ReviewModal
        isVisible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        serviceBookingId={item.id}
        onSuccess={() => {
          setShowReviewModal(false);
          onRefresh();
        }}
      />
    </>
  );
};

type BookingDetailModalProps = {
  isVisible: boolean;
  onClose: () => void;
  item: BookingItem;
};

export const BookingDetailModal = ({ isVisible, onClose, item }: BookingDetailModalProps) => {
  const { t } = useTranslation();
  const statusStyle = getStatusColor(item.status);
  const [imageError, setImageError] = useState(false);

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-[85%] w-full rounded-t-3xl bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-slate-100 p-4">
            <Text className="font-inter-bold text-lg text-slate-800">
              {t('booking.detail_title')}
            </Text>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-slate-100 p-2">
              <Icon as={X} size={20} className="text-slate-600" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            {/* 1. Status Banner */}
            <View
              className={`mb-6 flex-row items-center justify-center rounded-lg py-3 ${statusStyle.split(' ')[0]}`}>
              <Text className={`font-inter-bold ${statusStyle.split(' ')[1]}`}>
                {t(_BookingStatusMap[item.status])}
              </Text>
            </View>

            {/* 2. KTV Info */}
            <View className="mb-6">
              <Text className="mb-3 font-inter-bold text-sm uppercase text-slate-500">
                {t('booking.technician')}
              </Text>
              <View className="flex-row items-center rounded-xl border border-slate-100 bg-slate-50 p-3">
                {item.ktv_user.avatar_url && !imageError ? (
                  <Image
                    source={{ uri: item.ktv_user.avatar_url }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      backgroundColor: DefaultColor.gray[200],
                      marginRight: 12,
                    }}
                    contentFit="cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      backgroundColor: DefaultColor.gray[200],
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}>
                    <Icon as={ImageOff} size={24} className="text-slate-400" />
                  </View>
                )}
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
                <View className="flex-row flex-wrap justify-between gap-2">
                  <Text className="text-slate-600">{t('booking.service_name')}</Text>
                  <Text className="font-inter-semibold text-slate-800">{item.service.name}</Text>
                </View>
                <View className="h-[1px] bg-slate-100" />
                <View className="flex-row flex-wrap justify-between gap-2">
                  <Text className="text-slate-600">{t('booking.duration')}</Text>
                  <Text className="font-inter-semibold text-slate-800">
                    {item.duration} {t('common.minute')}
                  </Text>
                </View>
                <View className="h-[1px] bg-slate-100" />
                <View className="flex-row flex-wrap justify-between gap-2">
                  <Text className="text-slate-600">{t('booking.price')}</Text>
                  <Text className="font-inter-semibold text-base text-primary-color-1">
                    {formatBalance(item.price)} {t('common.currency')}
                  </Text>
                </View>
                {item.coupon ? (
                  <>
                    {/* Coupon */}
                    <View className="h-[1px] bg-slate-100" />
                    <View className="flex-row flex-wrap justify-between gap-2">
                      <Text className="text-slate-600">{t('booking.coupon')}</Text>
                      <Text className="font-inter-semibold text-slate-800">
                        {item.coupon.label}
                      </Text>
                    </View>
                    {/* Số tiền được giảm */}
                    <View className="h-[1px] bg-slate-100" />
                    <View className="flex-row flex-wrap justify-between gap-2">
                      <Text className="text-slate-600">{t('booking.discount_price')}</Text>
                      <Text className="font-inter-semibold text-slate-800">
                        {formatBalance(Number(item.price_before_discount) - Number(item.price))}{' '}
                        {t('common.currency')}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>

            {/* 4. Time & Location */}
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

              {/* Address */}
              <View className="flex-row items-start">
                <Icon as={MapPin} size={18} className="mr-3 mt-0.5 text-slate-400" />
                <View className="flex-1">
                  <Text className="font-inter-semibold text-sm text-slate-800">{item.address}</Text>
                  {item.note_address && (
                    <Text className="mt-1 font-inter-italic text-xs text-slate-500">
                      ({t('booking.note_address')}: {item.note_address})
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* 5. Note */}
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

            {/* Spacer bottom */}
            <View className="h-10" />
          </ScrollView>

          {/* Footer Buttons  */}
          <View className="flex-row gap-3 border-t border-slate-100 bg-white p-4 pb-8">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-xl bg-slate-100 py-3"
              onPress={onClose}>
              <Text className="font-inter-bold text-slate-600">{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
