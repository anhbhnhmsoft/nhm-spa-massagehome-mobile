import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { getTabBarHeight } from '@/components/styles/style';
import { useTranslation } from 'react-i18next';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { router } from 'expo-router';
import { useListServices } from '@/features/ktv/hooks/use-list';
import { KTVServiceCardSkeleton } from '@/components/app/ktv-card';
import { ServiceCard } from '@/components/app/ktv/service';
import { useSetService } from '@/features/ktv/hooks';


// --- Main Screen ---
export default function ServiceListScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
  } = useListServices();

  const { t } = useTranslation();

  const { editService, deleteService, detailService } = useSetService();

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <View className="flex-1 bg-base-color-3">
      {/* Header */}
      <HeaderAppKTV />

      {/* List Content */}
      <View className="flex-1 p-4">
        {isLoading || isRefetching ? (
          Array.from({ length: 6 }).map((_, index) => (
            <KTVServiceCardSkeleton key={`service-skeleton-${index}`} />
          ))
        ) : (
          <FlatList
            keyExtractor={(item, index) => `service-${item.id}-${index}`}
            data={data}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            style={{
              flex: 1,
              position: 'relative',
            }}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: bottomPadding,
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={null}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListHeaderComponent={() => (
              <View className="mb-4">
                <TouchableOpacity
                  onPress={useSingleTouch(() => {
                    router.push('/(app)/(service-ktv)/form');
                  })}
                  className={
                    'w-full flex-row items-center justify-center rounded-xl bg-primary-color-2 py-2'
                  }>
                  <Text className="font-inter-bold text-base text-white">
                    {t('ktv.services.add_new_service')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            renderItem={({ item }) => (
              <ServiceCard item={item} onEdit={editService} onDelete={deleteService} onDetail={detailService} />
            )}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
            ListEmptyComponent={() => (
              <View className="flex items-center justify-center gap-4">
                <Text className="font-inter-medium text-base text-gray-400">
                  {t('ktv.services.no_service')}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
