// Lấy thông tin đặt lịch
import { useQueryBookingCheck } from '@/features/booking/hooks/use-query';
import { useMemo } from 'react';

export const useCheckBooking = (id: string | null) => {
  const query = useQueryBookingCheck(id);

  const status = useMemo(() => {
    return query.data?.status || 'waiting';
  }, [query.data]);

  return {
    status,
    data: query.data,
  };
};