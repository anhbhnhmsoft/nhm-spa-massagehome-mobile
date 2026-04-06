import React, { Fragment, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback, Pressable, ActivityIndicator, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBack from '@/components/header-back';
import { useBooking } from '@/features/booking/hooks';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { AlertCircle,  MapPin, Star } from 'lucide-react-native';
import { cn, formatBalance, formatDistance } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import Avatar from '@/components/ui/avatar';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { ListLocationModal } from '@/components/app/location';
import { FormInput } from '@/components/ui/form-input';
import { CouponCardBooking } from '@/components/app/coupon-card';
import dayjs from 'dayjs';
import { _BookingStatus } from '@/features/service/const';

export default function BookingConfirmationScreen() {
  const {t} = useTranslation();

  const {
    item,
    queryCoupon,
    form,
    dataPricing,
    error,
    handleBookingService,
  } = useBooking();

  const { control, formState: { errors }, setValue, handleSubmit } = form;
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  if (!item) return <Fragment/>;

  const tempDuration = useMemo(() => item.service.options.reduce((acc, cur) => acc + cur.duration, 0), [item.service.options]);
  const tempPrice = useMemo(() => item.service.options.reduce((acc, cur) => acc + Number(cur.price), 0), [item.service.options]);


  return (
    <SafeAreaView className="flex-1 relative bg-slate-50" edges={['top', 'bottom']}>
      <FocusAwareStatusBar style={'dark'} />

      {/* Header */}
      <HeaderBack title={"services.booking_title"}/>

      {/* Form */}
      <View className={'flex-1'}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: 40,
            paddingHorizontal: 20
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Information Service */}
          <Card containerClassName="mb-3">
            {/* Header: THÔNG TIN KTV */}
            <View className="flex-row items-center">
              <Avatar
                source={item.ktv.image_url}
                borderWidth={0}
                style={{ marginRight: 12}}
              />
              <View className="flex-1">
                <Text className="text-base font-inter-bold">{item.ktv.name}</Text>
                <View className={"flex-row items-center mt-0.5 gap-2"}>
                  <View className="flex-row items-center">
                    <Icon
                      as={Star}
                      className="mr-1"
                      size={14}
                      fill={DefaultColor.yellow[500]}
                      color={DefaultColor.yellow[500]}
                    />
                    <Text className="text-xs font-inter-semibold">{item.ktv.rating} {t('masseurs_detail.review_count')}</Text>
                  </View>
                  {!!dataPricing?.distance && (
                    <View className="flex-row items-center">
                      <Icon
                        as={MapPin}
                        className="mr-1"
                        size={14}
                        color={DefaultColor.slate[500]}
                      />
                      <Text className="text-xs font-inter-semibold">{formatDistance(dataPricing.distance)}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            {dataPricing?.break_time && (
              <Text className="text-xs text-slate-400 font-inter-italic mt-2 leading-6">{t('services.time_to_go_to_place', { break_time: dataPricing.break_time })}</Text>
            )}
            {/* Separator */}
            <View className="h-[1px] bg-slate-200 my-4"/>

            {/* Service Name */}
            <View className="flex-row items-center justify-between gap-2 mb-2">
              <Text className="text-sm font-inter-medium text-slate-400">{t('services.service_name')}</Text>
              <Text className="text-sm font-inter-bold text-slate-600" numberOfLines={1}>{item.service.name}</Text>
            </View>

            {/* Duration */}
            <View className="flex-row items-center justify-between gap-2 mb-3">
              <Text className="text-slate-500 text-sm">{t('services.duration')}</Text>
              <Text className="font-inter-semibold text-sm" numberOfLines={1}>{tempDuration} {t("common.minute")}</Text>
            </View>

            {/* Tiền dịch vụ */}
            <View className="flex-row items-center justify-between gap-2 mb-3">
              <Text className="text-slate-500 text-sm">{t('services.price_service')}</Text>
              <Text className="font-inter-semibold text-sm">{formatBalance(dataPricing?.price || tempPrice)} {t('common.currency')}</Text>
            </View>

            {/* Tiền khoảng cách */}
            {!!dataPricing?.price_distance && (
              <View className="flex-row items-center justify-between gap-2 mb-3">
                <Text className="text-slate-500 text-sm">{t('services.distance_price')}</Text>
                <Text className="font-inter-semibold text-sm">{formatBalance(dataPricing.price_distance || 0)} {t('common.currency')}</Text>
              </View>
            )}
            {/* Tiền giảm giá */}
            {!!dataPricing?.discount_coupon && (
              <View className="flex-row items-center justify-between gap-2 mb-3">
                <Text className="text-slate-500 text-sm">{t('services.discount')}</Text>
                <Text
                  className="font-inter-semibold text-sm">{formatBalance(dataPricing.discount_coupon || 0)} {t('common.currency')}</Text>
              </View>
            )}

            {/* Separator */}
            <View className="h-[1px] bg-slate-200 mb-4" />

            {/* Tổng tiền */}
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-inter-bold">{t('common.total')}</Text>
              <Text className="text-lg font-inter-bold text-primary-color-2">
                {formatBalance(dataPricing?.final_price || tempPrice)} {t('common.currency')}
              </Text>
            </View>
          </Card>


          {!!dataPricing?.booking_today && (
            <Card
              containerClassName={"bg-yellow-50 border border-yellow-100"}
              className={"flex-row items-center"}
            >
              {/* Icon cảnh báo */}
              <View className="bg-yellow-100 p-1.5 rounded-full mr-3">
                <AlertCircle size={18} color={DefaultColor.yellow[500]} strokeWidth={2.5} />
              </View>

              {/* Nội dung lỗi */}
              <View className="flex-1">
                <Text className="text-yellow-600 text-[13px] font-inter-italic leading-5">
                  {dataPricing.booking_today.status === _BookingStatus.CONFIRMED && t('booking.warning_alert_service_booking_confirm', { time: dayjs(dataPricing.booking_today.booking_time).format('HH:mm') })}
                  {dataPricing.booking_today.status === _BookingStatus.ONGOING && t('booking.warning_alert_service_booking_ongoing', { time: dayjs(dataPricing.booking_today.start_time).format('HH:mm') })}
                </Text>
              </View>
            </Card>
          )}

          {/* Error Card */}
          {error && (
            <Card
              containerClassName={"bg-red-50 border border-red-100"}
              className={"flex-row items-center"}
            >
              {/* Icon cảnh báo */}
              <View className="bg-red-100 p-1.5 rounded-full mr-3">
                <AlertCircle size={18} color={DefaultColor.red[500]} strokeWidth={2.5} />
              </View>

              {/* Nội dung lỗi */}
              <View className="flex-1">
                <Text className="text-red-600 text-[13px] font-inter-italic leading-5">
                  {error}
                </Text>
              </View>
            </Card>
          )}



          {/* Address Card */}
          <View className="mt-4">
            <Controller
              control={control}
              name={'address'}
              render={({ field: { value } }) => {
                return (
                  <View className="gap-2">
                    <Label>{t('services.address')} <Text className="text-red-500">*</Text></Label>
                    <TouchableOpacity onPress={() => setShowLocationModal(true)}>
                      <Card className={'flex-row items-center'}>
                        <View className="mr-3 rounded-full bg-blue-100 p-2">
                          <Icon as={MapPin} size={20} className="text-blue-600" />
                        </View>
                        <View className="flex-1">
                          {value ? (
                            <Text className="font-inter-medium text-sm leading-6 text-slate-800">
                              {value}
                            </Text>
                          ) : (
                            <Text className="text-sm text-gray-400">
                              {t('location.placeholder_address')}
                            </Text>
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                    <ListLocationModal
                      visible={showLocationModal}
                      onClose={() => setShowLocationModal(false)}
                      onSelect={(location) => {
                        setValue('address', location.address);
                        setValue('latitude', Number(location.latitude));
                        setValue('longitude', Number(location.longitude));
                        setShowLocationModal(false);
                      }}
                    />
                    {errors.address && (
                      <Text className="text-sm text-red-500">{errors.address.message}</Text>
                    )}
                    {(errors.latitude || errors.longitude) && (
                      <Text className="text-sm text-red-500">
                        {t('services.error.invalid_address')}
                      </Text>
                    )}
                  </View>
                );
              }}
            />
          </View>

          {/* Note */}
          <View className="mt-4">
            <Controller
              control={control}
              name="note"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label={t('services.note')}
                  error={errors.note?.message}
                  id="note"
                  placeholder={t('common.optional_note')}
                  isTextArea
                  textAlignVertical="top"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* Coupon */}
          <View className="mt-4 mb-4">
            <Controller
              control={control}
              name="coupon_id"
              render={({ field: { value, onChange } }) => (
                <View className="gap-2">
                  {/* Header: Label + Nút Reload */}
                  <View className="flex-row items-center justify-between">
                    <Label>{t('common.coupon')}</Label>

                    {/* Nút Reload thủ công */}
                    <Pressable
                      onPress={() => queryCoupon.refetch()}
                      disabled={queryCoupon.isLoading}
                      className="flex-row items-center gap-1 active:opacity-50">
                      {queryCoupon.isRefetching ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                      ) : (
                        <>
                          <Text className="text-xs font-inter-medium text-blue-600">
                            {t('common.refresh')}
                          </Text>
                          {/* Thay icon reload của bạn vào đây */}
                          <Text className="text-xs text-blue-600">↻</Text>
                        </>
                      )}
                    </Pressable>
                  </View>

                  {queryCoupon.isLoading && !queryCoupon.isRefetching ? (
                    <ActivityIndicator size="small" className="mt-2" />
                  ) : (
                    <FlatList
                      data={queryCoupon.data || []}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      // Quan trọng: Để scroll mượt và không bị cắt bóng đổ
                      contentContainerStyle={{ paddingRight: 20, paddingLeft: 1 }}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <CouponCardBooking
                          item={item}
                          isSelected={value === item.id}
                          onPress={() => {
                            if (value === item.id) {
                              onChange(null);
                            }else{
                              onChange(item.id)
                            }
                          }}
                        />
                      )}
                      // Component phân cách giữa các item (thay cho margin-right)
                      ItemSeparatorComponent={() => <View className="w-3" />}
                      // Hiển thị khi danh sách trống
                      ListEmptyComponent={() => (
                        <Text
                          className="w-full rounded-lg border border-dashed border-slate-300 p-2 text-center font-inter-italic text-sm text-slate-400">
                          {t('services.no_coupon_available')}
                        </Text>
                      )}
                    />
                  )}
                </View>
              )}
            />
          </View>

        </KeyboardAwareScrollView>
      </View>

      {/* STICKY FOOTER */}
      <View className="bg-white px-5 py-4 flex-row justify-between items-center border-t border-slate-100 pb-8 gap-2">
        <View>
          <Text className="text-[10px] text-slate-400 font-inter-bold uppercase mb-0.5">{t('services.subtotal')}</Text>
          <Text className="text-xl font-extrabold text-primary-color-2">
            {formatBalance(dataPricing?.final_price || tempPrice)} {t('common.currency')}
          </Text>
        </View>

        <TouchableOpacity
          disabled={!!error}
          onPress={handleSubmit(handleBookingService)}
          className={cn('rounded-2xl px-6 py-3.5 flex-row items-center shadow-md shadow-blue-200', {
            'bg-slate-400': !!error,
            'bg-primary-color-2': !error,
          })}>
          <Text className="text-white font-inter-bold text-base mr-2">{t('services.btn_booking')}</Text>
          <Ionicons name="chevron-forward" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>

  );
}