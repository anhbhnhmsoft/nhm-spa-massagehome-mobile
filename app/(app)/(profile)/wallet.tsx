import { View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { ArrowUpRight, ArrowDownLeft, History, Ticket } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn, formatBalance, formatCurrency } from '@/lib/utils';
import GradientBackground from '@/components/styles/gradient-background';
import { useWallet } from '@/features/payment/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import {
  _TransactionInType,
  _TransactionOutType,
  _TransactionStatusColor,
  _TransactionStatusMap,
  _TransactionTypeMap,
} from '@/features/payment/consts';
import { ListTransactionItem } from '@/features/payment/types';
import dayjs from 'dayjs';
import Empty from '@/components/empty';
import { CouponUserItem } from '@/features/service/types';

export default function WalletScreen() {
  const {
    tab,
    setTab,
    queryWallet,
    queryTransactionList,
    queryCouponUserList,
    goToDepositScreen,
    refresh,
  } = useWallet();

  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="wallet.title" />

      {/* HEADER & Tab Switcher */}
      <View className="p-4">
        {/* HEADER & CARD */}
        <GradientBackground
          style={{
            padding: 20,
            borderRadius: 16,
          }}
          direction={'vertical'}>
          {/* BALANCE */}
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="mb-1 text-sm text-white">{t('wallet.balance')}</Text>
              <View className="flex-row items-end gap-1">
                {queryWallet.isLoading || queryWallet.isRefetching ? (
                  <Skeleton className="h-8 w-2/3" />
                ) : (
                  <Text className="font-inter-bold text-3xl text-white">
                    {formatBalance(queryWallet.data?.balance || 0)}
                  </Text>
                )}
                <Text className="font-inter-bold text-sm text-white">{t('common.currency')}</Text>
              </View>
            </View>
          </View>
          {/* TOTAL EARNINGS & WITHDRAWN */}
          <View className="mt-4 flex-row justify-between border-t border-white pt-4">
            <View className="flex-wrap items-start">
              {/* TOTAL EARNINGS */}
              <Text className="text-xs text-teal-100">{t('wallet.total_earnings')}</Text>
              {queryWallet.isLoading || queryWallet.isRefetching ? (
                <Skeleton className="h-8 w-2/3" />
              ) : (
                <Text className="mt-0.5 font-inter-bold text-sm text-white">
                  {formatBalance(queryWallet.data?.total_deposit || 0)} {t('common.currency')}
                </Text>
              )}
            </View>

            <View className={'flex-wrap items-end'}>
              <Text className="text-xs text-teal-100">{t('wallet.total_withdrawn')}</Text>
              {queryWallet.isLoading || queryWallet.isRefetching ? (
                <Skeleton className="h-8 w-2/3" />
              ) : (
                <Text className="mt-0.5 font-inter-bold text-sm text-white">
                  {formatBalance(queryWallet.data?.total_withdrawal || 0)} {t('common.currency')}
                </Text>
              )}
            </View>
          </View>
          {/* Nạp Tiền & Rút Tiền */}
          <View className="mt-4 flex-row items-center gap-2">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-white/30 px-4 py-2"
              onPress={() => goToDepositScreen()}
            >
              <Text className="text-center font-inter-bold text-white">{t('wallet.deposit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-xl bg-white/30 px-4 py-2">
              <Text className="text-center font-inter-bold text-white">{t('wallet.withdraw')}</Text>
            </TouchableOpacity>
          </View>
        </GradientBackground>

        {/* TAB SWITCHER */}
        <View className="mt-4 flex-row gap-2 p-2">
          <TouchableOpacity
            onPress={() => setTab('transaction')}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-2 rounded-xl p-2',
              tab === 'transaction' ? 'bg-primary-color-2' : 'bg-slate-200'
            )}>
            <Icon
              as={History}
              size={18}
              className={cn(tab === 'transaction' ? 'text-white' : 'text-slate-500')}
            />
            <Text
              className={cn(
                'font-inter-bold text-sm',
                tab === 'transaction' ? 'text-white' : 'text-slate-500'
              )}>
              {t('wallet.transactions')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab('coupon')}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-2 rounded-xl p-2',
              tab === 'coupon' ? 'bg-primary-color-2' : 'bg-slate-200'
            )}>
            <View className="flex-row items-center gap-2">
              <Icon
                as={Ticket}
                size={18}
                className={cn(tab === 'coupon' ? 'text-white' : 'text-slate-500')}
              />
              <Text
                className={cn(
                  'font-inter-bold text-sm',
                  tab === 'coupon' ? 'text-white' : 'text-slate-500'
                )}>
                {t('wallet.coupons')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. CONTENT LIST */}
      {/* === LIST TRANSACTION === */}
      {tab === 'transaction' && (
        <FlatList
          keyExtractor={(item, index) => `transaction-${item.id}-${index}`}
          data={queryTransactionList.data || []}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
            position: 'relative',
          }}
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={null}
          onEndReached={() => {
            if (queryTransactionList.hasNextPage && !queryTransactionList.isFetchingNextPage)
              queryTransactionList.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={queryTransactionList.isRefetching}
              onRefresh={() => refresh()}
            />
          }
          renderItem={({ item }) => <TransactionItem item={item} key={item.id} />}
          ListEmptyComponent={<Empty />}
        />
      )}

      {/* === LIST COUPON === */}
      {tab === 'coupon' && (
        <FlatList
          keyExtractor={(item, index) => `transaction-${item.id}-${index}`}
          data={queryCouponUserList.data || []}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
            position: 'relative',
          }}
          contentContainerStyle={{
            gap: 12,
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={null}
          onEndReached={() => {
            if (queryCouponUserList.hasNextPage && !queryCouponUserList.isFetchingNextPage)
              queryCouponUserList.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={queryCouponUserList.isRefetching}
              onRefresh={() => refresh()}
            />
          }
          renderItem={({ item }) => <CouponItem item={item} key={item.id} />}
          ListEmptyComponent={<Empty />}
        />
      )}
    </SafeAreaView>
  );
}

