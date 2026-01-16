import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/features/payment/hooks';
import Empty from '@/components/empty';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { CouponItem, HeaderWallet, TransactionItem, WithdrawModal } from '@/components/app/wallet';
import { _UserRole } from '@/features/auth/const';

export default function WalletScreen() {
  const { t } = useTranslation();
  const [visibleWithdraw, setVisibleWithdraw] = useState(false);
  const { toTabWallet } = useLocalSearchParams<{ toTabWallet?: string }>();

  const {
    tab,
    setTab,
    queryWallet,
    queryTransactionList,
    queryCouponUserList,
    goToDepositScreen,
    refresh,
  } = useWallet(_UserRole.CUSTOMER);

  useEffect(() => {
    if (toTabWallet) {
      setTab('coupon');
      router.setParams({ toTabWallet: undefined });
    }
  }, [toTabWallet]);
  console.log(queryTransactionList.data);
  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        <HeaderBack title="wallet.title" />

        {/* === LIST TRANSACTION === */}
        {tab === 'transaction' && (
          <FlatList
            keyExtractor={(item, index) => `transaction-${item.id}-${index}`}
            data={queryTransactionList.data || []}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            ListHeaderComponent={
              <HeaderWallet
                queryWallet={queryWallet}
                setTab={setTab}
                tab={tab}
                t={t}
                goToDepositScreen={goToDepositScreen}
                setVisibleWithdraw={setVisibleWithdraw}
              />
            }
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
            ListHeaderComponent={
              <HeaderWallet
                queryWallet={queryWallet}
                setTab={setTab}
                tab={tab}
                t={t}
                goToDepositScreen={goToDepositScreen}
                setVisibleWithdraw={setVisibleWithdraw}
              />
            }
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

      <WithdrawModal isVisible={visibleWithdraw} onClose={() => setVisibleWithdraw(false)} />
    </>
  );
}
