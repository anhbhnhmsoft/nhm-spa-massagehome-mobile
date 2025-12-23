import {
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator, Pressable, FlatList
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { useServiceBooking } from '@/features/service/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ChevronRight, MapPin, X } from 'lucide-react-native';
import { router } from 'expo-router';
import DateTimePickerInput from '@/components/date-time-input';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn, formatBalance } from '@/lib/utils';
import { CouponCardBooking } from '@/components/app/coupon-card';
import { Icon } from '@/components/ui/icon';
import React, { useState } from 'react';
import { ListLocationModal } from '@/components/app/location';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import BookingSuccessModal from '@/components/app/booking-complete';


export default function ServiceBooking() {
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);

  const { detail: item, form, queryCoupon, handleBooking, showSuccessModal, setShowSuccessModal , bookingId} = useServiceBooking();

  const { control, formState: {errors}, setValue, handleSubmit} = form;

  return (
    <SafeAreaView className="relative flex-1 bg-white" edges={['top', 'bottom']}>
      <FocusAwareStatusBar hidden={true} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-5 pb-8 pt-2">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between border-b border-gray-100 pb-4">
            <View className="flex-1 gap-2">
              <Text className="font-inter-bold text-gray-900">{t('services.booking_title')}</Text>
              {item && (
                <>
                  <Text
                    className="font-inter-medium text-sm text-primary-color-1"
                    numberOfLines={1}>
                    {item?.service_name}
                  </Text>
                  <Text
                    className="font-inter-medium text-sm text-primary-color-2"
                    numberOfLines={1}>
                    {formatBalance(item.price)} {t('common.currency')} - {item?.duration}{' '}
                    {t('common.minute')}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="rounded-full bg-gray-100 p-2">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className={'flex-1'}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              enableOnAndroid={true}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}>
              {/* Form */}
              <View className="flex-1 gap-4">
                {/* Address */}
                <Controller
                  control={control}
                  name={'address'}
                  render={({ field: { value } }) => {
                    return (
                      <View className="gap-2">
                        <Label>{t('services.address')} *</Label>
                        <TouchableOpacity
                          onPress={() => setShowLocationModal(true)}
                          className={`flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-4`}>
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
                        </TouchableOpacity>
                        <ListLocationModal
                          visible={showLocationModal}
                          onClose={() => setShowLocationModal(false)}
                          onSelect={(location) => {
                            setValue('address', location.address);
                            setValue('latitude', Number(location.latitude));
                            setValue('longitude', Number(location.longitude));
                            setValue('note_address', location.desc || '');
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

                {/* Note Address */}
                <Controller
                  control={control}
                  name="note_address"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="gap-2">
                      <Label htmlFor="note">{t('services.note_address')}</Label>
                      <Input
                        id="note_address"
                        className={cn('h-32 w-full overflow-hidden rounded-2xl bg-white p-4', {
                          'border-red-500': errors.note_address,
                        })}
                        placeholder={t('common.optional_note')}
                        multiline
                        textAlignVertical="top"
                        numberOfLines={4}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                      {errors.note_address && (
                        <Text className="text-sm text-red-500">{errors.note_address.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Book Time */}
                <Controller
                  control={control}
                  name="book_time"
                  render={({ field: { value, onChange } }) => {
                    // Luôn đảm bảo value truyền vào component con là Date Object
                    // Nếu value null/undefined (lúc init) thì lấy giờ hiện tại
                    const dateValue = value ? new Date(value) : new Date();

                    return (
                      <View className="gap-2">
                        <Label htmlFor="book_time">{t('services.book_time')} *</Label>
                        <View className="gap-2">
                          {/* --- INPUT CHỌN NGÀY --- */}
                          <DateTimePickerInput
                            mode="date"
                            value={dateValue}
                            onChange={(newDate) => {
                              // 1. Clone lại date hiện tại để không sửa trực tiếp biến state cũ (tránh side-effect)
                              const temp = new Date(dateValue);
                              // 2. Chỉ update Ngày/Tháng/Năm từ newDate người dùng chọn
                              temp.setFullYear(newDate.getFullYear());
                              temp.setMonth(newDate.getMonth());
                              temp.setDate(newDate.getDate());
                              // 3. Convert sang ISO String để lưu vào form
                              onChange(temp.toISOString());
                            }}
                          />

                          {/* --- INPUT CHỌN GIỜ --- */}
                          <DateTimePickerInput
                            mode="time"
                            value={dateValue}
                            onChange={(newTime) => {
                              // 1. Clone lại date hiện tại
                              const temp = new Date(dateValue);
                              // 2. Chỉ update Giờ/Phút từ newTime người dùng chọn
                              temp.setHours(newTime.getHours());
                              temp.setMinutes(newTime.getMinutes());
                              // 3. QUAN TRỌNG: Reset giây về 0 để tránh lỗi validate "quá khứ" do lệch giây
                              temp.setSeconds(0);
                              temp.setMilliseconds(0);
                              // 4. Convert sang ISO String
                              onChange(temp.toISOString());
                            }}
                          />
                        </View>

                        {/* Hiển thị lỗi */}
                        {errors.book_time && (
                          <Text className="text-sm text-red-500">{errors.book_time.message}</Text>
                        )}
                      </View>
                    );
                  }}
                />

                {/* Note */}
                <Controller
                  control={control}
                  name="note"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="gap-2">
                      <Label htmlFor="note">{t('services.note')}</Label>
                      <Input
                        id="note"
                        className={cn('h-32 w-full overflow-hidden rounded-2xl bg-white p-4', {
                          'border-red-500': errors.note,
                        })}
                        placeholder={t('common.optional_note')}
                        multiline
                        textAlignVertical="top"
                        numberOfLines={4}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />

                {/* Coupon */}
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
                                value === item.id ? onChange(null) : onChange(item.id);
                              }}
                            />
                          )}
                          // Component phân cách giữa các item (thay cho margin-right)
                          ItemSeparatorComponent={() => <View className="w-3" />}
                          // Hiển thị khi danh sách trống
                          ListEmptyComponent={() => (
                            <Text className="w-full rounded-lg border border-dashed border-slate-300 p-2 text-center font-inter-italic text-sm text-slate-400">
                              {t('services.no_coupon_available')}
                            </Text>
                          )}
                        />
                      )}
                    </View>
                  )}
                />

                <View className="z-0 mt-auto pt-4">
                  <View className={'flex-1 flex-row items-center gap-2'}>
                    {/* Nút Booking */}
                    <TouchableOpacity
                      className="h-14 flex-1 flex-row items-center justify-center rounded-full bg-primary-color-2 shadow-sm"
                      onPress={handleSubmit(handleBooking)}>
                      <Text className="mr-2 text-lg font-inter-bold text-white">
                        {t('services.btn_booking')}
                      </Text>
                      <ChevronRight size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* Modal Booking Success */}
      <BookingSuccessModal
        bookingId={bookingId}
        isVisible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
        }}
      />
    </SafeAreaView>
  );
}
