import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import HeaderBack from '@/components/header-back';
import { Ionicons } from '@expo/vector-icons';
import { _BookingStatus, _BookingStatusMap, getStatusColor } from '@/features/service/const';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { AlignLeft, Home, User } from 'lucide-react-native';
import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';
import { useBooking } from '@/features/ktv/hooks/use-booking';
import { cn, formatBalance, openMap } from '@/lib/utils';
import { CancellationModal } from '@/components/app/cancel-booking-modal';
import { RefreshControl } from 'react-native-gesture-handler';

export default function BookingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const {
    booking,
    handleStartBooking,
    handleCancelBooking,
    canStartBooking,
    canCancelBooking,
    refetch,
    timeLeft,
    showModalCancel,
    setShowModalCancel,
    isLoadingBooking,
    isStartBookingPending,
    isCancelBookingPending,
    isFinishBookingPending,
  } = useBooking(id);

  const statusStyle = getStatusColor(booking?.status ?? _BookingStatus.PENDING);

  const discountAmount = useMemo(() => {
    return Number(booking?.price_before_discount ?? 0) - Number(booking?.price ?? 0);
  }, [booking?.price_before_discount, booking?.price]);

  const hasDiscount = useMemo(() => discountAmount > 0, [discountAmount]);
  return (
    <View className="flex-1 bg-white">
      <HeaderBack title="Chi tiết Booking" />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingBooking}
            onRefresh={() => refetch()}
            colors={[DefaultColor.base['primary-color-2']]}
            tintColor={DefaultColor.base['primary-color-2']}
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
                    color={DefaultColor.base['primary-color-2']}
                  />
                  <Text className="ml-1 font-inter-semibold text-base text-primary-color-2">
                    {t('booking.see_directions')}
                  </Text>
                </TouchableOpacity>

                {/* THIẾT KẾ MỚI CHO GHI CHÚ ĐỊA CHỈ */}
                {booking?.note_address && (
                  <View className="mt-2 rounded-xl border border-[#BFD4F5] bg-[#E8F0FE] px-4 py-2">
                    <View className="mb-2 flex-row items-center">
                      <Home size={18} color="#2A64C5" strokeWidth={2.5} />
                      <Text className="ml-2 font-inter-bold text-[13px] tracking-tight text-[#2A64C5]">
                        {t('booking.address_notes')}
                      </Text>
                    </View>
                    <Text className="font-inter-italic text-[15px] leading-6 text-[#2C3E50]">
                      {booking.note_address}
                    </Text>
                  </View>
                )}
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
                  <Text className="ml-2 text-xs text-slate-400">{t('booking.execution_date')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {dayjs(booking?.booking_time).format('DD/MM/YYYY')}
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
            {/* Time start */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons name="time" size={16} color={DefaultColor.base['primary-color-2']} />
                  <Text className="ml-2 text-xs text-slate-400">{t('booking.start')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {booking?.start_time ? dayjs(booking?.start_time).format('HH:mm') : '-- : --'}
                </Text>
              </View>
            </View>
            {/* Time end */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons name="time" size={16} color={DefaultColor.base['primary-color-2']} />
                  <Text className="ml-2 text-xs text-slate-400">{t('booking.end')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {booking?.end_time ? dayjs(booking?.end_time).format('HH:mm') : '  -- : --'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bảng tính giá */}
          <View className="px-4">
            <View className="mb-4 rounded-xl border border-slate-50 bg-white p-5">
              {/* Giá gốc */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-inter-medium text-[14px] text-slate-500">
                  {t('booking.original_price')}
                </Text>
                <Text
                  className={cn(
                    'font-inter-medium text-[14px]',
                    hasDiscount ? 'text-slate-400 line-through' : 'text-slate-700'
                  )}>
                  {formatBalance(booking?.price_before_discount || 0)} {t('common.currency')}
                </Text>
              </View>

              {/* Hiển thị Coupon nếu có giảm giá */}
              {hasDiscount && (
                <>
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="font-inter-medium text-[13px] text-slate-500">
                        {t('common.coupon')}
                      </Text>
                    </View>
                    <Text className="flex-1 pl-2 text-right font-inter-semibold text-[14px] text-slate-500">
                      {booking?.coupon?.label || ''}
                    </Text>
                  </View>
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="font-inter-medium text-[13px] text-slate-500">
                        {t('booking.discount_price')}
                      </Text>
                    </View>
                    <Text className="font-inter-semibold text-[14px] text-slate-500">
                      -{formatBalance(discountAmount)} {t('common.currency')}
                    </Text>
                  </View>
                </>
              )}

              {/* Đường kẻ gạch ngang mảnh hơn */}
              <View className="mb-3 h-[0.5px] bg-slate-100" />

              {/* Giá cuối cùng */}
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-bold text-[15px] text-slate-900">
                  {t('booking.final_price')}
                </Text>
                <Text className="font-inter-bold text-[18px] text-primary-color-2">
                  {formatBalance(booking?.price || 0)} {t('common.currency')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {booking?.note && (
          <View className="mb-4 rounded-[24px] bg-[#E8F0FE] p-4">
            {/* Header Ghi chú */}
            <View className="mb-3 flex-row items-center">
              <AlignLeft size={18} color="#2A64C5" strokeWidth={2.5} />
              <Text className="ml-2 font-inter-bold text-base tracking-tight text-primary-color-1">
                {t('booking.customer_notes')}
              </Text>
            </View>

            {/* Box nội dung trắng */}
            <View className="rounded-[16px] bg-white p-4">
              <Text className="font-inter-medium text-[14px] leading-5 text-[#2C3E50]">
                {booking.note}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {(canStartBooking || canCancelBooking || timeLeft !== null) && (
        <View className="border-t border-slate-100 bg-white p-4">
          {/* Remaining time - chỉ hiển thị khi đang chạy */}
          {timeLeft != null && (
            <View className="mb-4 items-center">
              <View className="flex-row items-center rounded-full bg-primary-color-1/10 px-5 py-2">
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={DefaultColor.base['primary-color-2']}
                />
                <Text className="ml-2 font-inter-bold text-primary-color-2">
                  {timeLeft.hours} : {timeLeft.minutes} : {timeLeft.seconds}
                </Text>
              </View>
            </View>
          )}

          {canStartBooking && (
            <TouchableOpacity
              onPress={handleStartBooking}
              disabled={isStartBookingPending}
              className={cn(
                `mb-2 flex-row items-center justify-center rounded-2xl py-3 ${
                  !canStartBooking ? 'bg-slate-300' : 'bg-primary-color-2'
                }`
              )}>
              <Text className="ml-2 font-inter-semibold text-lg text-white">
                {isStartBookingPending ? t('common.loading') : t('booking.start_service')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Cancel Button - chỉ hiển thị khi chưa start */}
          {canCancelBooking && (
            <TouchableOpacity
              onPress={() => setShowModalCancel(true)}
              disabled={isCancelBookingPending}
              className="flex-row items-center justify-center rounded-2xl bg-slate-300 py-3">
              <Text className="ml-2 font-inter-semibold text-lg text-blue-950">
                {isCancelBookingPending ? t('common.loading') : t('common.cancel')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <CancellationModal
        isVisible={showModalCancel}
        onClose={() => setShowModalCancel(false)}
        onConfirm={handleCancelBooking}
        isLoading={isCancelBookingPending}
      />
    </View>
  );
}
