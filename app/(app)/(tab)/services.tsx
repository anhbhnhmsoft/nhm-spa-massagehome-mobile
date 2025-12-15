import React, { useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { HeaderApp } from '@/components/header-app';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar'; // Nhớ import đúng đường dẫn
import Empty from '@/components/empty';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard, { CategorySkeletonCard } from '@/components/app/category-card';
import { Text } from '@/components/ui/text';
import useDebounce from '@/features/app/hooks/use-debounce';

export default function ServicesScreen() {
  const { t } = useTranslation();
  // 1. State lưu text hiển thị trên Header (để input không bị lag/giật)
  const [keyword, setKeyword] = useState('');
  // 2. Lấy danh sách category với hook
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

  return (
    <View className="flex-1 bg-base-color-3">
      <FocusAwareStatusBar />

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
      <View className="p-4 flex-1">
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
                paddingBottom: 100,
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
              renderItem={({ item }) => <CategoryCard item={item} key={item.id} />}
              ListEmptyComponent={<Empty />}
            />
          )}
      </View>
    </View>
  );
}

