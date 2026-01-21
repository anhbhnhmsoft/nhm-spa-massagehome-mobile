import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { useGetLocation, useLocation } from '@/features/app/hooks/use-location';

export default function RequestLocationModal() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { getPermission } = useGetLocation();

  const { locationPermission, completeCheck } = useLocation();

  const checkShowLocation = useMemo(() => {
    return locationPermission === null && completeCheck
  }, [locationPermission, completeCheck]);


  useEffect(() => {
    setIsVisible(checkShowLocation);
  }, [checkShowLocation]);

  const requestPermission = async () => {
    setLoading(true);
    try {
      await getPermission();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true} // Cho phép nhìn xuyên qua nền
      animationType="fade" // Hiệu ứng hiện ra nhẹ nhàng
    >
      {/* Overlay làm mờ nền phía sau */}
      <View className="flex-1 bg-black/50 justify-end">

        {/* Nội dung Modal (Card) */}
        <View className="bg-white rounded-t-2xl px-8 pt-4 pb-12 items-center shadow-2xl">
          {/* Thanh Indicator trên đầu */}
          <View className="w-12 h-1.5 bg-gray-200 rounded-full mb-8" />

          {/* --- 1. ILLUSTRATION AREA (Gọn hơn) --- */}
          <View className="items-center justify-center mb-8">
            <View className="w-20 h-20 bg-primary-color-2 rounded-full items-center justify-center shadow-lg shadow-primary-color-2/40">
              <MapPin size={32} color="white" fill="white" />
            </View>
          </View>

          {/* --- 2. TEXT CONTENT --- */}
          <Text className="text-xl font-inter-bold text-gray-900 text-center mb-3">
            {t('request_location.title')}
          </Text>
          <Text className="text-gray-500 text-center text-sm leading-5 mb-8 px-2">
            {t('request_location.description')}
          </Text>

          {/* --- 3. ACTIONS --- */}
          <View className="w-full gap-y-3">
            <TouchableOpacity
              onPress={requestPermission}
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-2xl items-center shadow-sm flex-row justify-center",
                loading ? "bg-gray-400" : "bg-primary-color-2"
              )}
            >
              <Text className="text-white text-base font-inter-bold">
                {loading ? t('common.loading') : t('request_location.use_current_location')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
