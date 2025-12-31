import { useInfiniteQuery } from '@tanstack/react-query';
import { ListKtvResponse } from '../type';
import { agencyApi } from '../api';

export const useListKtvQuery = () => {
  return useInfiniteQuery<ListKtvResponse>({
    queryKey: ['listKtv'],
    queryFn: ({ pageParam = 1 }) => agencyApi.listKtv({ page: pageParam as number }),

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
