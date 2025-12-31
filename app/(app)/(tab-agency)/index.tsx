import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { useHomeAgency } from '@/features/agency/hook';
import { Phone, Copy, ChevronRight, User } from 'lucide-react-native'; // Hoặc icon tùy chọn của bạn
import { DetailInfoKTV } from '@/features/ktv/types';
import { KTVDetail, ListKTVItem } from '@/features/user/types';
import ItemKtv from '@/components/app/agency/ktv-card';

export default function AgencyDashboard() {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } =
    useHomeAgency();

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <View className="flex-1 bg-base-color-3">
      {/* Header */}
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
          <View className="px-4 pb-3">
            <Text className="font-inter-semibold text-lg text-primary-color-1">
              {t('agency.technician_list_title')}
            </Text>
          </View>
        )}
        // Xử lý Pull to refresh
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#044984" />
        }
        // Xử lý Infinite Scroll
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        // Loading footer
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator color="#044984" />
            </View>
          ) : null
        }
        // Empty state
        ListEmptyComponent={() =>
          !isRefetching && (
            <View className="mt-20 flex-1 items-center justify-center">
              <Text className="font-inter-medium text-primary-color-3">
                {t('agency.technician_list_empty')}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
