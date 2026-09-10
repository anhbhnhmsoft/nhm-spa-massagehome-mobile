import React from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { HeaderAppKTV } from '@/components/app/ktv';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { router } from 'expo-router';
import { AppointmentCard, ReviewNewToday, ServiceOngoingItemCard, TodayEarnings, } from '@/components/app/ktv/homepage';
import { useDashboardKtvQuery } from '@/features/ktv/hooks/use-query';
import { KtvIncomingProposalSection } from '@/features/service-request/components';
import { Calendar } from 'lucide-react-native';

export default function KTVDashboard() {
  const { t } = useTranslation();
  const { data, isLoading, isRefetching, refetch } = useDashboardKtvQuery();

  const bottomPadding = getTabBarHeight() + 20;

  const goSchedule = useSingleTouch(() => {
    router.push('/(app)/(ktv)/(tab)/schedule');
  });

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <HeaderAppKTV />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        style={{ paddingBottom: bottomPadding }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching || isLoading} onRefresh={() => refetch()} />
        }>
        {/* Section: Đề xuất nhận việc từ CSKH */}
        <KtvIncomingProposalSection />

        {/* Section: Đơn đang làm */}
        {data?.booking_ongoing && (
          <View className="mb-8">
            <View className="mb-4 flex-row items-end justify-between">
              <Text className="font-inter-bold text-lg text-slate-900">
                {t('ktv.index.order_in_progress')}
              </Text>
            </View>

            <ServiceOngoingItemCard item={data.booking_ongoing} />
          </View>
        )}
        {/* Section: Đơn sắp tới */}
        <View className="mb-8">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-inter-bold text-lg text-slate-900">
              {t('ktv.index.upcoming')}
            </Text>
            <TouchableOpacity onPress={goSchedule}>
              <Text className="font-inter-semibold text-sm text-primary-color-2">
                {t('common.see_all')}
              </Text>
            </TouchableOpacity>
          </View>
          {data?.booking ? (
            <AppointmentCard item={data.booking} />
          ) : (
            <View className="items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 shadow-sm">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <Calendar size={22} color="#2B7BBE" />
              </View>
              <Text className="font-inter-bold text-sm text-slate-700">
                {t('ktv.index.no_upcoming_booking')}
              </Text>
              <Text className="mt-1 text-center font-inter-regular text-xs text-slate-400">
                {t('ktv.index.no_upcoming_desc', 'Các đơn hàng ghép thành công sẽ xuất hiện tại đây.')}
              </Text>
            </View>
          )}
        </View>

        {/* Section: Doanh thu */}
        <View className="mb-8">
          <Text className="mb-4 font-inter-bold text-lg text-slate-900">
            {t('ktv.index.earnings_today')}
          </Text>
          <TodayEarnings data={data} />
        </View>

        {/* Section: Đánh giá mới */}
        <View className="mb-10">
          <View className="mb-4 flex-row items-end justify-between">
            <Text className="font-inter-bold text-lg text-slate-900">
              {t('ktv.index.new_reviews')}
            </Text>
          </View>
          <ReviewNewToday data={data?.review_today} />
        </View>
      </ScrollView>
    </View>
  );
}
