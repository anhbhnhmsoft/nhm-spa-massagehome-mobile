import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBookingDetailsQuery } from './use-query';
import {
  useCancelBookingMutation,
  useFinishBookingMutation,
  useStartBookingMutation,
} from './use-mutation';
import * as Notifications from 'expo-notifications';
import { useBookingStore } from '@/lib/ktv/useBookingStore';
import useToast from '@/features/app/hooks/use-toast';
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
  const { endTime, clearBooking, bookingId, setRefreshed } = useBookingStore();
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
          onSuccess: () => {
            // ✅ chỉ set khi API thành công
            setRefreshed(true);

            // clear local state sau khi backend đã finish
            clearBooking();
          },
          onError: (err: any) => {
            console.log('finish booking error', err);
          },
        });
      } else {
        setRemainingMs(remain);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endTime, bookingId, clearBooking, setRefreshed]);

  return remainingMs;
}

export const useBookingDetails = (id: string) => {
  const { data, isSuccess, refetch, isFetching } = useBookingDetailsQuery(id);
  const remainingMs = useBookingCountdown();
  const booking = useMemo(() => {
    return data?.data || null;
  }, [data]);
  const startBooking = useBookingStore((s) => s.startBooking);
  const refreshed = useBookingStore((s) => s.refreshed);
  const setRefreshed = useBookingStore((s) => s.setRefreshed);
  const bookingStart = useStartBookingMutation();
  const cancelBooking = useCancelBookingMutation();
  const { error } = useToast();
  useEffect(() => {
    if (refreshed) {
      refetch();
      setRefreshed(false);
    }
  }, [refreshed, refetch, setRefreshed]);

  const handleStartBooking = useCallback(() => {
    if (!booking?.id) return;

    bookingStart.mutate(booking.id, {
      onSuccess: (res) => {
        setRefreshed(true);
        startBooking(res.data.booking);
      },

      onError: (err: any) => {
        error({ message: err.message });
      },
    });
  }, [booking?.id, startBooking]);

  const handleCancelBooking = useCallback(
    (reason: string) => {
      if (!booking?.id) return;
      cancelBooking.mutate(
        { booking_id: booking.id, reason },
        {
          onSuccess: () => {
            setRefreshed(true);
          },
          onError: (err: any) => {
            error({ message: err.message });
          },
        }
      );
    },
    [booking?.id, cancelBooking]
  );
  return {
    booking,
    handleStartBooking,
    remainingMs,
    handleCancelBooking,
    refetch,
    isFetching,
  };
};
