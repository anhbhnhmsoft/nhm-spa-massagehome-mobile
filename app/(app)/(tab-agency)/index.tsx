import React, { useState } from 'react'; // 1. Thêm useState
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal, // Thêm Modal
  Pressable,
} from 'react-native';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { useHomeAgency } from '@/features/agency/hook';
import { UserPlus, X } from 'lucide-react-native';
import ItemKtv from '@/components/app/agency/ktv-card';
import {
  AgencyEmptyState,
  AgencyListHeader,
  InviteKTVModal,
} from '@/components/app/agency/agency-card';
import useAuthStore from '@/features/auth/store';

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false); // Quản lý modal
  const user = useAuthStore((state) => state.user);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching, totalKtv } =
    useHomeAgency();

  const bottomPadding = getTabBarHeight() + 20;
  return (
    <View className="flex-1 bg-white">
      <HeaderAppKTV />

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
            totalKtv={totalKtv}
            busyKtv={0}
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
        inviteLink={`nhmspa://agency/link?id=${user?.id}`}
      />
    </View>
  );
}
