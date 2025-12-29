import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBookingDetailsQuery } from './use-query';
import {
  useCancelBookingMutation,
  useFinishBookingMutation,
  useStartBookingMutation,
} from './use-mutation';
import * as Notifications from 'expo-notifications';
import { useBookingStore, calcEndTime } from '@/lib/ktv/useBookingStore';
import { useTranslation } from 'react-i18next';
import { queryClient } from '@/lib/provider/query-provider';
import useToast from '@/features/app/hooks/use-toast';
import { _BookingStatus } from '@/features/service/const';
import { Alert } from 'react-native';

export const formatTime = (ms?: number | null) => {
  // only treat null/undefined as unknown; 0 should display 0:00
  if (ms == null) return '--:--';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function useBookingCountdown() {
  const { endTime, clearBooking, bookingId } = useBookingStore();
  const finishBooking = useFinishBookingMutation();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!endTime) {
      setRemainingMs(null);
      return;
    }

    const tick = () => {
      const remain = endTime - Date.now();

      if (remain <= 0) {
        setRemainingMs(0);

        if (!bookingId) return;

        finishBooking.mutate(bookingId, {
          onSuccess: async () => {
            // cancel scheduled notification (if any)
            try {
              const prevNotif = useBookingStore.getState().notificationId;
              if (prevNotif) {
                try {
                  await Notifications.cancelScheduledNotificationAsync(prevNotif);
                } catch {}
              }
            } catch {}

            // invalidate specific booking detail so it will be refetched
            queryClient.invalidateQueries({ queryKey: ['bookingApi-details-ktv', bookingId] });
            // also invalidate booking list so lists reflect the change
            queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });

            // clear local state after backend has finished
            clearBooking();
          },
          onError: (err: any) => {},
        });
      } else {
        setRemainingMs(remain);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endTime, bookingId, clearBooking]);

  return remainingMs;
}

export const useBookingDetails = (id: string) => {
  const { data, isSuccess, refetch, isFetching } = useBookingDetailsQuery(id);
  const remainingMs = useBookingCountdown();
  const booking = useMemo(() => {
    return data?.data || null;
  }, [data]);
  // Move UI + runtime flags into hook for simpler component usage
  const [showModal, setShowModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const activeBookingId = useBookingStore((s) => s.bookingId);
  const { warning, error } = useToast();
  const { isRunning, isFinished, isBlockedByOther } = useMemo(() => {
    const isThisBookingActive = activeBookingId === id;
    const otherBookingActive = activeBookingId != null && !isThisBookingActive;

    const isRunning = isThisBookingActive && remainingMs != null && remainingMs > 0;
    const isFinished = isThisBookingActive && remainingMs != null && remainingMs <= 0;
    const isBlockedByOther = otherBookingActive;

    return { isRunning, isFinished, isBlockedByOther };
  }, [activeBookingId, id, remainingMs]);
  const startBooking = useBookingStore((s) => s.startBooking);
  const setNotificationId = useBookingStore((s) => s.setNotificationId);
  const bookingStart = useStartBookingMutation();
  const cancelBooking = useCancelBookingMutation();
  const { t } = useTranslation();
  const handleStartBooking = useCallback(() => {
    if (!booking?.id) return;

    bookingStart.mutate(booking.id, {
      onSuccess: async (res) => {
        queryClient.invalidateQueries({ queryKey: ['bookingApi-details-ktv', booking.id] });
        queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
        startBooking(res.data.booking);
        try {
          const endTime = calcEndTime(res.data.booking);

          // cancel previous notification if any (read from store)
          try {
            const prev = useBookingStore.getState().notificationId;
            if (prev) {
              try {
                await Notifications.cancelScheduledNotificationAsync(prev);
              } catch {}
            }
          } catch {}
          const perm = await Notifications.getPermissionsAsync();
          if (!perm.granted) {
            await Notifications.requestPermissionsAsync();
          }

          let notificationId: string | null = null;
          try {
            notificationId = await Notifications.scheduleNotificationAsync({
              content: {
                title: t('notification.booking_end_title', { defaultValue: '⏰ Hết giờ' }),
                body: t('notification.booking_end_body', {
                  defaultValue: 'Thời gian booking đã kết thúc',
                }),
                sound: 'default',
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: new Date(endTime),
                channelId: 'booking',
              },
            });
          } catch (e) {}

          // persist notificationId into store (store will persist to Storage)
          try {
            await setNotificationId(notificationId);
          } catch {}
        } catch (e) {}
      },

      onError: (err: any) => {
        error({ message: err.message });
      },
    });
  }, [booking?.id, startBooking, bookingStart, error, t, setNotificationId]);

  const handleStart = useCallback(() => {
    if (isRunning) {
      warning({ message: t('booking.start_service_blocked') });
      return;
    }
    if (isBlockedByOther) {
      warning({
        message: t('booking.start_blocked_by_other', {
          defaultValue: 'Đã có dịch vụ khác đang chạy',
        }),
      });
      return;
    }

    handleStartBooking?.();
  }, [isRunning, isBlockedByOther, handleStartBooking, t, warning]);

  const handleCancelBooking = useCallback(
    (reason: string) => {
      if (!booking?.id) return;
      cancelBooking.mutate(
        { booking_id: booking.id, reason },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookingApi-details-ktv', booking.id] });
            // also invalidate booking list so the list updates
            queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
          },
          onError: (err: any) => {
            error({ message: err.message });
          },
        }
      );
    },
    [booking?.id, cancelBooking]
  );

  const handleConfirmCancel = useCallback(() => {
    if (cancelReason.trim().length === 0) {
      Alert.alert(t('statistics_desc.notification'), 'Vui lòng nhập lý do huỷ');
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
            handleCancelBooking(cancelReason);
            setCancelReason('');
            setShowModal(false);
          },
        },
      ]
    );
  }, [cancelReason, handleCancelBooking, t]);
  return {
    booking,
    handleStartBooking,
    handleStart,
    remainingMs,
    handleCancelBooking,
    showModal,
    setShowModal,
    activeBookingId,
    isRunning,
    isFinished,
    isBlockedByOther,
    cancelReason,
    setCancelReason,
    handleConfirmCancel,
    refetch,
    isFetching,
  };
};