// 1. Transaction Item
const TransactionItem = ({ item }: { item: ListTransactionItem }) => {
  const { t } = useTranslation();

  return (
    <View className="shadow-xs flex-row items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      {/* Left: Icon & Title */}
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full',
            _TransactionInType.includes(item.type) && 'bg-green-200',
            _TransactionOutType.includes(item.type) && 'bg-red-200'
          )}>
          {_TransactionInType.includes(item.type) && (
            <Icon as={ArrowDownLeft} size={20} className="text-green-600" />
          )}
          {_TransactionOutType.includes(item.type) && (
            <Icon as={ArrowUpRight} size={20} className="text-red-600" />
          )}
        </View>
        <View className="flex-1 pr-2">
          <Text className="mb-1 font-inter-medium text-sm text-gray-900" numberOfLines={2}>
            {t(_TransactionTypeMap[item.type])}
          </Text>
          <Text className="font-inter-bold text-base text-gray-900">
            {formatBalance(item.point_amount)} {t('common.currency')}
          </Text>
        </View>
      </View>

      {/* Right: Status & Time */}
      <View className="items-end">
        <Text
          style={{ color: _TransactionStatusColor[item.status] }}
          className={'mb-1 text-sm font-inter-medium'}>
          {t(_TransactionStatusMap[item.status])}
        </Text>
        <Text className="text-[10px] text-gray-400">
          {dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      </View>
    </View>
  );
};

// 2. Coupon Item
const CouponItem = ({ item }: { item: CouponUserItem }) => {
  const { t } = useTranslation();

  const discountDisplay = item.coupon.is_percentage
    ? `${Number(item.coupon.discount_value)}%`
    : formatCurrency(item.coupon.discount_value);

  return (
    <View className="flex-row overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <View className="w-24 items-center justify-center border-r border-dashed border-white bg-primary-color-2 p-2">
        <Text className="font-inter-extrabold text-xl text-white">{discountDisplay}</Text>
        <Text className="mt-1 text-center text-xs text-teal-100">{t('common.discount')}</Text>
      </View>

      {/* Right Side: Info */}
      <View className="flex-1 justify-between p-3">
        <View>
          <Text className="font-inter-bold text-sm text-slate-700" numberOfLines={2}>
            {item.coupon.label}
          </Text>
        </View>
        <View className="mt-2 flex-row items-end justify-between">
          <Text className="rounded bg-blue-100 px-2 py-0.5 text-xs font-inter-medium text-primary-color-1">
            {item.coupon.code}
          </Text>
        </View>
      </View>
    </View>
  );
};
