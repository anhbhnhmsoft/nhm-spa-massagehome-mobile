import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MapPin, Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '@/components/styles/gradient-background';
import { useTranslation } from 'react-i18next';
import {Text} from '@/components/ui/text';
import { useGetLocation, useLocationAddress } from '@/features/app/hooks/use-location';
import useAuthStore from '@/features/auth/store';


export function HeaderApp() {
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const { location, permission } = useLocationAddress();
  const {getPermission} = useGetLocation();

  return (
    <GradientBackground
      style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 24, zIndex: 10 }}
      className="px-4 pb-6 z-10 shadow-sm"
    >
      {/* Top Bar: Location & Noti */}
      <View className="flex-row justify-between items-center mb-4 mt-2 gap-8">
        <TouchableOpacity
          disabled={permission === 'granted'}
          onPress={getPermission}
          activeOpacity={0.8}
          className={"flex-1"}
        >
          <Text className="text-blue-200 text-xs font-medium">{t('header_app.location')}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MapPin size={16} color="white" />
            <Text className="text-white font-inter-bold text-base" numberOfLines={1}>
              {location?.address || t('header_app.need_location')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="relative">
          <Bell size={24} color="white" />
          {/* Dấu chấm đỏ thông báo */}
          <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1d4ed8]" />
        </TouchableOpacity>
      </View>

      {/* Welcome Text */}
      <Text className="text-white text-xl font-inter-bold mb-1">{t('header_app.hello')}</Text>
      <Text className="text-blue-100 text-sm mb-4">{t('header_app.search_description')}</Text>

      {/* Search Bar */}
      <TouchableOpacity activeOpacity={0.8} className="bg-white rounded-xl flex-row items-center px-3 h-12 shadow-sm">
        <Search size={20} color="#94a3b8" />
        <Text className="text-slate-700 text-sm ml-2 flex-1">
          {t('header_app.search_placeholder')}
        </Text>
      </TouchableOpacity>
    </GradientBackground>
  );
}


// Dành riêng cho màn hình đơn hàng
export function HeaderAppOrder(){
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const user = useAuthStore((state) => state.user);
  return (
    <GradientBackground
      style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 24, zIndex: 10 }}
      className="px-4 pb-6 z-10 shadow-sm"
    >
      <Text className="text-white text-xl font-bold mb-1 mt-2">{t('header_app.title_orders')}</Text>
        <Text className="text-blue-100 text-xs mb-4">Quản lý thông tin khách hàng của bạn</Text>
    </GradientBackground>
  )
}