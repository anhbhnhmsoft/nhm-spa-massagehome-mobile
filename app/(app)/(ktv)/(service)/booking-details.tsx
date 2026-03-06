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
import { useBooking } from '@/features/ktv/hooks/use-booking';
import { cn, formatBalance, openMap } from '@/lib/utils';
import { RefreshControl } from 'react-native-gesture-handler';
import Avatar from '@/components/ui/avatar';
import { useGetRoomChat } from '@/features/chat/hooks';
import { Divider } from '@/components/ui/divider';
import { useCancelBooking } from '@/features/booking/hooks';
import { CancelBookingBottomSheet } from '@/components/app/customer';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const {
    booking,
    handleStartBooking,
    canStartBooking,
    canCancelBooking,
    refetch,
    timeLeft,
    isLoadingBooking,
    isStartBookingPending,
  } = useBooking(id);

  const {
    ref: refCancel,
    handleOpen: handleOpenCancel,
    handleSubmit,
    loading: loadingCancel,
  } = useCancelBooking(() => refetch());

  const joinRoomChat = useGetRoomChat();

  const inset = useSafeAreaInsets();


  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom','top']}>
      <HeaderBack title="booking.detail_title" />

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

        {/* Detail */}
        <View className="mb-4 overflow-hidden rounded-3xl border border-slate-100 bg-base-color-3">
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
          <View className="p-4">
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

              </View>
            </View>
          </View>

          {/* User Info */}
          <View className="px-4">
            <View className="rounded-2xl bg-slate-50 p-3">
              <View className="flex-row items-center">
                <Avatar source={booking?.user?.avatar_url} />
                <View className="ml-4">
                  <Text className="text-lg font-inter-bold text-slate-800">{booking?.user?.name}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="mt-4 flex-row items-center justify-center rounded-sm bg-primary-color-2 px-6 py-2"
                onPress={() => {
                  if (booking?.user?.id) {
                    joinRoomChat({
                      user_id: booking?.user?.id,
                    },'ktv')
                  }
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="white" />
                <Text className="ml-2 font-inter-bold text-white">{t('booking.inbox')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Grid Info */}
          <View className="flex-row flex-wrap p-2">
            {/* Status */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons
                    name="ticket"
                    size={16}
                    color={DefaultColor.base['primary-color-2']}
                  />
                  <Text className="ml-2 text-xs text-slate-400">{t('booking.status')}</Text>
                </View>
                <Text className="font-inter-bold text-slate-800">
                  {booking?.status ? t(_BookingStatusMap[booking.status]) : ""}
                </Text>
              </View>
            </View>

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

            {/* Time start - end */}
            <View className="w-1/2 p-2">
              <View className="rounded-2xl bg-slate-50 p-3">
                <View className="mb-1 flex-row items-center">
                  <Ionicons name="time" size={16} color={DefaultColor.base['primary-color-2']} />
                  <Text className="ml-2 text-xs text-slate-400">{t('booking.start')} - {t('booking.end')}</Text>
                </View>
                <Text className="font-inter-bold text-center text-slate-800">
                  {booking?.start_time ? dayjs(booking?.start_time).format('HH:mm') : '-- : --'} {booking?.end_time ? dayjs(booking?.end_time).format('HH:mm') : '  -- : --'}
                </Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          <View className="px-4">
            <View className="mb-4 rounded-2xl bg-slate-50 p-3 gap-2">
              <View>
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
                    {booking?.note || t('booking.no_customer_notes')}
                  </Text>
                </View>
              </View>
              {!!booking?.reason_cancel && (
                <View>
                  {/* Header Ghi chú */}
                  <View className="mb-3 flex-row items-center">
                    <AlignLeft size={18} color="#2A64C5" strokeWidth={2.5} />
                    <Text className="ml-2 font-inter-bold text-base tracking-tight text-primary-color-1">
                      {t('booking.cancel_service_reason')}
                    </Text>
                  </View>

                  {/* Box nội dung trắng */}
                  <View className="rounded-[16px] bg-white p-4">
                    <Text className="font-inter-medium text-[14px] leading-5 text-[#2C3E50]">
                      {booking.reason_cancel}
                    </Text>
                  </View>
                </View>
              )}
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
                  className={'font-inter-medium text-[14px] text-slate-700'}>
                  {formatBalance(booking?.price || 0)} {t('common.currency')}
                </Text>
              </View>
              {/*Giá giảm giá*/}
              <View className="mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="font-inter-medium text-[13px] text-slate-500">
                    {t('booking.price_discount')}
                  </Text>
                </View>
                <Text className="font-inter-semibold text-[14px] text-slate-500">
                  {formatBalance(booking?.price_discount || 0)} {t('common.currency')}
                </Text>
              </View>

              {/* Phí vận chuyển */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Text className="font-inter-medium text-[13px] text-slate-500">
                    {t('booking.price_transportation')}
                  </Text>
                </View>
                <Text className="font-inter-semibold text-[14px] text-slate-500">
                  {formatBalance(booking?.price_transportation || 0)} {t('common.currency')}
                </Text>
              </View>
              {/* Đường kẻ gạch ngang mảnh hơn */}
              <Divider />

              {/* Giá cuối cùng */}
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-bold text-[15px] text-slate-900">
                  {t('booking.final_price')}
                </Text>
                <Text className="font-inter-bold text-[18px] text-primary-color-2">
                  {formatBalance(booking?.total_price || 0)} {t('common.currency')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(canStartBooking || canCancelBooking || timeLeft !== null) && (
        <View className="border-t border-slate-100 bg-white p-4" style={{ paddingBottom: inset.bottom }}>
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
              onPress={() => {
                if (booking?.id){
                  handleOpenCancel(booking.id);
                }
              }}
              disabled={loadingCancel}
              className="flex-row items-center justify-center rounded-2xl bg-slate-300 py-3">
              <Text className="ml-2 font-inter-semibold text-lg text-blue-950">
                {loadingCancel ? t('common.loading') : t('common.cancel')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* cancel Modal */}
      <CancelBookingBottomSheet
        t={t}
        ref={refCancel}
        onDismiss={() => {}}
        handleSubmit={handleSubmit}
        loading={loadingCancel}
      />
    </SafeAreaView>
  );
}
