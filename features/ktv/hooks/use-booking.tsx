import { useEffect, useMemo, useState } from 'react';
import { useBookingDetailsQuery } from './use-query';
import { useCancelBookingMutation, useFinishBookingMutation, useStartBookingMutation, } from './use-mutation';
import * as Notifications from 'expo-notifications';
import { useBookingStore } from '@/lib/ktv/useBookingStore';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/provider/query-provider';
import useToast from '@/features/app/hooks/use-toast';
import { _BookingStatus } from '@/features/service/const';
import { Alert } from 'react-native';
import { calculateEndTime, getMessageError, getRemainingTime } from '@/lib/utils';
import { FinishBooking, StartBookingResponse } from '@/features/ktv/types';
import useAuthStore from '@/features/auth/store';
import { _UserRole } from '@/features/auth/const';

/**
 * Hook dùng để clear booking start
 */

export const useClearBooking = () => {
  const { t } = useTranslation();
  const { success } = useToast();
  const clearBookingStart = useBookingStore((s) => s.clearBookingStart);
  return async (data: FinishBooking) => {
    if (data.already_finished) {
      await clearBookingStart();
    } else {
      await clearBookingStart();
      success({ message: t('booking.booking_end_success') });
    }
  };
};

/**
 * Hook dùng để đếm bộ bắt đầu (dùng ở layout toàn cục)
 */
export const useBookingCountdown = () => {
  // store
  const bookingStart = useBookingStore((s) => s.booking_start);
  const setTimeLeft = useBookingStore((s) => s.setTimeLeft);
  const clearBookingStart = useClearBooking();
  const hydrate = useBookingStore((s) => s.hydrate);
  const _hydrated = useBookingStore((s) => s._hydrated);

  const { mutate: finishBookingMutate } = useFinishBookingMutation();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!_hydrated) {
      hydrate();
    }
  }, [_hydrated]);
  useEffect(() => {
    if (!bookingStart || !_hydrated || user?.role !== _UserRole.KTV) return;

    const endTime = calculateEndTime(bookingStart.start_time, bookingStart.duration);
    const timer = setInterval(() => {
      const remaining = getRemainingTime(endTime);
      setTimeLeft(remaining);

      if (remaining.isOver) {
        clearInterval(timer);
        setTimeLeft(null);

        finishBookingMutate(bookingStart.booking_id, {
          onSuccess: async (res) => {
            const prevNotif = useBookingStore.getState().notification_booking_start_id;

            if (prevNotif) {
              try {
                await Notifications.cancelScheduledNotificationAsync(prevNotif);
              } catch {}
            }

            await queryClient.invalidateQueries({
              queryKey: ['bookingApi-details-ktv', bookingStart.booking_id],
            });
            await queryClient.invalidateQueries({
              queryKey: ['ktvApi-bookings'],
            });
            await queryClient.invalidateQueries({
              queryKey: ['ktvApi-dashboard'],
            });
            await clearBookingStart(res.data);
          },
        });
      }
    }, 1000);

    // cleanup khi unmount hoặc bookingStart đổi
    return () => clearInterval(timer);
  }, [bookingStart, _hydrated, user]);
};

/**
 * Hook dùng để set booking start
 */
export const useSetBookingStart = () => {
  const { t } = useTranslation();
  const bookingStart = useBookingStore((s) => s.booking_start);
  const setStartBooking = useBookingStore((s) => s.setBookingStart);
  const setNotificationBookingStartId = useBookingStore((s) => s.setNotificationBookingStartId);
  const { error } = useToast();
  return async (data: StartBookingResponse['data']) => {
    try {
      if (bookingStart?.booking_id === data.booking_id) return;

      // set booking start time to store
      await setStartBooking(data);
      // end time sẽ là start time + duration phút
      const endTime = calculateEndTime(data.start_time, data.duration);

      // schedule notification for end time
      const permission = await Notifications.getPermissionsAsync();
      if (permission.granted) {
        let notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: t('booking.notification.booking_end_title'),
            body: t('booking.notification.booking_end_body'),
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: endTime.toDate(),
            channelId: 'booking',
          },
        });
        await setNotificationBookingStartId(notificationId);
      }
    } catch (e) {
      error({ message: t('booking.start_error_booking') });
    }
  };
};

/**
 * Dùng cho màn chi tiết booking
 * @param id
 */
export const useBooking = (id: string) => {
  // Khai báo các state cần sử dụng
  const { t } = useTranslation();
  const [showModalCancel, setShowModalCancel] = useState(false);
  const { error } = useToast();
  const { data, refetch, isRefetching, isLoading } = useBookingDetailsQuery(id);
  const { mutate: startBookingMutate, isPending: isStartBookingPending } =
    useStartBookingMutation();
  const { mutate: cancelBookingMutate, isPending: isCancelBookingPending } =
    useCancelBookingMutation();
  const _hydrated = useBookingStore((s) => s._hydrated);
  const hydrate = useBookingStore((s) => s.hydrate);

  const bookingStart = useBookingStore((s) => s.booking_start);
  const timeLeft = useBookingStore((s) => s.time_left);
  const clearBookingStart = useBookingStore((s) => s.clearBookingStart);

  const setBookingStart = useSetBookingStart();

  // hydrate store when component mounted
  useEffect(() => {
    if (!_hydrated) {
      hydrate();
    }
  }, [_hydrated]);

  useEffect(() => {
    if (!data || !bookingStart) return;
    if (bookingStart?.booking_id === data.id && data.status === _BookingStatus.COMPLETED) {
      clearBookingStart();
    }
  }, [data, bookingStart]);

  // bắt đầu dịch vụ
  const handleStartBooking = async () => {
    if (!data || !_hydrated) return;

    // bắt đầu dịch vụ
    startBookingMutate(data.id, {
      onSuccess: async (res) => {
        const dataRes = res.data;
        // reset lại query để refetch
        // Bọc try catch
        await refetch();
        await queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
        await setBookingStart(dataRes);
      },

      onError: (err: any) => {
        error({ message: err.message });
      },
    });
  };

  // hủy dịch vụ
  const handleCancelBooking = (reason: string) => {
    if (!data || !_hydrated) return;

    if (reason.trim().length === 0) {
      Alert.alert(t('booking.booking_cancel_reason_required'));
      return;
    }

    Alert.alert(
      t('booking.booking_cancel_confirm_title'),
      t('booking.booking_cancel_confirm_message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.accept'),
          style: 'destructive',
          onPress: () => {
            cancelBookingMutate(
              { booking_id: data.id, reason },
              {
                onSuccess: async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ['bookingApi-details-ktv', data.id],
                  });
                  // also invalidate booking list so the list updates
                  await queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
                  setShowModalCancel(false);
                },
                onError: (err) => {
                  const message = getMessageError(err, t);
                  if (message) {
                    error({ message: message });
                  }
                },
              }
            );
          },
        },
      ]
    );
  };
  // có thể bắt đầu dịch vụ
  const canStartBooking = useMemo(() => {
    return data?.status === _BookingStatus.CONFIRMED && bookingStart === null;
  }, [data?.status, bookingStart]);

  // có thể hủy dịch vụ
  const canCancelBooking = useMemo(() => {
    if (!data) return false;
    return data.status === _BookingStatus.CONFIRMED;
  }, [data, bookingStart]);

  return {
    booking: data,
    handleStartBooking,
    handleCancelBooking,
    canStartBooking,
    canCancelBooking,
    refetch,
    timeLeft,
    showModalCancel,
    setShowModalCancel,
    isLoadingBooking: isRefetching || isLoading,
    isStartBookingPending,
    isCancelBookingPending,
  };
};
