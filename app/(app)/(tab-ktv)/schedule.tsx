import BookingItemKtv from '@/components/app/ktv/BookingItemCard';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import Empty from '@/components/empty';
import { Text } from '@/components/ui/text';
import { BookingItem } from '@/features/booking/types';
import { useListSchedules } from '@/features/ktv/hooks/use-list';
import { _BookingStatusMap } from '@/features/service/const';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
import { t } from 'i18next';
import { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ScheduleScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    setFilter,
    params,
  } = useListSchedules();

  const handleGoDetails = useCallback((item: BookingItem) => {
    router.push({
      pathname: '/(app)/(service-ktv)/booking_details',
      params: {
        id: item.id,
      },
    });
  }, []);
  return (
    <View className="flex-1 bg-base-color-3">
      <HeaderAppKTV />
      <View className="mt-16 flex-1 rounded-tl-2xl rounded-tr-2xl bg-white">
        <View className="mx-4 mt-4">
          <ScrollView
            horizontal
            className="rounded-sm bg-slate-200 p-1"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 10,
              gap: 8,
            }}>
            <TouchableOpacity
              onPress={() =>
                setFilter({
                  status: undefined,
                })
              }
              className={cn(
                'flex-row items-center',
                params.filter.status === undefined
                  ? 'rounded-sm bg-primary-color-2 px-4 py-1.5'
                  : ''
              )}>
              <Text
                className={cn(
                  'text-xs',
                  params.filter.status === undefined
                    ? 'font-inter-bold text-white'
                    : 'font-inter-medium text-primary-color-3'
                )}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {Object.entries(_BookingStatusMap).map(([key, value]) => {
              const checked = params?.filter?.status === Number(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    setFilter({
                      status: Number(key),
                    })
                  }
                  className={cn(
                    'flex-row items-center',
                    checked ? 'rounded-sm bg-primary-color-2 px-4 py-1.5' : ''
                  )}>
                  <Text
                    className={cn(
                      'text-xs',
                      checked
                        ? 'font-inter-bold text-white'
                        : 'font-inter-medium text-primary-color-3'
                    )}>
                    {t(value)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View className="mt-4 flex-1 px-4">
          <FlatList
            keyExtractor={(item, index) => `schedule-${item.id}-${index}`}
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
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
            }
            renderItem={({ item }) => (
              <BookingItemKtv item={item} key={item.id} onPress={handleGoDetails} />
            )}
            ListEmptyComponent={<Empty />}
          />
        </View>
      </View>
    </View>
  );
}
