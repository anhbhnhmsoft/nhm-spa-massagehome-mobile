import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { router } from 'expo-router';
import { AppointmentCard, ReviewNewToday, TodayEarnings } from '@/components/app/ktv/homepage';
import { useDashboardKtvQuery } from '@/features/ktv/hooks/use-query';

export default function KTVDashboard() {
  const {t} = useTranslation();

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
  } = useDashboardKtvQuery();

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <View className="flex-1 bg-base-color-3">
      {/* Header */}
      <HeaderAppKTV />

      <ScrollView
        className="flex-1 bg-base-color-3 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        style={{ paddingBottom: bottomPadding }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching || isLoading}
            onRefresh={() => refetch()}
          />
        }
      >
        {/* Section: Đơn sắp tới */}
        <View className="mb-8">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-inter-bold text-slate-900">{t('ktv.index.upcoming')}</Text>
            <TouchableOpacity onPress={useSingleTouch(() => {
              router.push('/(app)/(tab-ktv)/schedule')
            })}>
              <Text className="text-primary-color-2 text-sm">
                {t('common.see_all')}
              </Text>
            </TouchableOpacity>
          </View>
          {data?.booking ?
            <AppointmentCard item={data.booking} />
            :
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-row overflow-hidden">
              <Text className="text-center text-slate-400 text-sm">{t('ktv.index.no_upcoming_booking')}</Text>
            </View>
          }
        </View>

        {/* Section: Doanh thu */}
        <View className="mb-8">
          <Text className="text-lg font-inter-bold text-slate-900 mb-4">{t('ktv.index.earnings_today')}</Text>
          <TodayEarnings data={data} />
        </View>

        {/* Section: Đánh giá mới */}
        <View className="mb-10">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-inter-bold text-slate-900">{t('ktv.index.new_reviews')}</Text>
          </View>
          <ReviewNewToday data={data?.review_today} />
        </View>
      </ScrollView>
    </View>

  );
}
