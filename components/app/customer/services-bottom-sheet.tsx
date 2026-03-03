import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import React, { FC, Fragment, useState } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';
import { ServiceCategoryItem } from '@/features/user/types';
import { TFunction } from 'i18next';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { ImageOff } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { cn, formatBalance } from '@/lib/utils';
import { Text } from '@/components/ui/text';

type Props = {
  ref: React.Ref<BottomSheetModal>,
  serviceData: ServiceCategoryItem | null,
  onDismiss: () => void,
  t: TFunction,
  handlePrepareBooking: (option: { id: string, price: string, duration: number }) => void,
}

export const ServicesBottomSheet: FC<Props> = ({ ref, serviceData, onDismiss, t, handlePrepareBooking }) => {

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [imageError, setImageError] = useState(false);

  return (
    <AppBottomSheet
      ref={ref}
      isScrollable={true}
      snapPoints={['90%']}
      onDismiss={() => {
        onDismiss();
        setSelectedId(null);
      }}
    >
      {serviceData ? (
        <View className="px-2 pb-8 pt-2">
          {/* Ảnh Cover & Badge Đánh giá */}
          <View className="relative">
            {serviceData.image_url && !imageError ? (
              <Image
                source={{ uri: serviceData.image_url }}
                style={{
                  width: '100%',
                  height: 192,
                  borderRadius: 16,
                }}
                contentFit="cover"
                onError={() => setImageError(true)} // Khi lỗi thì set state = true
              />
            ) : (
              <View style={{
                width: '100%',
                height: 192,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: DefaultColor.gray['200'],
              }}>
                <Icon as={ImageOff} size={32} className="text-slate-400" />
              </View>
            )}
          </View>

          {/* Phần Tiêu đề & Thông tin */}
          <Text className="text-xl font-inter-bold mt-5">
            {serviceData.name}
          </Text>

          {/* Thông tin số lượng đặt lịch */}
          <View className="flex-row items-center mt-2 gap-2">
            <Ionicons name="people-outline" size={16} color={DefaultColor.slate['500']} />
            <Text
              className="text-sm text-slate-500">{serviceData.booking_count.toLocaleString()} {t('services.bookings')}</Text>
          </View>

          {/* Thông tin mô tả */}
          <Text className="text-base text-slate-500 mt-2 leading-6">
            {serviceData.description}
          </Text>

          {/* Separator */}
          <View className="h-[1px] w-full bg-slate-100 my-4" />

          {/* Danh sách các option */}
          {serviceData.prices.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => setSelectedId(option.id)}
                className={cn(`flex-row items-center p-4 mb-3 rounded-2xl border-2`,
                  isSelected ? 'border-primary-color-2 bg-blue-50/30' : 'border-slate-100 bg-white',
                )}
              >
                {/* Icon đồng hồ */}
                <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-4">
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color={isSelected ? DefaultColor.base['primary-color-2'] : DefaultColor.slate['500']}
                  />
                </View>

                {/* Text thời gian */}
                <View className="flex-1">
                  <Text className="text-base font-inter-bold text-slate-700">
                    {option.duration} {t('common.minute')}
                  </Text>
                </View>

                {/* Giá tiền & Checkbox */}
                <View className="flex-row items-center">
                  <Text className="text-base font-inter-bold text-slate-700 mr-3">
                    {formatBalance(option.price)} {t('common.currency')}
                  </Text>

                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={24} color={DefaultColor.base['primary-color-2']} />
                  ) : (
                    <View className="w-6 h-6 rounded-full border-2 border-slate-200" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View className="mt-8">
            <View
              className="w-full bg-slate-100 rounded-2xl py-4 px-6 flex-row justify-between items-center shadow-lg shadow-slate-300">
              {/* Hiển thị giá tiền của gói đang chọn */}
              <View className="flex-col">
                <Text className="text-slate-700 text-sm font-inter-bold">{t('common.price')}</Text>
                <Text className="text-primary-color-2 text-xl font-inter-bold">
                  {formatBalance(serviceData.prices.find(opt => opt.id === selectedId)?.price ?? 0)} {t('common.currency')}
                </Text>
              </View>

              {/* Book Now */}
              <TouchableOpacity
                disabled={!selectedId}
                onPress={() => {
                  const option = serviceData.prices.find(opt => opt.id === selectedId);
                  if (option) {
                    handlePrepareBooking({
                      id: option.id,
                      price: option.price,
                      duration: option.duration,
                    });
                  }
                }}
                activeOpacity={0.7}
                className={cn('flex-row items-center bg-primary-color-2 px-4 py-2 rounded-xl',
                  selectedId ? 'bg-primary-color-2' : 'bg-slate-300',
                )}>
                <Text className="text-white text-base font-inter-bold mr-2">{t('common.book_now')}</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : <Fragment />
      }
    </AppBottomSheet>
  );
};