import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Bell, Calendar, ChevronRight, Star, TrendingUp, Clock, CheckCircle2, MapPin, User } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { router } from 'expo-router';
import { AppointmentCard } from '@/components/app/ktv/homepage';
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


          {/*<AppointmentCard />*/}
        </View>

        {/* Section: Doanh thu */}
        <View className="mb-8">
          <Text className="text-lg font-inter-bold text-slate-900 mb-4">{t('ktv.index.earnings_today')}</Text>
          <View className="bg-blue-600 p-6 rounded-[32px] items-center mb-4 shadow-lg shadow-blue-200">
            <Text className="text-white text-3xl font-inter-bold">2.500.000đ</Text>
            <View className="flex-row items-center bg-blue-500/50 px-3 py-1 rounded-full mt-3">
              <TrendingUp size={14} color="white" />
              <Text className="text-white text-[10px] ml-1">+12% so với hôm qua</Text>
            </View>
          </View>

          <View className="flex-row gap-x-4">
            <View className="flex-1 bg-white p-4 rounded-3xl items-center border border-slate-100">
              <CheckCircle2 size={24} color="#10b981" />
              <Text className="text-slate-400 text-[10px] mt-2">Đã hoàn thành</Text>
              <Text className="text-xl font-inter-bold text-slate-900">4 đơn</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-3xl items-center border border-slate-100">
              <Clock size={24} color="#f59e0b" />
              <Text className="text-slate-400 text-[10px] mt-2">Đang chờ</Text>
              <Text className="text-xl font-inter-bold text-slate-900">2 đơn</Text>
            </View>
          </View>
        </View>

        {/* Section: Đánh giá mới */}
        <View className="mb-10">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-lg font-inter-bold text-slate-900">Đánh giá mới</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 text-sm">Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm">
            {/* Header đánh giá */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-center gap-x-3">
                <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
                  <Text className="text-slate-500 font-inter-bold">MA</Text>
                </View>
                <View>
                  <Text className="text-slate-900 font-inter-bold">Mai Anh</Text>
                  <Text className="text-slate-400 text-[10px]">Hôm nay, 10:00</Text>
                </View>
              </View>

              {/* Điểm số */}
              <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
                <Star size={12} color="#f59e0b" fill="#f59e0b" />
                <Text className="ml-1 text-amber-700 text-xs font-inter-bold">5.0</Text>
              </View>
            </View>

            {/* Nội dung đánh giá */}
            <View className="bg-slate-50 p-4 rounded-2xl">
              <Text className="text-slate-900 font-inter-bold mb-1">Tuyệt vời!</Text>
              <Text className="text-slate-500 text-sm leading-5">
                Kỹ thuật viên tay nghề rất tốt, thái độ phục vụ chuyên nghiệp, không gian yên tĩnh...
              </Text>
            </View>

            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-blue-500 font-inter-semibold text-sm">Xem tất cả đánh giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>

  );
}
