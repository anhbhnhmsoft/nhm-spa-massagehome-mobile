import React, { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useGetListKTVHomepage } from '@/features/user/hooks';
import { useGetCategoryList } from '@/features/service/hooks';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { ListLocationModal } from '@/components/app/location';
import {
  CarouselBanner,
  CarouselTechnicalHomePage,
  InviteIndividualHomepage,
  ListServiceHomePage,
} from '@/components/app/customer';

export default function UserDashboard() {
  const { t } = useTranslation();

  const queryKTV = useGetListKTVHomepage();

  const [showLocationModal, setShowLocationModal] = useState(false);

  const bannerQuery = useListBannerQuery();

  const queryCategory = useGetCategoryList({ page: 1, per_page: 5 }, true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Đợi tất cả các query chạy xong
      await Promise.all([
        queryKTV.refetch(),
        queryCategory.refetch(),
        bannerQuery.refetch(),
      ]);
    }  finally {
      setIsRefreshing(false);
    }
  }, [queryKTV, queryCategory, bannerQuery]);

  return (
    <View className="flex-1 bg-gray-50">
      <FocusAwareStatusBar hidden={false} style={"dark"} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            // Chỉ hiện loading khi biến local state = true
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }>
        {/* --- BANNER CAROUSEL --- */}
        <CarouselBanner bannerQuery={bannerQuery} setShowLocationModal={setShowLocationModal} t={t} />

        {/* --- QUICK ACTIONS INVITE SECTION --- */}
        <InviteIndividualHomepage t={t} />

        {/* --- TECHNICIANS SECTION --- */}
        <CarouselTechnicalHomePage queryKTV={queryKTV} t={t} />

        {/* --- SERVICES SECTION --- */}
        <ListServiceHomePage queryCategory={queryCategory} t={t} />
      </ScrollView>

      <ListLocationModal visible={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </View>
  );
}
