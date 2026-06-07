// Lấy thông tin đặt lịch
import { useQueryBookingCheck } from '@/features/booking/hooks/use-query';
import { useMemo } from 'react';
import { useBookingStore } from '@/features/booking/stores';
import { useSelectBookingApplicationMutation } from '@/features/booking/hooks/use-mutation';
import { useBookingApplicationsQuery } from '@/features/booking/hooks/use-query';
import { queryClient } from '@/lib/provider/query-provider';

export const useCheckBooking = () => {
  const bookingId = useBookingStore((state) => state.booking_id);

  const query = useQueryBookingCheck(bookingId);
  const applicationsQuery = useBookingApplicationsQuery(bookingId || undefined);
  const selectMutation = useSelectBookingApplicationMutation();

  const status = useMemo(() => {
    return query.data?.status || 'waiting';
  }, [query.data]);

  return {
    status,
    data: query.data,
    bookingId,
    applications: applicationsQuery.data?.data.data || [],
    applicationsQuery,
    selectMutation,
    refetch: query.refetch,
  };
};
