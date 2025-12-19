import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { HeaderApp } from '@/components/header-app';
import { useGetListKTV } from '@/features/user/hooks';
import { useGetCategoryList } from '@/features/service/hooks';
import { useListBannerQuery } from '@/features/commercial/hooks/use-query';
import DefaultColor from '@/components/styles/color';
import {
  CarouselBanner,
  HomePageCategorySection,
  HomePageKTVSection,
  VerifyFeatureSection,
} from '@/components/app/carousel-homepage';


export default function UserDashboard() {


  const queryKTV = useGetListKTV();

  const queryCategory = useGetCategoryList({
    page: 1,
    per_page: 5,
  });

  const bannerQuery = useListBannerQuery();


  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <HeaderApp />

      <ScrollView
        className="pb-20 flex-1"
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


