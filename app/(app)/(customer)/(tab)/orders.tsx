import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';
import { useBookingList, useCancelBooking } from '@/features/booking/hooks';
import React, { useEffect } from 'react';
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { cn } from '@/lib/utils';
import {
  BookingCard,
  BookingDetailBottomSheet,
  CancelBookingBottomSheet,
  ReviewServiceBottomSheet,
} from '@/components/app/customer';
import Empty from '@/components/empty';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { HeaderApp } from '@/components/app/customer';
import { getTabBarHeight } from '@/components/styles/style';
import { useGetRoomChat } from '@/features/chat/hooks';
import { useReview } from '@/features/service/hooks';

export default function OrdersScreen() {
  const { t } = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    setFilter,
    params,
    detail,
    openDetail,
    closeDetail,
    refDetail,
  } = useBookingList();

  const {
    ref: refCancel,
    handleOpen: handleOpenCancel,
    handleSubmit,
    loading: loadingCancel,
  } = useCancelBooking(() => refetch());

  const {
    form,
    onSubmit,
    loading: loadingReview,
    handleOpen: handleOpenReview,
    handleClose: handleCloseReview,
    ref: refReview,
  } = useReview(() => refetch());


  const getRoomChat = useGetRoomChat();

  const bottomPadding = getTabBarHeight() + 20;

  const { status } = useLocalSearchParams<{ status?: string }>();

  useEffect(() => {
    if (status) {
      let statusEnum = Number(status) as _BookingStatus;
      setFilter({
        status: statusEnum,
      });
    } else {
      setFilter({});
    }
  }, [status]);

  return (
    <View className="flex-1 bg-slate-50">
      <FocusAwareStatusBar style={'dark'} />
      {/* Header App */}
      <HeaderApp
        showSearch={false}
      />
      {/* --- Filter Card --- */}
      <View className="my-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
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
                  'mr-2 flex-row items-center rounded-full px-4 py-1.5',
                  index === 0 && 'ml-4',
                  checked ? 'bg-primary-color-2' : 'bg-blue-100',
                )}>
                <Text
                  className={cn(
                    'text-sm',
                    checked ? 'text-white font-inter-bold ' : 'text-slate-600',
                  )}>
                  {t(value)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
            paddingBottom: bottomPadding,
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
              openDetail={openDetail}
              handleOpenCancelBooking={handleOpenCancel}
              getRoomChat={getRoomChat}
              handleOpenReview={handleOpenReview}
            />
          )}
          ListEmptyComponent={<Empty />}
        />
      </View>

      {/* Booking Detail */}
      <BookingDetailBottomSheet
        t={t}
        ref={refDetail}
        item={detail}
        onDismiss={closeDetail}
      />

      {/* cancel Modal */}
      <CancelBookingBottomSheet
        t={t}
        ref={refCancel}
        onDismiss={closeDetail}
        handleSubmit={handleSubmit}
        loading={loadingCancel}
      />

      {/* Review Modal */}
      <ReviewServiceBottomSheet
        t={t}
        ref={refReview}
        onSubmit={onSubmit}
        loading={loadingReview}
        handleClose={handleCloseReview}
        form={form}
      />
    </View>
  );
}