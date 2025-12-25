import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { User, DoorOpen, ArrowRight, MapPinHouse } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import DefaultColor from '@/components/styles/color';
import dayjs from 'dayjs';
import { BookingItem } from '@/features/booking/types';
import { useTranslation } from 'react-i18next'; // Giả định đường dẫn component Text của bạn

interface AppointmentCardProps {
 item: BookingItem
}

export const AppointmentCard = ({ item }: AppointmentCardProps) => {
  const {t} = useTranslation();
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-row overflow-hidden">

      {/* 1. DẢI MÀU XANH BÊN TRÁI (THEO DESIGN) */}
      <View className="w-1.5 bg-[#2B7BBE]" />

      <View className="flex-1 p-4">
        {/* --- PHẦN TRÊN: THÔNG TIN CHÍNH --- */}
        <View className="flex-row">

          {/* Box Thời gian (Màu xanh nhạt) */}
          <View className="bg-blue-50 rounded-xl w-[72px] h-[72px] items-center justify-center mr-3">
            <Text className="text-[#2B7BBE] text-xl font-inter-bold">
              {dayjs(item.booking_time).format('HH:mm')}
            </Text>
          </View>

          {/* Thông tin chi tiết */}
          <View className="flex-1 justify-between py-0.5">
            <View className="flex-row justify-between items-start">
              <Text className="text-slate-900 text-lg font-inter-bold flex-1 mr-2" numberOfLines={1}>
                {item.service.name}
              </Text>
            </View>

            {/* Dòng thông tin Khách & Địa chỉ */}
            <View className="mt-1">
              <View className="flex-row items-center mb-1">
                <User size={14} color={DefaultColor.slate['500']} />
                <Text className="text-slate-500 text-sm ml-1.5 font-inter-medium">
                  {item.user.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MapPinHouse size={14} color={DefaultColor.slate['500']} />
                <Text className="text-slate-500 text-sm ml-1.5 font-inter-medium" numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- ĐƯỜNG KẺ NGANG MỜ --- */}
        <View className="h-[1px] bg-slate-100 my-3" />

        {/* --- PHẦN DƯỚI: THỜI LƯỢNG & NÚT BẤM --- */}
        <View className="flex-row justify-between items-center">
          <Text className="text-slate-400 text-sm font-inter-medium">
            {item.duration} {t('common.minute')}
          </Text>

          <View className="bg-primary-color-2 flex-row items-center px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-inter-bold mr-1.5">
              {t('common.view_detail')}
            </Text>
            <ArrowRight size={16} color="white" />
          </View>
        </View>
      </View>
    </View>
  );
};

