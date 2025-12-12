import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '@/components/styles/gradient-background';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { useGetLocation, useLocationAddress } from '@/features/app/hooks/use-location';
import useAuthStore from '@/features/auth/store';

export function HeaderApp() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { location, permission } = useLocationAddress();
  const { getPermission } = useGetLocation();

  return (
    <GradientBackground
      style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 24, zIndex: 10 }}
      className="z-10 px-4 pb-6 shadow-sm">
      {/* Top Bar: Location & Noti */}
      <View className="mb-4 mt-2 flex-row items-center justify-between gap-8">
        <TouchableOpacity
          disabled={permission === 'granted'}
          onPress={getPermission}
          activeOpacity={0.8}
          className={'flex-1'}>
          <Text className="text-xs font-medium text-blue-200">{t('header_app.location')}</Text>
          <View className="mt-1 flex-row items-center gap-1">
            <MapPin size={16} color="white" />
            <Text className="font-inter-bold text-base text-white" numberOfLines={1}>
              {location?.address || t('header_app.need_location')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="relative">
          <Bell size={24} color="white" />
          {/* Dấu chấm đỏ thông báo */}
          <View className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#1d4ed8] bg-red-500" />
        </TouchableOpacity>
      </View>

      {/* Welcome Text */}
      <Text className="mb-1 font-inter-bold text-xl text-white">{t('header_app.hello')}</Text>
      <Text className="mb-4 text-sm text-blue-100">{t('header_app.search_description')}</Text>

      {/* Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="h-12 flex-row items-center rounded-xl bg-white px-3 shadow-sm">
        <Search size={20} color="#94a3b8" />
        <Text className="ml-2 flex-1 text-sm text-slate-700">
          {t('header_app.search_placeholder')}
        </Text>
      </TouchableOpacity>
    </GradientBackground>
  );
}
