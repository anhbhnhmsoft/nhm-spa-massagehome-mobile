import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import bookingApi from '@/features/booking/api';
import { ListBookingRequest, ListBookingResponse } from '@/features/booking/types';


/**
 * Kiểm tra trạng thái đặt lịch theo id (polling)
 * @param id
 */
export const useQueryBookingCheck = (id: string | null) => {
  return useQuery({
    queryKey: ['bookingApi-checkBooking', id],
    queryFn: () => bookingApi.checkBooking(id || ''),
    // 1. Chỉ chạy query khi có bookingId
    enabled: !!id,
    select: res => res.data,
    // 2. Logic Polling thông minh
    refetchInterval: (query) => {
      // Lấy data hiện tại từ state
      const currentData = query.state.data;

      // Nếu chưa có data (lần đầu) hoặc status là 'waiting' -> Poll mỗi 5 giây (5000ms)
      if (!currentData || currentData.data.status === 'waiting') {
        return 5000;
      }

      // Nếu status là 'confirmed' hoặc 'failed' -> Return false để DỪNG polling
      return false;
    },

    // 3. (Tùy chọn) Poll ngay cả khi app đang chạy ngầm (tab background)
    refetchIntervalInBackground: true,
  });
}

/**
 * Lấy danh sách lịch hẹn với pagination
 * @param params
 */
export const useInfiniteBookingList = (
  params: ListBookingRequest
) => {
  return useInfiniteQuery<ListBookingResponse>({
    queryKey: ['bookingApi-listBookings', params],
    queryFn: async ({ pageParam }) => {
      return bookingApi.listBookings({
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

