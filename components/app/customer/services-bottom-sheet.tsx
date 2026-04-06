import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import React, { FC,  useCallback, useMemo, useState } from 'react';
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
import { useImmer } from 'use-immer';
import { useDetailKtv } from '@/features/user/hooks';

type Props = {
  ref: React.Ref<BottomSheetModal>,
  serviceData: ServiceCategoryItem | null,
  onDismiss: () => void,
  t: TFunction,
  handlePrepareBooking: ReturnType<typeof useDetailKtv>['handlePrepareBooking'],
}

export const ServicesBottomSheet: FC<Props> = ({ ref, serviceData, onDismiss, t, handlePrepareBooking }) => {

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useImmer<string[]>([]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((draft) => {
      // Tìm vị trí của id trong mảng draft
      const index = draft.indexOf(id);
      if (index !== -1) {
        // Bỏ chọn: Nếu id đã tồn tại, dùng splice để xóa nó khỏi mảng
        draft.splice(index, 1);
      } else {
        // Chọn thêm: Nếu id chưa có, dùng push để thêm thẳng vào mảng
        draft.push(id);
      }
    });
  },[]);

  // 1. Lấy ra danh sách toàn bộ các option đang được chọn
  const selectedOptions = useMemo(() => {
    if (serviceData){
      return serviceData.prices.filter(opt => selectedIds.includes(opt.id));
    }else{
      return [];
    }
  },[serviceData, selectedIds]);

// 2. Tính tổng tiền của các option đã chọn
  const totalPrice = selectedOptions.reduce((sum, opt) => sum + Number(opt.price), 0);

// 3. Biến kiểm tra xem người dùng đã chọn ít nhất 1 mục chưa
  const hasSelection = selectedIds.length > 0;

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
            const isSelected = selectedIds.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.7}
                onPress={() => handleToggle(option.id)}
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

              {/* Hiển thị TỔNG giá tiền của CÁC gói đang chọn */}
              <View className="flex-col">
                <Text className="text-slate-700 text-sm font-inter-bold">{t('common.temp_price')}</Text>
                <Text className="text-primary-color-2 text-xl font-inter-bold">
                  {formatBalance(totalPrice)}
                </Text>
              </View>

              {/* Book Now */}
              <TouchableOpacity
                disabled={!hasSelection}
                onPress={() => {
                  // Tạo một mảng chứa thông tin các gói đã chọn để gửi đi
                  const payload = selectedOptions.map(option => ({
                    id: option.id,
                    price: option.price,
                    duration: option.duration,
                  }));
                  // Gọi hàm chuẩn bị booking với mảng dữ liệu mới
                  handlePrepareBooking(payload);
                }}
                activeOpacity={0.7}
                className={cn('flex-row items-center px-4 py-2 rounded-xl',
                  hasSelection ? 'bg-primary-color-2' : 'bg-slate-300' // Cập nhật logic màu sắc
                )}>
                <Text className="text-white text-base font-inter-bold mr-2">{t('common.book_now')}</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : <View />
      }
    </AppBottomSheet>
  );
};