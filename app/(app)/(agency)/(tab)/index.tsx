import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import ItemKtv from '@/components/app/agency/ktv-card';
import {
  AgencyEmptyState,
  AgencyListHeader,
  InviteKTVModal,
} from '@/components/app/agency/agency-card';
import { useAuthStore } from '@/features/auth/stores';
import { HeaderAppAgency } from '@/components/app/agency/header-app';
import { useGetListKTVManager } from '@/features/user/hooks';
import { _Gender, _UserRole } from '@/features/auth/const';
import { _LanguageCode } from '@/lib/const';

export default function AgencyDashboard() {
  const [modalVisible, setModalVisible] = useState(false);
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

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderAppAgency />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ItemKtv item={item} />}
        contentContainerStyle={{
          paddingBottom: 100,
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
