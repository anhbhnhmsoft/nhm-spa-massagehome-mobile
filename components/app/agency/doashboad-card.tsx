import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, LucideIcon, ShoppingCart, Star, User, Users } from 'lucide-react-native';
import { TFunction } from 'i18next';
import { _TimeFilter, TimeFilterMap } from '@/features/agency/const';
import { formatBalance } from '@/lib/utils';
import { KtvPerformance, ReferralAffiliateSummary } from '@/features/agency/type';

// --- Interfaces ---

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon; // Type dành cho các icon từ lucide-react-native
  variant?: 'light' | 'primary';
  fullWidth?: boolean;
}

interface TechnicianItemProps {
  item: KtvPerformance;
  t: TFunction;
}

interface DashboardHeaderProps {
  t: TFunction;
  activeFilter: _TimeFilter;
  onFilterChange: (filter: _TimeFilter) => void;
  tabs: _TimeFilter[];
  data?: ReferralAffiliateSummary; // Bạn nên thay any bằng Interface DashboardData của bạn
  isLoading?: boolean;
}

// --- Components ---

/**
 * 1. Component thẻ thống kê dùng chung
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  variant = 'light',
  fullWidth = false,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <View
      className={`mb-4 rounded-2xl p-4 ${
        fullWidth ? 'w-full flex-row items-center' : 'w-[48%]'
      } ${isPrimary ? 'bg-primary-color-2' : 'border border-slate-100 bg-slate-50'}`}>
      {Icon && (
        <View
          className={`mb-3 h-10 w-10 items-center justify-center rounded-lg ${
            isPrimary ? 'bg-white/20' : 'bg-blue-100'
          }`}>
          <Icon size={20} color={isPrimary ? '#white' : '#2B7BBE'} />
        </View>
      )}
      <View className={fullWidth ? 'flex-1 pl-2' : ''}>
        <Text
          className={`font-inter-bold text-[10px] uppercase ${
            isPrimary ? 'text-white/80' : 'text-slate-500'
          }`}>
          {title}
        </Text>
        <Text
          className={`font-inter-bold ${fullWidth ? 'text-2xl' : 'text-lg'} ${
            isPrimary ? 'text-white' : 'text-base-color-1'
          }`}>
          {value}
        </Text>
        {unit && (
          <Text
            className={`font-inter-medium text-[10px] ${
              isPrimary ? 'text-white/90' : 'text-slate-400'
            }`}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
};

/**
 * 2. Component Item Kỹ thuật viên
 */
