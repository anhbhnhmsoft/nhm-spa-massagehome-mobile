import React, { useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar'; // Nhớ import đúng đường dẫn
import Empty from '@/components/empty';
import { useGetCategoryList } from '@/features/service/hooks';

import { Text } from '@/components/ui/text';
import useDebounce from '@/features/app/hooks/use-debounce';
import { getTabBarHeight } from '@/components/styles/style';
import { CategoryCard, CategorySkeletonCard, HeaderApp } from '@/components/app/customer';
import { useKTVSearchStore } from '@/features/user/stores';

export default function ServicesScreen() {
  const { t } = useTranslation();

  const [keyword, setKeyword] = useState('');

  const setFilterToKTV = useKTVSearchStore((state) => state.setFilter);

  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
    setFilter,
  } = useGetCategoryList({
    page: 1,
    per_page: 10,
  });

  const debouncedSearch = useDebounce((text: string) => {
    setFilter({ keyword: text });
  }, 500, []);

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <View className="flex-1 bg-slate-50">
      <FocusAwareStatusBar style={"dark"} />

      {/* --- HEADER --- */}
      <HeaderApp
        showSearch={true}
        forSearch={'service'}
        textSearch={keyword}
        setTextSearch={(text: string) => {
          // Cập nhật state UI ngay lập tức (để người dùng thấy chữ mình gõ)
          setKeyword(text);
          // Gọi hàm debounce để set filter sau 500ms (không gọi liên tục khi người dùng gõ)
          if (text && text.length > 2) {
            debouncedSearch(text);
          }
          if (text.trim().length === 0) {
            setFilter({ keyword: '' });
          }
        }}
      />

      {/* --- CONTENT --- */}
      <View className="px-4 pb-1 pt-2 flex-1">
        {isLoading || isRefetching ?
          Array.from({ length: 6 }).map((_, index) => (
            <CategorySkeletonCard key={`package-skeleton-${index}`} />
          )) : (
            <FlatList
              keyExtractor={(item, index) => `package-${item.id}-${index}`}
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
              ListHeaderComponent={
                <View className="mb-4 flex-row items-center gap-1">
                  <Text className="font-inter-bold text-blue-600">{pagination?.meta?.total || 0}</Text>
                  <Text className="font-inter-medium text-sm text-slate-500">
                    {t('services.total_services')}
                  </Text>
                </View>
              }
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
              renderItem={({ item }) => <CategoryCard setFilter={setFilterToKTV} item={item} key={item.id} t={t} />}
              ListEmptyComponent={<Empty />}
            />
          )}
      </View>
    </View>
  );
}

