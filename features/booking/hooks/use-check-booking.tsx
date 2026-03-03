// Lấy thông tin đặt lịch
import { useQueryBookingCheck } from '@/features/booking/hooks/use-query';
import { useMemo } from 'react';
import { useBookingStore } from '@/features/booking/stores';

export const useCheckBooking = () => {
  const bookingId = useBookingStore((state) => state.booking_id);

  const query = useQueryBookingCheck(bookingId);

  const status = useMemo(() => {
    return query.data?.status || 'waiting';
  }, [query.data]);

  return {
    status,
    data: query.data,
  };
};