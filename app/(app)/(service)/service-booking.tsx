import {
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator, Pressable, FlatList, ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { useServiceBooking } from '@/features/service/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ChevronRight, MapPin, X } from 'lucide-react-native';
import DateTimePickerInput from '@/components/date-time-input';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  calculateDiscountAmount,
  calculatePriceDistance,
  cn,
  formatBalance,
  formatDistance,
  getDistanceFromLatLonInKm,
  goBack,
} from '@/lib/utils';
import { CouponCardBooking } from '@/components/app/coupon-card';
import { Icon } from '@/components/ui/icon';
import React, { useMemo, useState } from 'react';
import { ListLocationModal } from '@/components/app/location';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import BookingSuccessModal from '@/components/app/booking-complete';
import dayjs from 'dayjs';
import {
  BookingServiceRequest,
  CouponItem,
  PickBookingRequirement,
  PrepareBookingResponse,
} from '@/features/service/types';
import { TFunction } from 'i18next';
import useApplicationStore from '@/lib/store';


export default function ServiceBooking() {
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const userLocation = useApplicationStore((s) => s.location);
  const [coupon, setCoupon] = useState<CouponItem | null>(null);
  const {
    detail: item,
    form,
    queryCoupon,
    handleBooking,
    showSuccessModal,
    setShowSuccessModal,
    bookingId,
  } = useServiceBooking();

  const { control, formState: { errors }, setValue, handleSubmit } = form;

  // Tính toán khoảng cách
  const distance = useMemo(() => {
    if (item.location_ktv && userLocation) {
      const latProvider = item.location_ktv.latitude;
      const lonProvider = item.location_ktv.longitude;
      const latUser = userLocation.location.coords.latitude;
      const lonUser = userLocation.location.coords.longitude;

      return getDistanceFromLatLonInKm(
        latUser,
        lonUser,
        latProvider,
        lonProvider
      );
    }
    return 0;
  }, [item, userLocation]);


  // Tính toán giá trị tạm tính (giá gốc + cước di chuyển)
  const tempTotalPrice = useMemo(() => {
    let subTotalPrice = 0;
    const price = Number(item.option.price);
    const priceTransportation = calculatePriceDistance(item.price_transportation, distance);

    subTotalPrice = price + priceTransportation;

    return subTotalPrice;
  }, [item, distance, coupon]);

  // Tính toán giá trị giảm giá
  const discountAmount = useMemo(() => {
    if (coupon) {
      return calculateDiscountAmount(tempTotalPrice, coupon);
    }
    return 0;
  }, [tempTotalPrice, coupon]);

  // Tính toán giá trị cuối cùng (tạm tính - giảm giá)
  const finalTotalPrice = useMemo(() => {
    return tempTotalPrice - discountAmount;
  }, [tempTotalPrice, discountAmount]);



  return (
    <SafeAreaView className="relative flex-1 bg-white" edges={['top', 'bottom']}>
      <FocusAwareStatusBar hidden={true} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 px-5 pt-2">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between border-b border-gray-100 pb-4">
            <View className="flex-1 gap-2">
              <Text className="font-inter-bold text-gray-900">{t('services.booking_title')}</Text>
              {item && (
                <>
                  <Text
                    className="font-inter-medium text-sm text-primary-color-1"
                    numberOfLines={1}>
                    {item?.service.name}
                  </Text>
                  <Text
                    className="font-inter-medium text-sm text-primary-color-2"
                    numberOfLines={1}>
                    {formatBalance(item.option.price)} {t('common.currency')} - {item?.option.duration}{' '}
                    {t('common.minute')}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity
              onPress={goBack}
              className="rounded-full bg-gray-100 p-2">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className={'flex-1'}>
            <KeyboardAwareScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" // Giúp click vào input mượt hơn
            >
              <View className="flex-1 gap-6">

                {/* KTV schedule */}
                <KTVSchedule data={item} t={t} />

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
                    <View className="gap-2 mt-2">
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
                                  setCoupon(null);
                                }else{
                                  onChange(item.id)
                                  setCoupon(item);
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

                {/* Booking Footer */}
                <View className="bg-white border-t border-gray-100 pt-4 ">

                  {/* Khoảng cách tới bạn */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 text-sm">{t('services.distance')}</Text>
                    <Text className="text-gray-800 text-sm font-inter-medium">
                      {formatDistance(distance)}
                    </Text>
                  </View>

                  {/* Cước di chuyển */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 text-sm">{t('services.distance_price')}</Text>
                    <Text className="text-gray-800 text-sm font-inter-medium">
                      {formatBalance(item.price_transportation)} {t('common.currency')}
                    </Text>
                  </View>

                  {/* Giảm giá */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 text-sm">{t('services.discount')}</Text>
                    <Text className="text-gray-800 text-sm font-inter-medium">
                      {formatBalance(discountAmount)} {t('common.currency')}
                    </Text>
                  </View>


                  {/* Chi tiết giá */}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 text-sm">{t('services.subtotal')}</Text>
                    <Text className="text-gray-800 text-sm font-inter-medium">
                      {formatBalance(finalTotalPrice)} {t('common.currency')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="bg-primary-color-2 h-14 mt-4 px-8 rounded-full flex-row items-center justify-center"
                    onPress={handleSubmit(handleBooking)}
                  >
                    <Text className="text-white font-inter-bold text-lg mr-2">{t('services.btn_booking')}</Text>
                    <ChevronRight size={20} color="white" />
                  </TouchableOpacity>
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


const KTVSchedule = React.memo(({ data, t }: {
  data?: PrepareBookingResponse['data'],
  t: TFunction
}) => {
  if (!data) return null;

  const renderBookingItem = (item: any, index: number) => (
    <View key={index} className="flex-row items-center mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
      <View className="bg-blue-50 px-3 py-1 rounded-full mr-3">
        <Text className="text-primary-color-2 font-inter-bold text-sm">
          {dayjs(item.booking_time).format('HH:mm')}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-700 font-inter-medium">{t('services.busy_slot')}</Text>
        <Text className="text-gray-400 text-xs">{t('services.confirmed')}</Text>
      </View>
      <View className="w-2 h-2 rounded-full bg-orange-400" />
    </View>
  );

  return (
    <View className="w-full mb-2">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-inter-bold text-gray-800">{t('services.booking_today')}</Text>
        <Text className="text-xs text-gray-500">{dayjs().format('DD/MM/YYYY')}</Text>
      </View>

      {data.bookings.length > 0 ? (
        <View>
          {data.bookings.map(renderBookingItem)}
          <Text className="text-center text-xs text-gray-400 mt-2 font-inter-italic">
            * {t('services.booking_conflict', { min: data.break_time_gap })}
          </Text>
        </View>
      ) : (
        <View className="bg-green-50 p-6 rounded-2xl items-center">
          <Text className="text-green-600 font-inter-medium">{t('services.booking_empty')}</Text>
          <Text className="text-green-500 text-xs mt-1">{t('services.booking_empty_2')}</Text>
        </View>
      )}
    </View>
  );
});