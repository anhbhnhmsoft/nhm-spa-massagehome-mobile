import React, { useState } from 'react'; // 1. Thêm useState
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { getTabBarHeight } from '@/components/styles/style';
import { useHomeAgency } from '@/features/agency/hook';
import ItemKtv from '@/components/app/agency/ktv-card';
import {
  AgencyEmptyState,
  AgencyListHeader,
  InviteKTVModal,
} from '@/components/app/agency/agency-card';
import useAuthStore from '@/features/auth/store';
import HeaderBack from '@/components/header-back';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManagedTechnicians() {
  const [modalVisible, setModalVisible] = useState(false); // Quản lý modal
  const user = useAuthStore((state) => state.user);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, totalKtv } =
    useHomeAgency();

  const bottomPadding = getTabBarHeight() + 20;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderBack />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ItemKtv item={item} />}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <AgencyListHeader onInvitePress={() => setModalVisible(true)} totalKtv={totalKtv} />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#044984" />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color="#044984" />
            </View>
          ) : null
        }
        ListEmptyComponent={() =>
          !isRefetching && <AgencyEmptyState onInvitePress={() => setModalVisible(true)} />
        }
      />

      <InviteKTVModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        inviteLink={`nhmspa://agency/link?id=${user?.id}`}
        userId={user?.id || ''}
      />
    </SafeAreaView>
  );
}
