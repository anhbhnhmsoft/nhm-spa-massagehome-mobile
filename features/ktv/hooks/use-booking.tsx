import { useEffect, useMemo, useState } from 'react';
import { useBookingDetailsQuery } from './use-query';
import {
  useCancelBookingMutation,
  useFinishBookingMutation,
  useStartBookingMutation,
} from './use-mutation';
import * as Notifications from 'expo-notifications';
import { useBookingStore } from '@/lib/ktv/useBookingStore';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/provider/query-provider';
import useToast from '@/features/app/hooks/use-toast';
import { _BookingStatus } from '@/features/service/const';
import { Alert } from 'react-native';
import { calculateEndTime, getMessageError, getRemainingTime } from '@/lib/utils';

export const useBooking = (id: string) => {
  // Khai báo các state cần sử dụng
  const { t } = useTranslation();
  const [showModalCancel, setShowModalCancel] = useState(false);
  const { error, success } = useToast();
  const { data, refetch, isRefetching, isLoading } = useBookingDetailsQuery(id);
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getRemainingTime> | null>(null);
  const { mutate: startBookingMutate, isPending: isStartBookingPending } =
    useStartBookingMutation();
  const { mutate: cancelBookingMutate, isPending: isCancelBookingPending } =
    useCancelBookingMutation();
  const { mutate: finishBookingMutate, isPending: isFinishBookingPending } =
    useFinishBookingMutation();
  const _hydrated = useBookingStore((s) => s._hydrated);
  const hydrate = useBookingStore((s) => s.hydrate);
  const bookingStart = useBookingStore((s) => s.booking_start);
  const setStartBooking = useBookingStore((s) => s.setBookingStart);
  const setNotificationBookingStartId = useBookingStore((s) => s.setNotificationBookingStartId);

  // hydrate store when component mounted
  useEffect(() => {
    if (!_hydrated) {
      hydrate();
    }
  }, [_hydrated]);

  // Bộ đếm ngược nếu có booking start
  useEffect(() => {
    if (!bookingStart) return;
    const endTime = calculateEndTime(bookingStart.start_time, bookingStart.duration);

    const timer = setInterval(() => {
      const remaining = getRemainingTime(endTime);
      setTimeLeft(remaining);

      if (remaining.isOver) {
        clearInterval(timer);
        setTimeLeft(null);
        finishBookingMutate(bookingStart.booking_id, {
          onSuccess: async () => {
            const prevNotif = useBookingStore.getState().notification_booking_start_id;
            if (prevNotif) {
              try {
                await Notifications.cancelScheduledNotificationAsync(prevNotif);
              } catch {}
            }
            await refetch();
            await queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
            await setStartBooking(null);
            await setNotificationBookingStartId(null);
            success({ message: t('booking.booking_end_success') });
          },
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingStart]);

  // bắt đầu dịch vụ
  const handleStartBooking = async () => {
    if (!data || !_hydrated) return;

    // bắt đầu dịch vụ
    startBookingMutate(data.id, {
      onSuccess: async (res) => {
        const dataRes = res.data;
        // reset lại query để refetch
        await refetch();
        await queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });

        try {
          // set booking start time to store
          await setStartBooking(dataRes);
          // end time sẽ là start time + duration phút
          const endTime = calculateEndTime(dataRes.start_time, dataRes.duration);

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
        } catch (e) {}
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
    if (data.status === _BookingStatus.CONFIRMED) {
      if (bookingStart !== null) {
        return bookingStart.booking_id !== data.id;
      }
      return true;
    }
    return false;
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
    isFinishBookingPending,
  };
};
