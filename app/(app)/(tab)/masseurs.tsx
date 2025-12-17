import React, { useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import {HeaderApp} from '@/components/header-app';
import { useGetListKTV } from '@/features/user/hooks';
import Empty from '@/components/empty';
import { useTranslation } from 'react-i18next';
import {  KTVServiceCard, KTVServiceCardSkeleton } from '@/components/app/ktv-card';
import useDebounce from '@/features/app/hooks/use-debounce';
import { Icon } from '@/components/ui/icon';
import { X } from 'lucide-react-native';


export default function MasseursScreen() {
  const {t} = useTranslation();
  // 1. State lưu text hiển thị trên Header (để input không bị lag/giật)
  const [keyword, setKeyword] = useState('');
  // 2. Lấy danh sách masseur với hook
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
    params
  } = useGetListKTV();

  const debouncedSearch = useDebounce((text: string) => {
    setFilter({ keyword: text });
  }, 500, []);

  return (
    <View className="flex-1 bg-base-color-3">

      {/* --- HEADER --- */}
      <HeaderApp
        showSearch={true}
        forSearch={"massage"}
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
        {isLoading || isRefetching ? (
          Array.from({ length: 6 }).map((_, index) => (
            <KTVServiceCardSkeleton key={`masseur-skeleton-${index}`} />
          ))
        ) : (
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
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={null}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            ListHeaderComponent={
              <View className="flex-row justify-between items-center gap-1 mb-4">
                <View className="items-center flex-row gap-1">
                  <Text className="text-blue-600 font-inter-bold">{pagination?.meta?.total || 0}</Text>
                  <Text className="text-slate-500 text-sm font-inter-medium">
                    {t('services.total_masseurs')}
                  </Text>
                </View>
                {params?.filter?.category_id && params?.filter?.category_name &&
                  (
                    <TouchableOpacity
                      className="p-2 rounded-xl items-center flex-row gap-2 bg-blue-200"
                      onPress={() => setFilter({ category_id: undefined, category_name: undefined })}
                    >
                      <Text className={'font-inter-bold text-xs text-blue-600'}>
                        {params.filter.category_name}
                      </Text>
                      <Icon as={X} size={10} className={"text-blue-600"} />
                    </TouchableOpacity>
                  )
                }
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
            renderItem={({ item }) => <KTVServiceCard item={item} key={item.id} />}
            ListEmptyComponent={<Empty />}
          />
        )}
      </View>
    </View>
  );
}


