import { X } from 'lucide-react-native';

import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import GradientBackground from '@/components/styles/gradient-background';
import React, { useEffect } from 'react';
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { router, useLocalSearchParams } from 'expo-router';
import { useGetBookingList } from '@/features/booking/hooks';
import { cn, goBack } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import Empty from '@/components/empty';
import { BookingCard } from '@/components/app/booking';
import { CancellationModal } from '@/components/app/cancel-booking-modal';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { status } = useLocalSearchParams<{ status?: string }>();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    setFilter,
    params,
    showModalCancelBooking,
    setShowModalCancelBooking,
    handleOpenModalCancelBooking,
    handleCancelBooking,
    isCancelBookingPending,
  } = useGetBookingList();

  useEffect(() => {
    if (status) {
      let statusEnum = Number(status) as _BookingStatus;
      setFilter({
        status: statusEnum,
      });
    }
  }, [status]);

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER --- */}
      <GradientBackground
        style={{
          paddingTop: insets.top + 10,
          paddingBottom: 24,
          zIndex: 10,
        }}>
        <View className="mb-4 mt-2 flex-row items-center justify-between px-4">
          {/* Title & Description */}
          <View className="gap-2">
            <Text className="font-inter-bold text-xl text-white">
              {t('header_app.title_orders')}
            </Text>
            <Text className="font-inter-medium text-xs text-blue-100">
              {t('header_app.orders_description')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => goBack()} className="rounded-full bg-white/80 p-2">
            {/* Icon Back ở đây nếu cần */}
            <Icon as={X} size={20} className="text-primary-color-2" />
          </TouchableOpacity>
        </View>

        {/* --- FILTER BAR --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(_BookingStatusMap).map(([key, value], index) => {
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
                  'mr-2 flex-row items-center rounded-full border px-4 py-1.5',
                  index === 0 && 'ml-4',
                  checked ? 'border-white bg-white' : 'border-blue-400/30 bg-blue-800/30'
                )}>
                <Text
                  className={cn(
                    'font-inter-medium text-xs',
                    checked ? 'text-blue-700' : 'text-blue-100'
                  )}>
                  {t(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </GradientBackground>

      {/* --- BODY --- */}
      <View className="mt-4 flex-1 px-4">
        {/* List */}
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
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              key={item.id}
              onRefresh={() => refetch()}
              cancelBooking={handleOpenModalCancelBooking}
            />
          )}
          ListEmptyComponent={<Empty />}
        />
      </View>
      {/* cancel Modal */}
      <CancellationModal
        isVisible={showModalCancelBooking}
        onClose={() => setShowModalCancelBooking(false)}
        onConfirm={handleCancelBooking}
        isLoading={isCancelBookingPending}
      />
    </View>
  );
}
