import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useGetListKTVHomepage } from '@/features/user/hooks';
import { useGetCategoryList } from '@/features/service/hooks';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import {
  CarouselBanner,
  HomePageCategorySection,
  HomePageKTVSection,
  InviteKtv,
} from '@/components/app/carousel-homepage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocationUser } from '@/features/app/hooks/use-get-user-location';
import { MapPin } from 'lucide-react-native';
import { Text } from 'moti';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { ListLocationModal } from '@/components/app/location';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';

export default function UserDashboard() {
  const queryKTV = useGetListKTVHomepage();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const redirectAuth = useCheckAuthToRedirect();
  const locationUser = useLocationUser();
  const bannerQuery = useListBannerQuery();

  const queryCategory = useGetCategoryList({ page: 1, per_page: 5 }, true);

  return (
    <View className="flex-1 bg-base-color-3">
      {/* Màu nền slate nhẹ cho sang */}
      <FocusAwareStatusBar hidden />
      {/* --- HEADER FLOATING LOCATION --- */}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={
              queryKTV.isRefetching || queryCategory.isRefetching || bannerQuery.isRefetching
            }
            onRefresh={() => {
              queryKTV.refetch();
              queryCategory.refetch();
              bannerQuery.refetch();
            }}
          />
        }>
        {/* --- 1. BANNER CAROUSEL --- */}
        <View className="overflow-hidden">
          <View
            className="absolute z-50 flex-row items-center px-4"
            style={{ top: insets.top + 10 }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => redirectAuth(() => setShowLocationModal(true))}
              className="flex-row items-center rounded-full border border-white/20 bg-black/30 px-4 py-2.5"
              style={{ backdropFilter: 'blur(10px)' }} // Note: Blur chỉ hoạt động tốt trên iOS với View cụ thể, nhưng styling này tạo cảm giác glassmorphism
            >
              <MapPin size={14} color="white" />
              <Text
                className="ml-1.5 max-w-[150px] font-inter-medium text-[13px] text-white"
                numberOfLines={1}>
                {locationUser?.address || t('header_app.need_location')}
              </Text>
            </TouchableOpacity>
          </View>
          <CarouselBanner bannerQuery={bannerQuery} />
        </View>

        {/* --- 2. QUICK ACTIONS SECTION --- */}
        <View className="mt-4 px-4">
          {/* Đẩy phần dưới lên đè nhẹ lên banner */}
          <View className="rounded-2xl bg-white p-2 shadow-xl shadow-slate-200">
            <InviteKtv onPress={redirectAuth} />
          </View>
        </View>

        {/* --- 3. TECHNICIANS SECTION --- */}
        <HomePageKTVSection queryKTV={queryKTV} />

        {/* --- 4. SERVICES SECTION --- */}
        <HomePageCategorySection queryCategory={queryCategory} />
      </ScrollView>
      <ListLocationModal visible={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </View>
  );
}
