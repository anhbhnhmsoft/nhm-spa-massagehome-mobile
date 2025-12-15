import React from 'react';
import { View,  TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlusCircle, Map, MapPin, Trash2, Star } from 'lucide-react-native';
import HeaderBack from '@/components/header-back';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { useListLocation } from '@/features/location/hooks';
import {Text} from "@/components/ui/text";
import { cn } from '@/lib/utils';

export default function SaveLocationScreen() {
  const { t } = useTranslation();

  const { queryList, createHandler, editHandler, deleteHandler } = useListLocation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = queryList;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderBack title={"location.title"} />

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
        ListFooterComponent={() => {
          // 1. Nếu list rỗng -> Không hiện footer (để ListEmptyComponent lo)
          if (!data || data.length === 0) return null;
          return (
            <View className="mt-2 pb-10">
              {isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#0ea5e9" />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={createHandler}
                  className="flex-row items-center justify-center rounded-xl border border-dashed border-primary-color-2 bg-blue-50/50 py-4 active:bg-blue-100"
                >
                  <Icon as={PlusCircle} size={20} className="mr-2 text-primary-color-2" />
                  <Text className="font-medium text-primary-color-2">
                    {t('location.add_new_address')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        renderItem={({ item }) =>
          <TouchableOpacity
            key={`location-${item.id}`}
            // Bấm vào item để sửa
            onPress={() => editHandler(item)}
            className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50"
          >
            {/* ICON BÊN TRÁI */}
            <View className={cn('mr-4 h-10 w-10 items-center justify-center rounded-full', item.is_primary ? 'bg-orange-100' : 'bg-gray-100')}>
              <Icon
                as={item.is_primary ? Star : MapPin}
                size={20}
                // Nếu là primary thì tô màu cam, thường thì màu xám
                className={item.is_primary ? 'text-orange-500' : 'text-slate-500'}
                fill={item.is_primary ? 'currentColor' : 'none'} // Tô đặc ngôi sao nếu là primary
              />
            </View>

            {/* NỘI DUNG TEXT */}
            <View className="flex-1 pr-2">
              <View className="flex-row items-center gap-2">
                {/* Tên gợi nhớ (Ví dụ: Nhà riêng) */}
                <Text className="font-inter-bold text-slate-800 text-base" numberOfLines={1}>
                  {item.address.split(',')[0]}
                </Text>

                {/* Badge Mặc định */}
                {item.is_primary && (
                  <View className="rounded bg-orange-100 px-2 py-0.5">
                    <Text className="text-[10px] font-inter-bold text-orange-600">{t('location.primary')}</Text>
                  </View>
                )}
              </View>

              {/* Địa chỉ chi tiết */}
              <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                {item.desc ? `${item.desc} ` : t('location.no_desc')} - {item.address}
              </Text>
            </View>

            {/* NÚT XOÁ (Chặn sự kiện onPress của cha để không bị trigger edit) */}
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Quan trọng: Chặn nổi bọt sự kiện
                deleteHandler(item);
              }}
              className="p-2"
            >
              <Icon as={Trash2} size={20} className="text-red-400" />
            </TouchableOpacity>
          </TouchableOpacity>
      }
        ListEmptyComponent={<View className="flex-1 items-center justify-center px-8 pb-20">
          <View className="mb-6 items-center justify-center">
            <View className="relative h-40 w-40 items-center justify-center rounded-full bg-gray-100/50">
              {/* Icon Bản đồ mờ làm nền */}
              <Icon as={Map} size={150} color="#cbd5e1" strokeWidth={1}/>
              {/* Điểm ghim vị trí chính */}
              <View className="absolute top-[30%]">
                <View className="rounded-full bg-white p-1 shadow-sm">
                  <Icon as={MapPin} size={48} color="#64748b"  />
                </View>
              </View>
            </View>
          </View>

          {/* --- PHẦN VĂN BẢN --- */}
          <Text className="mb-2 text-center text-lg font-inter-bold text-slate-800">
            {t('location.common_address')}
          </Text>

          <Text className="mb-10 text-center text-base text-gray-500">{t('location.description')}</Text>

          {/* --- NÚT CHỨC NĂNG --- */}
          <TouchableOpacity
            onPress={createHandler}
            className="flex-row items-center rounded-full bg-base-color-3 px-6 py-3 active:bg-blue-100">
            {/* Sử dụng màu xanh dương nhạt tương tự trong ảnh (ví dụ: #0ea5e9 - cyan-500 hoặc text-blue-500) */}
            <Icon as={PlusCircle} size={20} className="mr-2 text-primary-color-2" />
            <Text className="text-base font-medium text-primary-color-2">{t('location.add_new_address')}</Text>
          </TouchableOpacity>
        </View>}
      />
    </SafeAreaView>
  );
}
