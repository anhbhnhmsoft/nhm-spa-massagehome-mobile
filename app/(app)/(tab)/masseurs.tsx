import React, { useEffect, useState } from 'react';
import { View,  FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import {HeaderApp} from '@/components/header-app';
import { useGetListKTV } from '@/features/user/hooks';
import Empty from '@/components/empty';
import { useTranslation } from 'react-i18next';
import {  KTVServiceCard, KTVServiceCardSkeleton } from '@/components/app/ktv-card';
import useDebounce from '@/features/app/hooks/use-debounce';
import { Icon } from '@/components/ui/icon';
import { X } from 'lucide-react-native';
import { getTabBarHeight } from '@/components/styles/style';
import {Text} from "@/components/ui/text"
import useApplicationStore from '@/lib/store';
export default function MasseursScreen() {
  const {t} = useTranslation();
  // State lưu text hiển thị trên Header (để input không bị lag/giật)
  const [keyword, setKeyword] = useState('');

  const locationUser = useApplicationStore((state) => state.location);

  const bottomPadding = getTabBarHeight() + 20;
  // Lấy danh sách masseur với hook
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

  useEffect(() => {
    if (locationUser) {
      setFilter(
        {
          lat: locationUser.location.coords.latitude,
          lng: locationUser.location.coords.longitude,
        }
      )
    }
  }, [locationUser]);

  const debouncedSearch = useDebounce((text: string) => {
    setFilter({ keyword: text });
  }, 500, []);

  return (
    <View className="flex-1 bg-base-color-3">
      <HeaderApp
        showSearch={true}
        forSearch={"massage"}
        textSearch={keyword}
        setTextSearch={(text: string) => {
          setKeyword(text);
          if (text && text.length > 2) {
            debouncedSearch(text);
          }
          if (text.trim().length === 0) {
            setFilter({ keyword: '' });
          }
        }}
      />

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
              paddingBottom: bottomPadding,
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
                {(params?.filter?.category_id && params?.filter?.category_name) &&
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


