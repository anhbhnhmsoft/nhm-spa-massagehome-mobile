import { useImmer } from 'use-immer';
import { ListReviewRequest } from '@/features/service/types';
import  { useCallback, useMemo } from 'react';
import { useInfiniteListReview } from '@/features/service/hooks/use-query';

/**
 * Lấy danh sách review của user
 */
export const useGetReviewList = (enabled?: boolean) => {
  const [params, setParams] = useImmer<ListReviewRequest>({
    filter: {},
    page: 1,
    per_page: 10,
  });

  // Hàm setFilter
  const setFilter = useCallback(
    (filterPatch: Partial<ListReviewRequest['filter']>) => {
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

  const query = useInfiniteListReview(params, enabled);

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