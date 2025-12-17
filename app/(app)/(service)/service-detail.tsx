import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StatusBar, Alert, Dimensions } from 'react-native';
import {
  X,
  TrendingUp, // Dùng cho icon "lượt đặt" (zigzag)
  ImageOff,
  ChevronLeft, // Icon cho phần Bao gồm
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useServiceDetail } from '@/features/service/hooks';
import { formatBalance } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';

const { width: PAGE_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = PAGE_WIDTH * 1.2;

export default function ServiceDetailScreen() {
  // Khởi tạo i18n
  const { t } = useTranslation();
  // Lấy thông tin dịch vụ
  const { detail, pickServiceToBooking } = useServiceDetail();

  // Lấy thông tin padding top/bottom để tránh bị che khuất bởi StatusBar
  const insets = useSafeAreaInsets();
  // Xử lý lỗi ảnh
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* --- HEADER CONTAINER --- */}
          <View className="relative">
            {/* ẢNH NỀN HOẶC ICON FALLBACK*/}
            {detail.image_url && !imageError ? (
              <Image
                source={{ uri: detail.image_url }}
                style={{
                  width: PAGE_WIDTH,
                  height: IMAGE_HEIGHT,
                }}
                contentFit="cover"
                onError={() => setImageError(true)} // Khi lỗi thì set state = true
              />
            ) : (
              <View style={{ width: PAGE_WIDTH, height: IMAGE_HEIGHT }} className={`items-center justify-center bg-gray-200`}>
                <Icon as={ImageOff} size={32} className="text-slate-400" />
              </View>
            )}

            {/* Overlay */}
            <View className="absolute inset-0 bg-black/40" />

            {/* NỘI DUNG */}

            {/* Nút Đóng  */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute left-4 top-12 rounded-full bg-white/80 p-2">
              {/* Icon Back ở đây nếu cần */}
              <Icon as={ChevronLeft} size={20} className="text-primary-color-2" />
            </TouchableOpacity>

            {/* Thông tin Dịch vụ (Title, Time...) */}
            <View
              className="absolute z-10 p-5 pb-6 bottom-6 left-0 right-0"
            >
              <Text
                className="mb-2 font-inter-bold text-xl text-white shadow-sm"
                numberOfLines={1}>
                {detail.name}
              </Text>

              <View className="flex-row items-center gap-x-4">
                <View className="flex-row items-center gap-x-1.5">
                  <TrendingUp size={16} color="#e2e8f0" />
                  <Text className="font-inter-medium text-gray-200">
                    {detail.bookings_count.toLocaleString()} {t('services.bookings')}
                  </Text>
                </View>
                <View className={'self-start rounded-lg bg-slate-50 px-2 py-1'}>
                  <Text className={'font-inter-bold text-xs text-primary-color-1'}>
                    {detail.category.name}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ---  BODY CONTENT --- */}
          <View
            style={{ marginTop: -24, paddingBottom: insets.bottom }}
            className="flex-1 px-5 pt-6 rounded-t-3xl bg-white">
            {/* Mô tả dịch vụ */}
            <View className="mb-8">
              <Text className="mb-2 font-inter-bold text-lg text-gray-900">
                {t('services.description')}
              </Text>
              <Text className="text-base leading-6 text-gray-600">{detail.description}</Text>
            </View>

            <View>
              {detail.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  disabled={!detail.is_active}
                  onPress={() =>
                    pickServiceToBooking({
                      service_id: detail.id,
                      service_name: detail.name,
                      duration: option.duration,
                      option_id: option.id,
                      price: option.price,
                    })
                  }
                  className={
                    'mb-4 flex-row items-start justify-between gap-4 rounded-2xl bg-slate-100 p-5'
                  }>
                  <View className="flex-1">
                    <Text className="mb-1 text-sm text-gray-500" numberOfLines={1}>
                      {t('common.price')}
                    </Text>
                    <View className="flex-row items-baseline gap-1">
                      <Text className="font-inter-bold text-2xl text-primary-color-2">
                        {formatBalance(option.price)}
                      </Text>
                      <Text className="font-inter-bold text-primary-color-2">
                        {t('common.currency')}
                      </Text>
                    </View>
                  </View>

                  <View className={'rounded-lg bg-base-color-3 px-2 py-1'}>
                    <Text className={'font-inter-bold text-xs text-primary-color-1'}>
                      {option.duration} {t('common.minute')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>


      </View>
    </>
  );
}
