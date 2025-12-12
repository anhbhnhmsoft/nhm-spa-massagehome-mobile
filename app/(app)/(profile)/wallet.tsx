import React from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownCircle, ArrowUpCircle, Wallet, X } from 'lucide-react-native';
import GradientBackground from '@/components/styles/gradient-background';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/features/payment/hooks';
import { formatBalance } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ListTransactionItem } from '@/features/payment/types';
import { _TransactionStatus, _TransactionStatusMap, _TransactionTypeMap } from '@/features/payment/consts';
import dayjs from 'dayjs';

const TransactionItem = ({ item }: { item: ListTransactionItem }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between border-b border-gray-50 py-4">
      {/* Left: Icon & Title */}
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9]">
          <Wallet size={20} color="#4A7c59" />
        </View>
        <View className="flex-1 pr-2">
          <Text className="mb-1 font-inter-medium text-[15px] text-gray-900" numberOfLines={2}>
            {t(_TransactionTypeMap[item.type])}
          </Text>
          <Text className="font-inter-bold text-base text-gray-900">
            {formatBalance(item.money_amount)}
          </Text>
        </View>
      </View>

      {/* Right: Status & Time */}
      <View className="items-end">
        <Text
          className={`mb-1 text-sm font-medium ${item.status === _TransactionStatus.FAILED ? 'text-red-500' : 'text-green-600'}`}>
          {t(_TransactionStatusMap[item.status])}
        </Text>
        <Text className="text-xs text-gray-400">{dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
      </View>
    </View>
  );
};

export default function WalletScreen() {
  const { t } = useTranslation();
  const { queryWallet, goToDepositScreen, queryTransactionList } = useWallet();
  const inset = useSafeAreaInsets();

  return (
    // Dùng bg màu xanh nhạt cho toàn màn hình để phần tai thỏ (notch) cũng đồng màu
    <View className="flex-1 bg-base-color-3">
      <SafeAreaView className="flex-1">
        {/* Header Background Màu Xanh */}
        <GradientBackground
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 0,
            height: 192,
            width: '100%',
          }}
          direction="horizontal"
        />

        {/* Padding Top để tránh bị che bởi Header */}
        <View style={{ paddingTop: inset.top }} />
        {/* --- HEADER SECTION --- */}
        <View className="relative mx-5 mb-6 rounded-2xl bg-white p-4 shadow-sm">
          {/* Back Button */}
          <TouchableOpacity
            className={`absolute right-5 top-5 z-10 rounded-full bg-slate-500/20 p-1.5`}
            onPress={() => router.back()}>
            <X size={20} color="#45556C" />
          </TouchableOpacity>
          {/* Balance Info */}
          <View className="mt-4">
            <Text className="mb-1 font-inter-medium text-base text-gray-600">
              {t('wallet.balance')}
            </Text>
            <View className="flex-row items-end gap-1">
              {queryWallet.isLoading || queryWallet.isRefetching ? (
                <Skeleton className="h-8 w-2/3" />
              ) : (
                <>
                  <Text className="font-inter-bold text-4xl text-gray-900">
                    {formatBalance(queryWallet.data?.balance || '0')}
                  </Text>
                  <Text className="font-inter-bold text-lg text-gray-900">
                    {t('common.currency')}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Action Buttons (Nạp/Rút) */}
          <View className="mt-6 flex-row gap-4">
            {/* Button Nạp tiền */}
            <TouchableOpacity
              onPress={goToDepositScreen}
              className="flex-1 flex-row items-center justify-center rounded-full bg-primary-color-2 py-3.5 shadow-sm">
              <ArrowDownCircle size={20} color="white" />
              <Text className="ml-2 font-inter-bold text-base text-white">
                {t('wallet.deposit')}
              </Text>
            </TouchableOpacity>

            {/* Button Rút tiền */}
            <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-full border border-primary-color-2 bg-white py-3.5 shadow-sm">
              <ArrowUpCircle size={20} color="#2B7BBE" />
              <Text className="ml-2 font-inter-bold text-base text-primary-color-2">
                {t('wallet.withdraw')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- BODY SECTION (White Background) --- */}
        <View className="mx-5 flex-1 overflow-hidden rounded-2xl bg-white px-5 pt-6 shadow-sm">
          {/* Section Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">{t('wallet.transactions')}</Text>
          </View>
          <FlatList
            keyExtractor={(item, index) => `transaction-${item.id}-${index}`}
            data={queryTransactionList.data}
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
            onEndReached={() => {
              if (queryTransactionList.hasNextPage && !queryTransactionList.isFetchingNextPage)
                queryTransactionList.fetchNextPage();
            }}
            refreshControl={
              <RefreshControl
                refreshing={queryTransactionList.isRefetching}
                onRefresh={() => queryTransactionList.refetch()}
              />
            }
            renderItem={({ item }) => <TransactionItem key={item.id} item={item} />}
            ListEmptyComponent={
              <View className="items-center py-10">
                <Text className="text-gray-400">{t('wallet.no_transactions')}</Text>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
