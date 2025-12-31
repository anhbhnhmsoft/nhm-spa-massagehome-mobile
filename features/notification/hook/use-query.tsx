import { useInfiniteQuery } from '@tanstack/react-query';
import { ListNotificationResponse } from '../type';
import { apiNotification } from '../api';

export const useNotificationQuery = () => {
  return useInfiniteQuery<ListNotificationResponse>({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) => apiNotification.listNotification({ page: pageParam as number }),

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
