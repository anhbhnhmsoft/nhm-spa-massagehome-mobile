import { useInfiniteQuery } from '@tanstack/react-query';
import userApi from '@/features/user/api';
import { ListKTVRequest, ListKTVResponse } from '@/features/user/types';


export const useInfiniteListKTV = (
  params: ListKTVRequest
) => {
  return useInfiniteQuery<ListKTVResponse>({
    queryKey: ['userApi-listKTV', params],
    queryFn: async ({ pageParam }) => {
      return userApi.listKTV({
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
