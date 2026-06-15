import BookingItemKtv from '@/components/app/ktv/booking-item-card';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import Empty from '@/components/empty';
import { getTabBarHeight } from '@/components/styles/style';
import { Text } from '@/components/ui/text';
import { BookingItem, ListBookingRequest } from '@/features/booking/types';
import { useSchedule } from '@/features/ktv/hooks';
import { BOOKING_STATUS_FILTER_OPTIONS, _BookingStatus } from '@/features/service/const';
import { cn, getMessageError } from '@/lib/utils';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { useGetRoomChat } from '@/features/chat/hooks';
import SelectModal, { SelectOption } from '@/components/select-modal';
import { SlidersHorizontal } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useApplyApplicationBookingMutation } from '@/features/ktv/hooks/use-mutation';
import { queryClient } from '@/lib/provider/query-provider';
import useToast from '@/features/app/hooks/use-toast';


/* ================= SCREEN ================= */

export default function ScheduleScreen() {
  const { mode: routeMode, bookingId } = useLocalSearchParams<{ mode?: 'bookings' | 'applications'; bookingId?: string }>();
  const [isFilterVisible, setFilterVisible] = useState(false);
  const isFocused = useIsFocused();
  const { error } = useToast();
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
  const { mutate: applyBooking, isPending: isApplyBookingPending } = useApplyApplicationBookingMutation();

  const handleApplyNow = useCallback((item: BookingItem) => {
    applyBooking(item.id, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
        await queryClient.invalidateQueries({ queryKey: ['ktvApi-dashboard'] });
        await refetch();
      },
      onError: (err) => {
        error({ message: getMessageError(err, t) || t('common_error.request_error') });
      },
    });
  }, [applyBooking, error, refetch]);

  useEffect(() => {
    if (routeMode === 'applications') {
      setFilter({ status: _BookingStatus.OPEN_FOR_APPLICATION });
    }
  }, [routeMode, setFilter]);

  useEffect(() => {
    if (!isFocused) {
      wasFocusedRef.current = false;
      return;
    }
    if (wasFocusedRef.current) return;

    wasFocusedRef.current = true;
    refetch();
  }, [isFocused, refetch]);

  useEffect(() => {
    if (!bookingId) return;
    if (handledRouteBookingRef.current === bookingId) return;

    const targetBooking = data.find((item) => item.id === bookingId);
    if (!targetBooking) return;

    handledRouteBookingRef.current = bookingId;

    handleGoDetails(targetBooking);
  }, [bookingId, data, handleGoDetails]);

  const filterOptions: SelectOption[] = BOOKING_STATUS_FILTER_OPTIONS.map(([key, value]) => ({
    value: Number(key),
    label: t(value),
  }));

  const selectedFilterLabel = filterOptions.find((item) => item.value === params.filter?.status)?.label || t('common.all');

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderAppKTV />
      <View className="flex-1">
        <View className="px-4 pt-3">
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5"
          >
            <View className="flex-row items-center">
              <Icon as={SlidersHorizontal} size={18} className="text-slate-500" />
              <Text className="ml-2 text-[13px] font-inter-medium text-slate-500">{t('common.filter')}</Text>
            </View>
            <Text className="text-[13px] font-inter-bold text-slate-800">{selectedFilterLabel}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4" key={item.id}>
              <BookingItemKtv
                item={item}
                onPress={handleGoDetails}
                calculateDistance={calculateDistance}
                joinRoomChat={joinRoomChat}
                onApplyNow={item.status === _BookingStatus.OPEN_FOR_APPLICATION ? handleApplyNow : undefined}
                applying={isApplyBookingPending}
              />
            </View>
          )}
          ListHeaderComponent={<View className="h-2.5" />}
          ListEmptyComponent={<Empty />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingBottom: TAB_BAR_HEIGHT + 20,
          }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
            />
          }
        />
        <SelectModal
          isVisible={isFilterVisible}
          onClose={() => setFilterVisible(false)}
          data={filterOptions}
          value={params.filter?.status}
          onSelect={(item) => {
            setFilter({
              status: Number(item.value),
            });
          }}
        />
      </View>
    </View>
  );
}
