import { View,  FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import Empty from '@/components/empty';
import { useState } from 'react';
import { HeaderWallet, TransactionItem, WithdrawModal } from '@/components/app/wallet';
import { HeaderAppAgency } from '@/components/app/agency/header-app';
import { useWallet } from '@/features/payment/hooks';
import { _UserRole } from '@/features/auth/const';


export default function WalletScreen() {
  const { t } = useTranslation();
  const [visibleWithdraw, setVisibleWithdraw] = useState(false);

  const { queryWallet, queryTransactionList, goToDepositScreen, refresh } = useWallet(_UserRole.AGENCY);
  return (
    <>
      <View className="flex-1 bg-white">
        <HeaderAppAgency />

        <FlatList
          keyExtractor={(item, index) => `transaction-${item.id}-${index}`}
          data={queryTransactionList.data || []}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={
            <HeaderWallet
              queryWallet={queryWallet}
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
            paddingTop: 12,
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
      </View>

      <WithdrawModal isVisible={visibleWithdraw} onClose={() => setVisibleWithdraw(false)} />
    </>
  );
}
