import { ListBookingRequest, ListBookingResponse } from '@/features/booking/types';
import ktvApi from '@/features/ktv/api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useDashboardKtvQuery = () => {
  return useQuery({
    queryKey: ['ktvApi-dashboard'],
    queryFn: () => ktvApi.dashboard(),
    select: (res) => res.data,
  });
};

export const useInfiniteBookingList = (params: ListBookingRequest) => {
  return useInfiniteQuery<ListBookingResponse>({
    queryKey: ['bookingApi-listBookings-ktv', params],
    queryFn: async ({ pageParam }) => {
      return ktvApi.bookings({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.meta?.current_page ?? 1;
      const lastPageNum = lastPage.data?.meta?.last_page ?? 1;
      if (currentPage < lastPageNum) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};
