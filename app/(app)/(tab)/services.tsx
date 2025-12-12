import React from 'react';
import { View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import {
   Sparkles, ChevronRight,
} from 'lucide-react-native';
import {HeaderApp} from '@/components/header-app';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar'; // Nhớ import đúng đường dẫn
import Empty from '@/components/empty';
import { useGetCategoryList } from '@/features/service/hooks';
import CategoryCard from '@/components/app/category-card';
import { Text } from '@/components/ui/text';

export default function ServicesScreen() {
  const {t} = useTranslation();

  const {
    data,
    pagination,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetCategoryList({
    filter: {},
    page: 1,
    per_page: 10,
  });


  return (
    <View className="flex-1 bg-base-color-3">
      <FocusAwareStatusBar/>

      {/* --- HEADER --- */}
      <HeaderApp />

      {/* --- CONTENT --- */}
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
              {t('services.total_services')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        renderItem={({ item }) => <CategoryCard item={item} key={item.id} />}
        ListEmptyComponent={<Empty />}
      />
    </View>
  );
}


const BannerPromotion = () => {
  return (
    <TouchableOpacity className="bg-orange-500 rounded-2xl p-4 flex-row justify-between items-center mb-4 shadow-sm">
      <View className="flex-1">
        <View className="flex-row items-center gap-1 mb-1">
          <Sparkles size={16} color="white" />
          <Text className="text-white font-bold text-base">Ưu đãi đặc biệt</Text>
        </View>
        <Text className="text-orange-100 text-xs">Giảm 20% cho khách hàng mới</Text>
        <Text className="text-orange-100 text-xs">Áp dụng đến 30/11</Text>
      </View>
      <View className="bg-white/20 p-2 rounded-full">
        <ChevronRight size={20} color="white" />
      </View>
    </TouchableOpacity>
  );
}
