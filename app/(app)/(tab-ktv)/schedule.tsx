import BookingItemKtv from '@/components/app/ktv/booking-item-card';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import Empty from '@/components/empty';
import { getTabBarHeight } from '@/components/styles/style';
import { Text } from '@/components/ui/text';
import { BookingItem, ListBookingRequest } from '@/features/booking/types';
import { useSchedule } from '@/features/ktv/hooks/use-list';
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
import { t } from 'i18next';
import { useCallback } from 'react';
import { FlatList, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';

/* ================= HEADER FILTER ================= */

interface HeaderFilterProps {
  params: ListBookingRequest;
  setFilter: (filter: Partial<ListBookingRequest['filter']>) => void;
}

const HeaderFilter = ({ params, setFilter }: HeaderFilterProps) => {
  const currentStatus = params.filter?.status;

  return (
    <View className="mb-4 mt-4">
      <ScrollView
        horizontal
        className="bg-white py-2"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
        }}>
        {/* Tất cả */}
        <TouchableOpacity
          onPress={() => setFilter({ status: undefined })}
          className={cn(
            'flex-row items-center px-4 py-1.5',
            currentStatus === undefined && 'rounded-sm bg-primary-color-2'
          )}>
          <Text
            className={cn(
              'text-base',
              currentStatus === undefined
                ? 'font-inter-bold text-white'
                : 'font-inter-medium text-primary-color-3'
            )}>
            {t('common.all')}
          </Text>
        </TouchableOpacity>

        {/* Các trạng thái */}
        {Object.entries(_BookingStatusMap).map(([key, value]) => {
          const status = Number(key) as _BookingStatus;
          const checked = currentStatus === status;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter({ status })}
              className={cn(
                'flex-row items-center px-4 py-1.5',
                checked && 'rounded-sm bg-primary-color-2'
              )}>
              <Text
                className={cn(
                  'text-base',
                  checked ? 'font-inter-bold text-white' : 'font-inter-medium text-primary-color-3'
                )}>
                {t(value)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

/* ================= SCREEN ================= */

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
  } = useSchedule();
  const TAB_BAR_HEIGHT = getTabBarHeight();
  const handleGoDetails = useCallback((item: BookingItem) => {
    router.push({
      pathname: '/(app)/(service-ktv)/booking_details',
      params: { id: item.id },
    });
  }, []);

  return (
    <View className="flex-1 bg-base-color-3">
      <HeaderAppKTV />
      <View className="flex-1">
        <FlatList
          data={data}
          keyExtractor={(item) => `schedule-${item.id}`}
          renderItem={({ item }) => (
            <View className="px-4">
              <BookingItemKtv item={item} onPress={handleGoDetails} />
            </View>
          )}
          ListHeaderComponent={<HeaderFilter params={params} setFilter={setFilter} />}
          ListEmptyComponent={<Empty />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        />
      </View>
    </View>
  );
}
