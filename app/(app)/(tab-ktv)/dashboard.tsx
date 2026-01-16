import React, { ComponentType, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CreditCard, Share2, Star, TrendingUp, Users } from 'lucide-react-native';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { getTabBarHeight } from '@/components/styles/style';
import { useDashboardTotalIncome } from '@/features/ktv/hooks';
import { formatBalance } from '@/lib/utils';
import { _DashboardTabMap, DASHBOARD_TABS, DashboardTab } from '@/features/service/const';
import DashboardChart from '@/components/app/ktv/dashboard_chart';
import Empty from '@/components/empty';
import { router } from 'expo-router';
import { TransactionItem } from '@/components/app/wallet';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  icon: ComponentType<{
    size?: number;
    color?: string;
  }>;
  label: string;
  value: string | number;
  iconBgColor: string;
}
const StatCard = ({ icon: Icon, label, value, iconBgColor }: StatCardProps) => (
  <View className="mb-4 w-[48%] rounded-3xl border border-blue-100 bg-white p-4 shadow-sm shadow-gray-200">
    <View className={`mb-3 h-11 w-11 items-center justify-center rounded-2xl ${iconBgColor}`}>
      <Icon size={22} color="#044984" />
    </View>

    <Text className="mb-1 font-inter-medium text-[13px] text-gray-400">{label}</Text>

    <Text className="font-inter-bold text-xl text-primary-color-1">{value}</Text>
  </View>
);

const DashboardScreen = () => {
  const {
    activeTab,
    handleSetTab,
    data,
    percentChangeText,
    queryTransactionList,
    refetch,
    t,
    isLoading,
  } = useDashboardTotalIncome();
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (refetch) await refetch();
    } finally {
      setRefreshing(false);
    }
  };
  const TAB_BAR_HEIGHT = getTabBarHeight();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <HeaderAppKTV />
        <View className="px-5">
          {/* Tabs Skeleton */}
          <View className="mb-8 mt-4 rounded-2xl bg-gray-100/80 p-1.5">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}>
              {DASHBOARD_TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => handleSetTab(tab)}
                    className={`rounded-xl px-5 py-2.5 ${isActive ? 'bg-white' : ''}`}>
                    <Text
                      className={`text-center text-[13px] ${
                        isActive
                          ? 'font-inter-bold text-primary-color-1'
                          : 'font-inter-medium text-gray-500'
                      }`}>
                      {t(_DashboardTabMap[tab])}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Total Income Skeleton */}
          <View className="mb-8 items-center">
            <Skeleton className="mb-2 h-4 w-32 rounded-md" />
            <View className="flex-row items-end gap-2">
              <Skeleton className="h-12 w-48 rounded-xl" />
            </View>
            <Skeleton className="mt-4 h-8 w-40 rounded-full" />
          </View>

          {/* Chart Skeleton */}
          <Skeleton className="mb-8 h-48 w-full rounded-3xl" />

          {/* Grid Stats Skeleton */}
          <View className="flex-row flex-wrap justify-between">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="mb-4 w-[48%] rounded-3xl border border-blue-50 bg-white p-4">
                <Skeleton className="mb-3 h-11 w-11 rounded-2xl" />
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-6 w-24" />
              </View>
            ))}
          </View>

          {/* Transactions Skeleton */}
          <View className="mt-6">
            <View className="mb-5 flex-row justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-16" />
            </View>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="mb-3 h-16 w-full rounded-2xl" />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <HeaderAppKTV />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}>
        {/* Header Tabs */}
        <View className="mb-8 mt-4 rounded-2xl bg-gray-100/80 p-1.5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}>
            {DASHBOARD_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleSetTab(tab)}
                  className={`rounded-xl px-5 py-2.5 ${isActive ? 'bg-white' : ''}`}>
                  <Text
                    className={`text-center text-[13px] ${
                      isActive
                        ? 'font-inter-bold text-primary-color-1'
                        : 'font-inter-medium text-gray-500'
                    }`}>
                    {t(_DashboardTabMap[tab])}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tổng doanh thu */}
        <View className="mb-8 items-center">
          <Text className="mb-2 font-inter-semibold text-[13px] uppercase tracking-[2px] text-gray-400">
            {t('dashboard.total_income_label')}
          </Text>
          <View className="flex-row items-end gap-1">
            <Text className="font-inter-extrabold text-[36px] text-primary-color-1">
              {formatBalance(data?.total_income || 0)}
            </Text>
            <Text className="font-inter-bold text-sm text-primary-color-1">
              {t('common.currency')}
            </Text>
          </View>

          {percentChangeText && activeTab !== DashboardTab.DAY && (
            <View className="mt-3 flex-row items-center rounded-full bg-green-50 px-4 py-1.5">
              <TrendingUp size={14} color="#22c55e" />
              <Text className="ml-1.5 text-sm font-semibold text-green-600">
                {percentChangeText}
              </Text>
            </View>
          )}
        </View>

        {/* Biểu đồ doanh thu (Placeholder) */}
        <DashboardChart type={activeTab} data={data ? data.chart_data : []} />

        {/* Grid Stats */}
        <View className="flex-row flex-wrap justify-between">
          <StatCard
            icon={Users}
            label={t('dashboard.stats.customers')}
            value={data ? data.total_customers : '0'}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            icon={CreditCard}
            label={t('dashboard.stats.received_income')}
            value={data ? formatBalance(data.received_income) : '0'}
            iconBgColor="bg-green-50"
          />
          <StatCard
            icon={Share2}
            label={t('dashboard.stats.affiliate')}
            value={data ? formatBalance(data.affiliate_income) : '0'}
            iconBgColor="bg-purple-50"
          />
          <StatCard
            icon={Star}
            label={t('dashboard.stats.reviews')}
            value={data ? data.total_reviews : '0'}
            iconBgColor="bg-orange-50"
          />
        </View>

        {/* Giao dịch gần đây */}
        <View className="mb-10 mt-6">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="font-inter-extrabold text-xl text-primary-color-1">
              {t('dashboard.recent_transactions')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/(app)/(service-ktv)/wallet');
              }}>
              <Text className="font-inter-bold text-[13px] text-primary-color-2">
                {t('common.see_all')}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            keyExtractor={(item, index) => `transaction-${item.id}-${index}`}
            data={queryTransactionList.data || []}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{
              flex: 1,
              position: 'relative',
            }}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 100,
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={null}
            renderItem={({ item }) => <TransactionItem item={item} key={item.id} />}
            ListEmptyComponent={<Empty />}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
