import React, { useState } from 'react';
import { View,  TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { useGetLocation } from '@/features/app/hooks/use-location';


export default function RequestLocationScreen() {
  const router = useRouter();
  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);

  const { skipGetLocation, getPermission } = useGetLocation();

  // Hàm xin quyền vị trí
  const requestPermission = async () => {
    setLoading(true);
    try {
      await getPermission();
      router.replace('/(tab)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-between px-6 py-12 pt-24">
        {/* --- 1. ILLUSTRATION AREA --- */}
        <View >
          <View className="items-center justify-center mb-24">
            {/* Vòng tròn trang trí mờ phía sau (Ripple Effect) */}
            <View className="absolute w-64 h-64 bg-primary-color-2/10 rounded-full" />
            <View className="absolute w-44 h-44 bg-primary-color-2/20 rounded-full" />
            {/* Icon chính */}
            <View className="w-24 h-24 bg-primary-color-2 rounded-full items-center justify-center shadow-lg shadow-primary-color-2/40">
              <MapPin size={40} color="white" fill="white" />
            </View>

          </View>
          {/* --- 2. TEXT CONTENT --- */}
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            {t('request_location.title')}
          </Text>
          <Text className="text-gray-500 text-center text-base leading-6 mb-12 px-4">
            {t('request_location.description')}
          </Text>
        </View>

        {/* --- 3. ACTIONS --- */}
        <View className="w-full gap-y-4">
          {/* Button: Allow Location */}
          <TouchableOpacity
            onPress={requestPermission}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-full items-center shadow-md flex-row justify-center",
              loading ? "bg-gray-400" : "bg-primary-color-2"
            )}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? t('common.loading') : t('request_location.use_current_location')}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}