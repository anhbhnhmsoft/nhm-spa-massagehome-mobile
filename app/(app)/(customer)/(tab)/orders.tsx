import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { useBookingList, useCancelBooking } from '@/features/booking/hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { BOOKING_STATUS_FILTER_OPTIONS, _BookingStatus } from '@/features/service/const';
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
import { ApplicationTechnicianModal } from '@/components/app/customer/application-technician-modal';
import { BookingApplicationItem, BookingApplicationPreviewResponse, BookingItem } from '@/features/booking/types';
import { useBookingApplicationsQuery } from '@/features/booking/hooks/use-query';
import { useSelectBookingApplicationMutation } from '@/features/booking/hooks/use-mutation';
import bookingApi from '@/features/booking/api';
import { getMessageError } from '@/lib/utils';
import useToast from '@/features/app/hooks/use-toast';
import { queryClient } from '@/lib/provider/query-provider';
import { useBookingStore } from '@/features/booking/stores';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const { error } = useToast();
  const setBookingId = useBookingStore((state) => state.setBookingId);
  const setApplicationSelection = useBookingStore((state) => state.setApplicationSelection);
  const setApplicationSelectionSource = useBookingStore((state) => state.setApplicationSelectionSource);

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
  const [applicationBooking, setApplicationBooking] = useState<BookingItem | null>(null);
  const [applicationPreview, setApplicationPreview] = useState<BookingApplicationPreviewResponse['data'] | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<BookingApplicationItem | null>(null);

  const applicationsQuery = useBookingApplicationsQuery(applicationBooking?.id);
  const selectApplicationMutation = useSelectBookingApplicationMutation();

  const handlePressBookingCard = useCallback((item: BookingItem) => {
    if (item.status === _BookingStatus.OPEN_FOR_APPLICATION) {
      setBookingId(item.id);
      router.push('/(app)/(customer)/(service)/service-booking-result');
      return;
    }

    openDetail(item);
  }, [openDetail, setBookingId]);

  const handleOpenApplications = useCallback((item: BookingItem) => {
    setApplicationBooking(item);
  }, []);

  const handleCloseApplications = useCallback(() => {
    setApplicationBooking(null);
    setApplicationPreview(null);
    setPreviewLoading(false);
    setSelectedApplication(null);
  }, []);

  const handleChangeApplicationSelection = useCallback((application: BookingApplicationItem) => {
    if (!applicationBooking?.id) return;
    setApplicationPreview(null);
    setPreviewLoading(true);
    bookingApi.previewApplicationSelection(applicationBooking.id, application.id)
      .then((response) => {
        setBookingId(applicationBooking.id);
        setApplicationSelection({
          application,
          preview: response.data,
        });
        setApplicationSelectionSource('orders');
        handleCloseApplications();
        router.push({ pathname: '/(app)/(customer)/(service)/application-technician-detail' });
      })
      .catch((err) => {
        setApplicationPreview(null);
        error({ message: getMessageError(err, t) || t('common_error.request_error') });
      })
      .finally(() => {
        setPreviewLoading(false);
      });
  }, [applicationBooking?.id, error, handleCloseApplications, setApplicationSelection, setApplicationSelectionSource, setBookingId, t]);

  const handleSelectApplication = useCallback((application: BookingApplicationItem) => {
    if (!applicationBooking?.id) return;

    selectApplicationMutation.mutate(
      {
        bookingId: applicationBooking.id,
        applicationId: application.id,
      },
      {
        onSuccess: async () => {
          const bookingId = applicationBooking.id;
          handleCloseApplications();
          await queryClient.invalidateQueries({ queryKey: ['bookingApi-applications', bookingId] });
          await queryClient.invalidateQueries({ queryKey: ['bookingApi-listBookings'] });
          await refetch();
        },
        onError: (err) => {
          error({ message: getMessageError(err, t) || t('common_error.request_error') });
        },
      }
    );
  }, [applicationBooking?.id, error, handleCloseApplications, refetch, selectApplicationMutation, t]);

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
          {BOOKING_STATUS_FILTER_OPTIONS.map(([key, value], index) => {
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
              onPress={handlePressBookingCard}
              handleOpenApplications={handleOpenApplications}
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

      <ApplicationTechnicianModal
        visible={!!applicationBooking}
        onClose={handleCloseApplications}
        data={applicationsQuery.data?.data.data || []}
        title={t('booking.select_technician_title')}
        isLoading={applicationsQuery.isLoading || applicationsQuery.isFetching}
        isSubmitting={selectApplicationMutation.isPending}
        loadingText={t('common.loading')}
        emptyText={t('common.empty')}
        preview={applicationPreview}
        previewLoading={previewLoading}
        onChangeSelection={handleChangeApplicationSelection}
        onSelect={handleSelectApplication}
      />
    </View>
  );
}
