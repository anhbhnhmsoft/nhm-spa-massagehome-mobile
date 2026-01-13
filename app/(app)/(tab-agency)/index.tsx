import React, { useState } from 'react'; // 1. Thêm useState
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import ItemKtv from '@/components/app/agency/ktv-card';
import {
  AgencyEmptyState,
  AgencyListHeader,
  InviteKTVModal,
} from '@/components/app/agency/agency-card';
import useAuthStore from '@/features/auth/store';
import { HeaderAppAgency } from '@/components/app/agency/header-app';
import { useGetListKTVManager } from '@/features/user/hooks';

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false); // Quản lý modal
  const user = useAuthStore((state) => state.user);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    pagination,
  } = useGetListKTVManager();


  const bottomPadding = getTabBarHeight() + 20;
  return (
    <View className="flex-1 bg-white">
      <HeaderAppAgency />

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
          <AgencyListHeader
            onInvitePress={() => setModalVisible(true)}
            totalKtv={pagination?.meta?.total || 0}
          />
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
        userId={user?.id || ''}
      />
    </View>
  );
}
