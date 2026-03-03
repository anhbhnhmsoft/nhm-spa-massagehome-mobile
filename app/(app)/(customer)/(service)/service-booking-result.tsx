import React, { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Home,
  X, DollarSign, Bike, TicketPercent, AlertCircle,
} from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import useResetNav from '@/features/app/hooks/use-reset-nav';
import { useCheckBooking } from '@/features/booking/hooks';
import { BookingCheckItem } from '@/features/booking/types';
import { formatBalance } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const ServiceBookingResultScreen = () => {

  const { t } = useTranslation();

  const resetNav = useResetNav();

  const { status, data } = useCheckBooking();

  const closeModal = useCallback(() => {
    resetNav('/(app)/(customer)/(tab)');
  },[resetNav]);

  return (
    <SafeAreaView className="flex-1 bg-white">
        {/* Header: Chỉ hiện nút Đóng (X) khi KHÔNG PHẢI đang xử lý */}
        {status !== 'waiting' && (
          <View className="flex-row justify-end px-4 pt-2">
            <TouchableOpacity onPress={() => {
              closeModal();
            }} className="rounded-full bg-gray-100 p-2">
              <Icon as={X} size={24} className="text-gray-700" />
            </TouchableOpacity>
          </View>
        )}

        {/* Nội dung chính thay đổi theo Status */}
        <View className="flex-1">
          {status === 'waiting' && <Processing t={t}  />}
          {status === 'confirmed' && data && data.data && <Success t={t} bookingData={data.data} onGoHome={closeModal} />}
          {status === 'failed' && data && data.data && <Failed t={t} bookingData={data.data} onGoHome={closeModal} />}
        </View>
      </SafeAreaView>
  );
};

export default ServiceBookingResultScreen;


// Render: Trạng thái Đang Xử Lý
const Processing = ({ t }: { t: TFunction }) => (
  <>
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      showsVerticalScrollIndicator={false}>
      {/* Hero Success */}
      <View className="flex-1 items-center px-6 justify-center">
        <View className="mb-4 rounded-full bg-blue-50 p-4">
          <ActivityIndicator size={80} color={DefaultColor.base['primary-color-1']} />
        </View>
        <Text className="text-center font-inter-bold text-2xl text-gray-800">
          {t('services.booking_processing_title')}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {t('services.booking_processing_description')}
        </Text>
      </View>
    </ScrollView>
  </>
);

// Render: Trạng thái Thành công (SUCCESS - Code cũ)
const Success = ({ t, bookingData, onGoHome }: { t: TFunction; bookingData: BookingCheckItem, onGoHome: () => void }) => (
  <>
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      showsVerticalScrollIndicator={false}>
      {/* Hero section */}
      <View className="mb-6 mt-4 items-center px-6">
        <View className="mb-4 rounded-full bg-blue-50 p-4">
          <Icon
            as={CheckCircle}
            size={80}
            color={DefaultColor.blue['500']}
            fill={DefaultColor.blue[200]}
          />
        </View>
        <Text className="text-center font-inter-bold text-2xl text-gray-800">
          {t('services.booking_success_title')}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {t('services.booking_success_description')}
        </Text>
      </View>

      {/* Info Card */}
      <InfoCard t={t} bookingData={bookingData} />
    </ScrollView>

    {/* Footer Actions */}
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onGoHome}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3">
          <Icon as={Home} size={18} className="text-gray-700" />
          <Text className="font-inter-bold text-base text-gray-700">
            {t('common.go_to_home')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </>
);

// Render: Trạng thái Thất bại (FAILED)
const Failed = ({ t, bookingData, onGoHome }: { t: TFunction; bookingData: BookingCheckItem, onGoHome: () => void }) => (

  <>
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
      showsVerticalScrollIndicator={false}>
      {/* Hero section */}
      <View className="mb-6 mt-4 items-center px-6">
        <View className="mb-4 rounded-full bg-red-50 p-4">
          <Icon as={XCircle} size={80} color={DefaultColor.red[500]} fill={DefaultColor.red[100]} />
        </View>
        <Text className="text-center font-inter-bold text-2xl text-gray-800">
          {t('services.booking_failed_title')}
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {t('services.booking_failed_message')}
        </Text>
      </View>

      {/* Info Card */}
      <InfoCard t={t} bookingData={bookingData} />
    </ScrollView>

    {/* Footer Actions */}
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onGoHome}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3">
          <Icon as={Home} size={18} className="text-gray-700" />
          <Text className="font-inter-bold text-base text-gray-700">
            {t('common.go_to_home')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </>
);

