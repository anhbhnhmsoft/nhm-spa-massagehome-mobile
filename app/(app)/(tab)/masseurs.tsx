import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import {HeaderApp} from '@/components/header-app';
import { useGetListKTV } from '@/features/user/hooks';
import Empty from '@/components/empty';
import { useTranslation } from 'react-i18next';
import { KTVServiceCard } from '@/components/app/ktv-card';


export default function MasseursScreen() {
  const {t} = useTranslation();

  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetListKTV({
    filter: {},
    page: 1,
    per_page: 5,
  });


  return (
    <View className="flex-1 bg-base-color-3">

      {/* --- HEADER --- */}
      <HeaderApp />

      {/* --- CONTENT --- */}
      <FlatList
        keyExtractor={(item, index) => `masseur-${item.id}-${index}`}
        data={data}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          flex: 1,
          position: 'relative',
        }}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 100,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={null}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListHeaderComponent={
          <View className="flex-row items-center gap-1 mb-4">
            <Text className="text-blue-600 font-inter-bold">{pagination?.meta?.total || 0}</Text>
            <Text className="text-slate-500 text-sm font-inter-medium">
              {t('services.total_masseurs')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        renderItem={({ item }) => <KTVServiceCard item={item} key={item.id} />}
        ListEmptyComponent={<Empty />}
      />
    </View>
  );
}


