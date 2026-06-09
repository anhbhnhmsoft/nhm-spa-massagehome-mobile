import BookingItemKtv from '@/components/app/ktv/booking-item-card';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import Empty from '@/components/empty';
import { getTabBarHeight } from '@/components/styles/style';
import { Text } from '@/components/ui/text';
import { BookingItem, ListBookingRequest } from '@/features/booking/types';
import { useSchedule } from '@/features/ktv/hooks';
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { cn } from '@/lib/utils';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { useGetRoomChat } from '@/features/chat/hooks';
import { useInfiniteApplicationBookingList } from '@/features/ktv/hooks/use-query';


interface HeaderFilterProps {
  params: ListBookingRequest;
  setFilter: (filter: Partial<ListBookingRequest['filter']>) => void;
}

const HeaderFilter = ({ params, setFilter }: HeaderFilterProps) => {
  const currentStatus = params.filter?.status;

  return (
    <View className="mb-4 mt-4 px-4">
      <ScrollView
        horizontal
        className="bg-white py-2 rounded-lg shadow-lg border border-slate-100"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
        }}>
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
  const { mode: routeMode, bookingId } = useLocalSearchParams<{ mode?: 'bookings' | 'applications'; bookingId?: string }>();
  const [mode, setMode] = useState<'bookings' | 'applications'>('bookings');
  const isFocused = useIsFocused();
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
  const applicationParams = useMemo<ListBookingRequest>(() => ({
    filter: {
      status: _BookingStatus.OPEN_FOR_APPLICATION,
    },
    page: 1,
    per_page: 10,
  }), []);
  const applicationQuery = useInfiniteApplicationBookingList(applicationParams);
  const applicationData = useMemo<BookingItem[]>(() => {
    return applicationQuery.data?.pages.flatMap((page) => page.data.data) || [];
  }, [applicationQuery.data]);
  const listData = mode === 'applications' ? applicationData : data;
  const handledRouteBookingRef = useRef<string | null>(null);
  const wasFocusedRef = useRef(false);

  const TAB_BAR_HEIGHT = getTabBarHeight();

  const handleGoDetails = useCallback((item: BookingItem) => {
    router.push({
      pathname: '/(app)/(ktv)/(service)/booking-details',
      params: {
        id: item.id,
        mode: item.status === _BookingStatus.OPEN_FOR_APPLICATION ? 'application' : 'booking',
      },
    });
  }, []);

  const calculateDistance = useCalculateDistance();

  const joinRoomChat = useGetRoomChat();

  useEffect(() => {
    if (routeMode === 'applications') {
      setMode('applications');
    }
  }, [routeMode]);

  useEffect(() => {
    if (!isFocused) {
      wasFocusedRef.current = false;
      return;
    }
    if (wasFocusedRef.current) return;

    wasFocusedRef.current = true;
    refetch();
    applicationQuery.refetch();
  }, [applicationQuery.refetch, isFocused, refetch]);

  useEffect(() => {
    if (!bookingId || mode !== 'applications' || applicationQuery.isLoading) return;
    if (handledRouteBookingRef.current === bookingId) return;

    const targetBooking =
      applicationData.find((item) => item.id === bookingId) ||
      data.find((item) => item.id === bookingId);
    if (!targetBooking) return;

    handledRouteBookingRef.current = bookingId;

    handleGoDetails(targetBooking);
  }, [applicationData, applicationQuery.isLoading, bookingId, data, handleGoDetails, mode]);

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderAppKTV />
      <View className="flex-1">
        <View className="mx-4 mt-4 flex-row rounded-lg border border-slate-100 bg-white p-1">
          <TouchableOpacity
            onPress={() => setMode('bookings')}
            className={cn(
              'flex-1 items-center rounded-md py-2',
              mode === 'bookings' ? 'bg-primary-color-2' : 'bg-white'
            )}
          >
            <Text className={cn(mode === 'bookings' ? 'text-white font-inter-bold' : 'text-slate-600')}>
              {t('ktv.index.upcoming')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('applications')}
            className={cn(
              'flex-1 items-center rounded-md py-2',
              mode === 'applications' ? 'bg-primary-color-2' : 'bg-white'
            )}
          >
            <Text className={cn(mode === 'applications' ? 'text-white font-inter-bold' : 'text-slate-600')}>
              {t('ktv.index.application_bookings')}
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={listData}
          keyExtractor={(item) => `${mode}-${item.id}`}
          renderItem={({ item }) => (
            <View className="px-4" key={item.id}>
              <BookingItemKtv
                item={item}
                onPress={handleGoDetails}
                calculateDistance={calculateDistance}
                joinRoomChat={joinRoomChat}
              />
            </View>
          )}
          ListHeaderComponent={mode === 'bookings' ? <HeaderFilter params={params} setFilter={setFilter} /> : <View className="h-4" />}
          ListEmptyComponent={<Empty />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (mode === 'applications') {
              if (applicationQuery.hasNextPage && !applicationQuery.isFetchingNextPage) {
                applicationQuery.fetchNextPage();
              }
            } else {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={mode === 'applications' ? applicationQuery.isRefetching : isRefetching}
              onRefresh={() => (mode === 'applications' ? applicationQuery.refetch() : refetch())}
            />
          }
        />
      </View>
    </View>
  );
}