// Render: Thông tin đặt lịch
const InfoCard = ({ t, bookingData }: { t: TFunction; bookingData: BookingCheckItem }) => (
  <View className="w-full px-4 pb-24">
    <View className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <View className="mb-3 flex-row items-center justify-between border-b border-dashed border-gray-200 pb-3">
        <Text className="text-xs text-gray-500">{t('services.booking_id')}</Text>
        <Text className="font-inter-bold text-sm text-gray-800">{bookingData.booking_id}</Text>
      </View>
      {!!bookingData.reason_cancel && (
        <Card
          containerClassName={"bg-red-50 border border-red-100 mb-4"}
          className={"flex-row items-center"}
        >
          {/* Icon cảnh báo */}
          <View className="bg-red-100 p-1.5 rounded-full mr-3">
            <AlertCircle size={18} color={DefaultColor.red[500]} strokeWidth={2.5} />
          </View>

          {/* Nội dung lỗi */}
          <View className="flex-1">
            <Text className="text-red-600 text-[13px] font-inter-italic leading-5">
              {bookingData.reason_cancel}
            </Text>
          </View>
        </Card>
      )}
      <Text className="mb-4 font-inter-bold text-lg text-primary-color-1">
        {bookingData.service_name}
      </Text>
      <View className="gap-3">
        {/* Kĩ thuật viên */}
        <View className="flex-row items-start">
          <View className="mt-0.5">
            <Icon as={User} size={16} className="text-primary-color-1" />
          </View>
          <View className="ml-3 flex-1 flex-row justify-between">
            <Text className="mr-2 flex-1 text-sm text-gray-500">
              {t('services.booking_technician')}
            </Text>
            <Text className={`flex-1 text-right font-inter-medium text-sm text-gray-800`}>
              {bookingData.technician}
            </Text>
          </View>
        </View>
        {/* Ngày hẹn */}
        <View className="flex-row items-start">
          <View className="mt-0.5">
            <Icon as={Calendar} size={16} className="text-primary-color-1" />
          </View>
          <View className="ml-3 flex-1 flex-row justify-between">
            <Text className="mr-2 flex-1 text-sm text-gray-500">
              {t('services.booking_date')}
            </Text>
            <Text className={`flex-1 text-right font-inter-medium text-sm text-gray-800`}>
              {bookingData.date}
            </Text>
          </View>
        </View>
        {/* Địa chỉ hẹn */}
        <View className="flex-row items-start">
          <View className="mt-0.5">
            <Icon as={MapPin} size={16} className="text-primary-color-1" />
          </View>
          <View className="ml-3 flex-1 flex-row justify-between">
            <Text className="mr-2 flex-1 text-sm text-gray-500">
              {t('services.booking_location')}
            </Text>
            <Text className={`flex-1 text-right font-inter-medium text-sm text-gray-800`}>
              {bookingData.location}
            </Text>
          </View>
        </View>
        {/* Giá dịch vụ*/}
        <View className="flex-row items-start">
          <View className="mt-0.5">
            <Icon as={DollarSign} size={16} className="text-primary-color-1" />
          </View>
          <View className="ml-3 flex-1 flex-row justify-between">
            <Text className="mr-2 flex-1 text-sm text-gray-500">
              {t('services.service_price')}
            </Text>
            <Text className={`flex-1 text-right font-inter-medium text-sm text-gray-800`}>
              {formatBalance(bookingData.price || 0)} {t('common.currency')}
            </Text>
          </View>
        </View>
        {/* Cước di chuyển */}
        <View className="flex-row items-start">
          <View className="mt-0.5">
            <Icon as={Bike} size={16} className="text-primary-color-1" />
          </View>
          <View className="ml-3 flex-1 flex-row justify-between">
            <Text className="mr-2 flex-1 text-sm text-gray-500">
              {t('services.distance_price')}
            </Text>
            <Text className={`flex-1 text-right font-inter-medium text-sm text-gray-800`}>
              {formatBalance(bookingData.price_transportation || 0)} {t('common.currency')}
            </Text>
          </View>
        </View>
        {/* Giảm giá */}
        <View className="flex-row items-start">
          <View className="mt-0.5">
            <Icon as={TicketPercent} size={16} className="text-primary-color-1" />
          </View>
          <View className="ml-3 flex-1 flex-row justify-between">
            <Text className="mr-2 flex-1 text-sm text-gray-500">
              {t('services.discount')}
            </Text>
            <Text className={`flex-1 text-right font-inter-medium text-sm text-gray-800`}>
              {formatBalance(bookingData.price_discount || 0)} {t('common.currency')}
            </Text>
          </View>
        </View>
      </View>
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-200 pt-4">
        <Text className="font-inter-medium text-gray-600">
          {t('services.booking_total_price')}
        </Text>
        <Text className="font-inter-bold text-xl text-primary-color-1">
          {formatBalance(bookingData.total_price || 0)} {t('common.currency')}
        </Text>
      </View>
    </View>
  </View>
);
