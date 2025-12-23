import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { HeaderApp } from '@/components/header-app';
import {  useGetListKTVHomepage } from '@/features/user/hooks';
import { useGetCategoryList } from '@/features/service/hooks';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import DefaultColor from '@/components/styles/color';
import {
  CarouselBanner,
  HomePageCategorySection,
  HomePageKTVSection,
  VerifyFeatureSection,
} from '@/components/app/carousel-homepage';
import { getTabBarHeight } from '@/app/(app)/(tab)/_layout';


export default function UserDashboard() {

  const queryKTV = useGetListKTVHomepage();

  const queryCategory = useGetCategoryList({
    page: 1,
    per_page: 5,
  }, true);

  const bannerQuery = useListBannerQuery();

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <HeaderApp />

      <ScrollView
        className="flex-1"
        style={{ paddingBottom: getTabBarHeight() + 20 }}
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
            colors={[DefaultColor.base['primary-color-1']]}
            tintColor={DefaultColor.base['primary-color-1']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* --- 1. BANNER CAROUSEL --- */}
        <View className="mt-4">
          <CarouselBanner bannerQuery={bannerQuery} />
        </View>

        {/* --- 2. TRUST / VERIFICATION SECTION --- */}
       <VerifyFeatureSection />

        {/* --- 3. RECOMMENDED TECHNICIANS (Horizontal) --- */}
        <HomePageKTVSection queryKTV={queryKTV} />

        {/* --- 4. RECOMMENDED SERVICES (Vertical) --- */}
        <HomePageCategorySection queryCategory={queryCategory} />
      </ScrollView>
    </View>
  );
}


