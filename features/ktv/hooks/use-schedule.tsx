import { ListBookingRequest } from '@/features/booking/types';
import { useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { useInfiniteBookingList } from '@/features/ktv/hooks/use-query';

export const useSchedule = () => {
  // React Query handles invalidation; no local `refreshed` flag needed here.
  const [params, setParams] = useImmer<ListBookingRequest>({
    filter: {
      status: undefined,
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

  // react-query will refetch when the bookings query is invalidated elsewhere
  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    params,
    setFilter,
    data,
    pagination,
  };
};


