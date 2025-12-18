import { useInfiniteBookingList, useQueryBookingCheck } from '@/features/booking/hooks/use-query';
import { useCallback, useMemo } from 'react';
import { ListBookingRequest } from '@/features/booking/types';
import { useImmer } from 'use-immer';
import { _BookingStatus } from '@/features/service/const';

// Lấy thông tin đặt lịch
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

// Lấy danh sách đặt lịch
export const useGetBookingList = () => {
  const [params, setParams] = useImmer<ListBookingRequest>({
    filter: {
      status: _BookingStatus.PENDING,
    },
    page: 1,
    per_page: 10,
  });
  const setFilter = useCallback(
    (filterPatch: Partial<ListBookingRequest['filter']>) => {
      setParams((draft) => {
        // 🚨 QUAN TRỌNG: Reset page về 1 khi filter thay đổi
        draft.page = 1;
        // Merge filter mới vào draft.filter (sử dụng logic Immer)
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams]
  );

  const query = useInfiniteBookingList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
    params, // Trả về params hiện tại để dễ debug/hiển thị
    setFilter, // Trả về hàm setFilter để component sử dụng
  };

};
