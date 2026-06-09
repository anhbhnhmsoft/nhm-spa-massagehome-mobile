// Lấy thông tin đặt lịch
import { useQueryBookingCheck } from '@/features/booking/hooks/use-query';
import { useMemo } from 'react';
import { useBookingStore } from '@/features/booking/stores';
import { useSelectBookingApplicationMutation } from '@/features/booking/hooks/use-mutation';
import { useBookingApplicationsQuery } from '@/features/booking/hooks/use-query';

const APPLICATION_POLLING_STATUSES = ['waiting_ktv_confirm', 'open_for_application'];

export const useCheckBooking = () => {
  const bookingId = useBookingStore((state) => state.booking_id);

  const query = useQueryBookingCheck(bookingId);
  const status = useMemo(() => {
    return query.data?.status || 'waiting';
  }, [query.data]);
  const shouldPollApplications = APPLICATION_POLLING_STATUSES.includes(status);
  const applicationsQuery = useBookingApplicationsQuery(
    bookingId || undefined,
    { page: 1, per_page: 20 },
    {
      refetchInterval: shouldPollApplications ? 3000 : false,
      refetchIntervalInBackground: true,
    }
  );
  const selectMutation = useSelectBookingApplicationMutation();

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
