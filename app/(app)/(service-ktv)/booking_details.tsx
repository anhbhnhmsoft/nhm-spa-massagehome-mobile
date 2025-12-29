import { Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import HeaderBack from '@/components/header-back';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { _BookingStatus, _BookingStatusMap, getStatusColor } from '@/features/service/const';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { User } from 'lucide-react-native';
import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime, useBookingDetails } from '@/features/ktv/hooks/use-booking-details';
import { queryClient } from '@/lib/provider/query-provider';
import { openMap } from '@/lib/utils';
import { CancellationModal } from '@/components/app/ktv/cancel-booking-modal';
import { RefreshControl } from 'react-native-gesture-handler';

export default function BookingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    booking,
    handleStart,
    remainingMs,
    isFetching,
    handleCancelBooking,
    showModal,
    setShowModal,
    isRunning,
    isFinished,
    isBlockedByOther,
    cancelReason,
    setCancelReason,
    handleConfirmCancel,
  } = useBookingDetails(id);
  const { t } = useTranslation();
  const statusStyle = getStatusColor(booking?.status ?? _BookingStatus.PENDING);

  const showActions =
    (booking?.status === _BookingStatus.CONFIRMED || booking?.status === _BookingStatus.ONGOING) &&
    !isFinished;

  return (
    <View className="flex-1 bg-white">
      <HeaderBack title="Chi tiết Booking" />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ['bookingApi-details-ktv', id] })
            }
            colors={[DefaultColor.base['primary-color-1']]}
            tintColor={DefaultColor.base['primary-color-1']}
          />
        }>
        {/* Status Badge */}

        <View className="mb-4 items-center">
          {booking?.status ? (
            <View className={`flex-row items-center rounded-full bg-blue-100 px-4 py-2`}>
              <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
              <Text className={`ml-2 font-inter-medium ${statusStyle.split(' ')[1]}`}>
                {t(_BookingStatusMap[booking.status])}
              </Text>
            </View>
          ) : (
            <Skeleton className="h-8 w-36 rounded-full" />
          )}
        </View>

        {/* Customer Card */}
        <View className="mb-6 justify-between rounded-3xl bg-base-color-3 p-4">
          <View className="flex-row items-center">
            <View className="relative">
              {booking?.user?.avatar_url ? (
                <Image
                  source={{ uri: booking.user.avatar_url }}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <User size={36} color={DefaultColor.slate[400]} />
                </View>
              )}
            </View>
            <View className="ml-4">
              <Text className="text-lg font-bold text-slate-800">{booking?.user?.name}</Text>
            </View>
          </View>

          <TouchableOpacity className="mt-4 flex-row items-center justify-center rounded-sm bg-primary-color-2 px-6 py-2">
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="white" />
            <Text className="ml-2 font-inter-bold text-white">{t('booking.inbox')}</Text>
          </TouchableOpacity>
        </View>

        {/* Service Card */}
        <View className="mb-20 overflow-hidden rounded-3xl border border-slate-100 bg-base-color-3 shadow-sm">
          {/* Image Header */}
          <View className="relative h-40">
            <Image
              source={{
                uri: booking?.service.image,
              }}
              className="h-full w-full"
            />
            <View className="absolute inset-0 justify-end bg-black/30 p-4">
              <Text className="font-inter-bold text-xl text-white">{booking?.service.name}</Text>
            </View>
          </View>

          {/* Location Section */}
          <View className="border-b border-slate-100 p-4">
            <View className="flex-row items-start">
              <View className="rounded-full bg-white p-2">
                <Ionicons name="location" size={20} color={DefaultColor.base['primary-color-1']} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-inter-bold text-xs uppercase text-slate-400">
                  {t('booking.location')}
                </Text>
                <Text className="font-inter-medium text-sm text-primary-color-3">
                  {booking?.address}
                </Text>
                <TouchableOpacity
                  className="mt-1 flex-row items-center"
                  onPress={() => {
                    if (!booking?.lat && !booking?.lng) {
                      return;
                    }
                    openMap(booking?.lat, booking?.lng);
                  }}>
                  <Ionicons
                    name="navigate-circle"
                    size={16}
                    color={DefaultColor.base['primary-color-1']}
                  />
                  <Text className="ml-1 font-inter-semibold text-base text-primary-color-2">
                    {t('booking.see_directions')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Grid Info */}
          <View className="flex-row flex-wrap p-2">
            {/* Date */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={DefaultColor.base['primary-color-2']}
                  />
                  <Text className="ml-2 text-xs text-slate-400">{t('common.date')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {dayjs(booking?.booking_time).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>

            {/* Time */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons name="time" size={16} color={DefaultColor.base['primary-color-2']} />
                  <Text className="ml-2 text-xs text-slate-400">{t('common.time')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {booking?.start_time ? dayjs(booking?.start_time).format('HH:mm') : '-- : --'} -
                  {booking?.end_time ? dayjs(booking?.end_time).format('HH:mm') : '  -- : --'}
                </Text>
              </View>
            </View>

            {/* Duration */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons
                    name="stopwatch"
                    size={16}
                    color={DefaultColor.base['primary-color-2']}
                  />
                  <Text className="ml-2 text-xs text-slate-400">{t('booking.duration')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {booking?.duration} {t('common.minute')}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <FontAwesome5
                    name="money-bill-wave"
                    size={14}
                    color={DefaultColor.base['primary-color-2']}
                  />
                  <Text className="ml-2 text-xs text-slate-400">{t('services.price_service')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">{booking?.price} VND</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {showActions && (
        <View className="border-t border-slate-100 bg-white p-4">
          {/* Remaining time - chỉ hiển thị khi đang chạy */}
          {isRunning && remainingMs != null && (
            <View className="mb-4 items-center">
              <View className="flex-row items-center rounded-full bg-primary-color-1/10 px-5 py-2">
                <Ionicons name="time-outline" size={18} color="#2563eb" />
                <Text className="ml-2 font-inter-bold text-primary-color-2">
                  {t('booking.remaining_time', { time: formatTime(remainingMs) })}
                </Text>
              </View>
            </View>
          )}

          {/* Start / Running / Finished Button */}
          {isBlockedByOther && (
            <View className="mb-2 items-center">
              <View className="flex-row items-center rounded-full bg-primary-color-1/10 px-5 py-2">
                <Ionicons name="time-outline" size={18} color="#2563eb" />
                <Text className="ml-2 font-inter-bold text-primary-color-2">
                  {t('booking.start_blocked_by_other', {
                    defaultValue: 'Đã có dịch vụ khác đang chạy',
                  })}
                </Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            disabled={isRunning || isFinished || isBlockedByOther}
            onPress={handleStart}
            className={`mb-2 flex-row items-center justify-center rounded-2xl py-3 ${
              isRunning || isFinished || isBlockedByOther
                ? 'bg-slate-300'
                : 'bg-primary-color-2 shadow-lg shadow-blue-300'
            }`}>
            <Ionicons
              name={isRunning ? 'checkmark-circle' : isFinished ? 'close-circle' : 'play-circle'}
              size={24}
              color="white"
            />
            <Text className="ml-2 font-inter-semibold text-lg text-white">
              {isRunning
                ? t('booking.service_running')
                : isFinished
                  ? t('booking.service_finished')
                  : t('booking.start_service')}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button - chỉ hiển thị khi chưa start */}
          {!isRunning && !isFinished && (
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="flex-row items-center justify-center rounded-2xl bg-slate-300 py-3">
              <Text className="ml-2 font-inter-semibold text-lg text-blue-950">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <CancellationModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        reason={cancelReason}
        setReason={setCancelReason}
        onConfirm={handleConfirmCancel}
      />
    </View>
  );
}
