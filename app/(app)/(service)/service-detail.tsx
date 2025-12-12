import { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import {
  X,
  TrendingUp, // Dùng cho icon "lượt đặt" (zigzag)
  ImageOff, // Icon cho phần Bao gồm
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useServiceDetail } from '@/features/service/hooks';
import { formatBalance } from '@/lib/utils';
import { Text } from '@/components/ui/text';

export default function ServiceDetailScreen() {
  // Khởi tạo i18n
  const { t } = useTranslation();
  // Lấy thông tin dịch vụ
  const { service, pickServiceToBooking } = useServiceDetail();
  // Kiểm tra dịch vụ có tồn tại hay không
  if (!service) {
    return null;
  }

  // Lấy thông tin padding top/bottom để tránh bị che khuất bởi StatusBar
  const insets = useSafeAreaInsets();
  // Xử lý lỗi ảnh
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <View className="flex-1 bg-white">
        <StatusBar barStyle="light-content" />

        {/* --- HEADER CONTAINER (Thay thế ImageBackground) --- */}
        <View className="relative h-64 w-full justify-end bg-slate-200">
          {/* === LAYER 1: ẢNH NỀN HOẶC ICON FALLBACK === */}
          {service.image_url && !imageError ? (
            <Image
              source={{ uri: service.image_url }}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
              onError={() => setImageError(true)} // Khi lỗi thì set state = true
            />
          ) : (
            // Giao diện khi lỗi ảnh: Nền xám + Icon ImageOff ở giữa
            <View className="absolute inset-0 h-full w-full items-center justify-center bg-slate-200">
              <ImageOff size={48} color="#94a3b8" />
              <Text className="mt-2 text-xs text-slate-400">{t('common.no_image')}</Text>
            </View>
          )}

          {/* === LAYER 2: LỚP PHỦ TỐI (Overlay) === */}
          {/* Vẫn giữ lớp này để Text màu trắng bên dưới luôn đọc được, dù nền là ảnh hay là icon */}
          <View className="absolute inset-0 bg-black/40" />

          {/* === LAYER 3: NỘI DUNG (Text, Button) === */}
          {/* Nút Đóng (X) */}
          <TouchableOpacity
            style={{ top: insets.top + 10 }}
            className={`absolute right-5 z-10 rounded-full bg-white/20 p-1.5`}
            onPress={() => router.back()}>
            <X size={24} color="white" />
          </TouchableOpacity>

          {/* Thông tin Dịch vụ (Title, Time...) */}
          <View className="z-10 p-5 pb-6">
            <Text className="mb-2 font-inter-bold text-3xl text-white shadow-sm" numberOfLines={1}>
              {service.name}
            </Text>

            <View className="flex-row items-center gap-x-4">
              <View className="flex-row items-center gap-x-1.5">
                <TrendingUp size={16} color="#e2e8f0" />
                <Text className="font-inter-medium text-gray-200">
                  {service.bookings_count.toLocaleString()} {t('services.bookings')}
                </Text>
              </View>
              <View className={'self-start rounded-lg bg-slate-50 px-2 py-1'}>
                <Text className={'font-inter-bold text-xs text-primary-color-1'}>
                  {service.category.name}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- 2. BODY CONTENT --- */}
        <ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Để ko bị nút che mất nội dung cuối
        >
          {/* Mô tả dịch vụ */}
          <View className="mb-8">
            <Text className="mb-2 font-inter-bold text-lg text-gray-900">
              {t('services.description')}
            </Text>
            <Text className="text-base leading-6 text-gray-600">{service.description}</Text>
          </View>

          <View>
            {service.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                disabled={!service.is_active}
                onPress={() => pickServiceToBooking({
                  service_id: service.id,
                  service_name: service.name,
                  duration: option.duration,
                })}
                className={
                  'mb-4 flex-row items-start justify-between gap-4 rounded-2xl bg-slate-100 p-5'
                }>
                <View className="flex-1">
                  <Text className="mb-1 text-sm text-gray-500" numberOfLines={1}>
                    {t('common.price')}
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text className="font-inter-bold text-2xl text-[#1D5D9B]">
                      {formatBalance(option.price)} đ
                    </Text>
                  </View>
                </View>

                <View className={'rounded-lg bg-emerald-100 px-3 py-1.5'}>
                  <Text className={'font-inter-bold text-xs text-emerald-700'}>
                    {option.duration} {t('common.minute')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