export const TechnicianItem: React.FC<TechnicianItemProps> = ({ item, t }) => {
  return (
    <View className="mb-4 px-4">
      <View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {/* Phần đầu: Avatar và Thông tin chính */}
        <View className="mb-4 flex-row items-center">
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              className="h-12 w-12 rounded-full border border-slate-100"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <User size={24} color="#94a3b8" />
            </View>
          )}

          <View className="ml-3 flex-1">
            <Text className="font-inter-bold text-base text-base-color-1" numberOfLines={1}>
              {item.name}
            </Text>
            {item.total_reviews && (
              <View className="mt-1 flex-row items-center">
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text className="ml-1 font-inter-medium text-xs text-slate-500">
                  {t('agency.page.dashboard.items.reviews', { count: item.total_reviews })}
                </Text>
              </View>
            )}
          </View>

          {/* Doanh thu nổi bật ở góc phải */}
          <View className="items-end">
            <Text className="font-inter-bold text-sm text-primary-color-2">
              {formatBalance(item.total_revenue || 0)}
            </Text>
            <Text className="font-inter-medium text-[10px] uppercase text-slate-400">
              {t('agency.page.dashboard.items.revenue')}
            </Text>
          </View>
        </View>

        {/* Đường kẻ ngang mảnh */}
        <View className="mb-4 h-[1px] w-full bg-slate-50" />

        {/* Phần dưới: Chỉ số hiệu suất (Stats Grid) */}
        <View className="flex-row justify-between">
          {/* Đơn hàng thành công */}
          <View className="mr-2 flex-1 flex-row items-center rounded-xl bg-green-50 px-3 py-2">
            <CheckCircle size={14} color="#10b981" />
            <View className="ml-2">
              <Text className="font-inter-bold text-xs text-green-700">
                {item.total_finished_bookings}
              </Text>
              <Text className="font-inter-medium text-[9px] uppercase text-green-600/70">
                {t('agency.page.dashboard.items.orders')}
              </Text>
            </View>
          </View>

          {/* Khách hàng duy nhất */}
          <View className="ml-2 flex-1 flex-row items-center rounded-xl bg-blue-50 px-3 py-2">
            <Users size={14} color="#3b82f6" />
            <View className="ml-2">
              <Text className="font-inter-bold text-xs text-blue-700">
                {item.total_unique_customers}
              </Text>
              <Text className="font-inter-medium text-[9px] uppercase text-blue-600/70">
                {t('agency.page.dashboard.items.customers')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
/**
 * 3. Skeleton Loading Screen
 */
export const DashboardSkeleton: React.FC = () => (
  <View className="px-4">
    {/* Skeleton Top Cards */}
    <View className="mb-4 flex-row gap-4">
      <View className="flex-1 rounded-2xl bg-slate-200 p-4">
        <Skeleton className="h-20 w-full" />
      </View>
      <View className="flex-1 rounded-2xl bg-slate-200 p-4">
        <Skeleton className="h-20 w-full" />
      </View>
    </View>

    {/* Skeleton Grid */}
    <View className="flex-row flex-wrap justify-between">
      <View className="mb-4 h-24 w-[48%] overflow-hidden rounded-2xl bg-slate-100">
        <Skeleton className="h-full w-full" />
      </View>
      <View className="mb-4 h-24 w-[48%] overflow-hidden rounded-2xl bg-slate-100">
        <Skeleton className="h-full w-full" />
      </View>
      <View className="mb-4 h-20 w-full overflow-hidden rounded-2xl bg-slate-100">
        <Skeleton className="h-full w-full" />
      </View>
    </View>

    {/* Skeleton List */}
    <View className="mt-4">
      <Skeleton className="mb-4 h-6 w-40" />
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-3 flex-row items-center p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <View className="ml-4 flex-1 gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </View>
        </View>
      ))}
    </View>
  </View>
);

/**
 * 4. Component Header Dashboard
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  t,
  activeFilter,
  onFilterChange,
  tabs,
  data,
  isLoading = false,
}) => {
  return (
    <View>
      {/* Tab Filter */}
      <View className="mb-6 border-b border-slate-100 pt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}>
          {tabs.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => onFilterChange(filter)}
                className={`mr-6 pb-2 ${isActive ? 'border-b-2 border-primary-color-2' : ''}`}>
                <Text
                  className={`text-sm ${
                    isActive
                      ? 'font-inter-bold text-primary-color-2'
                      : 'font-inter-medium text-slate-400'
                  }`}>
                  {t(TimeFilterMap[filter])}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <View className="px-4">
          {/* Top Highlight Cards */}
          <View className="mb-4 flex-row gap-4">
            <StatCard
              variant="primary"
              title={t('agency.page.dashboard.stats.total_discount')}
              value={formatBalance(data?.total_profit_referral_ktv || 0)}
              unit={t('common.currency')}
            />
            <StatCard
              variant="primary"
              title={t('agency.page.dashboard.stats.total_affiliate')}
              value={formatBalance(data?.total_profit_affiliate || 0)}
              unit={t('common.currency')}
            />
          </View>

          {/* Statistics Grid */}
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              icon={Users}
              title={t('agency.page.dashboard.stats.referred_customers')}
              value={data?.total_referral_customer || 0}
            />
            <StatCard
              icon={ShoppingCart}
              title={t('agency.page.dashboard.stats.ordering_customers')}
              value={data?.total_customer_order_ktv || 0}
            />
            <StatCard
              fullWidth
              icon={Star}
              title={t('agency.page.dashboard.stats.active_ktv')}
              value={data?.total_customer_affiliate_order || 0}
            />
          </View>

          {/* Title cho List */}
          <Text className="mb-4 mt-4 font-inter-bold text-base text-base-color-1">
            {t('agency.page.dashboard.performance_title')}
          </Text>
        </View>
      )}
    </View>
  );
};
