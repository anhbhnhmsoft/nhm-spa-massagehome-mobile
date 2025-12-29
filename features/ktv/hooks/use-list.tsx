import { ListBookingRequest } from '@/features/booking/types';
import { useCallback, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';
import { ListServiceRequest } from '@/features/ktv/types';
import { useInfiniteBookingList, useInfiniteServiceList } from '@/features/ktv/hooks/use-query';
import { useKtvStore } from '@/features/ktv/stores';
import { useBookingStore } from '@/lib/ktv/useBookingStore';

export const useSchedule = () => {
  const refreshed = useBookingStore((s) => s.refreshed);
  const setRefreshed = useBookingStore((s) => s.setRefreshed);
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

  useEffect(() => {
    if (refreshed) {
      query.refetch?.();
      setRefreshed(false);
    }
  }, [refreshed, query, setRefreshed]);
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

// Lấy danh sách dịch vụ
export const useListServices = () => {
  const reloadListService = useKtvStore((state) => state.reload_list_service);
  const setReloadListService = useKtvStore((state) => state.setReloadListService);

  const [params, setParams] = useImmer<ListServiceRequest>({
    filter: {},
    page: 1,
    per_page: 10,
  });

  const setFilter = useCallback(
    (filterPatch: Partial<ListServiceRequest['filter']>) => {
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

  const query = useInfiniteServiceList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  // Lấy lại danh sách dịch vụ khi reloadListService thay đổi
  useEffect(() => {
    if (reloadListService) {
      query.refetch();
      setReloadListService(false);
    }
  }, [reloadListService, setReloadListService]);

  return {
    ...query,
    params,
    setFilter,
    data,
  };
};
