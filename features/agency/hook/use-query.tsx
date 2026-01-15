import { _TimeFilter } from '@/features/agency/const';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { agencyApi } from '@/features/agency/api';

export const useDashboardAgencyQuery = (range: _TimeFilter) => {
  return useQuery({
    queryKey: ['agency-dashboard', range],
    queryFn: () => agencyApi.dashboard(range),
    staleTime: 1000 * 60,
    enabled: !!range,
    gcTime: 1000 * 60 * 3,
    select: (data) => data.data,
  });
};

export const useListKtvPerformanceQuery = (range: _TimeFilter) => {
  return useInfiniteQuery({
    queryKey: ['agency-list-ktv-performance', range],
    queryFn: async ({ pageParam = 1 }) => {
      // Gọi API với tham số page và range
      // Cấu trúc API mong đợi: agencyApi.listKtvPerformance(range, page)
      const response = await agencyApi.listKtvPerformance(range, pageParam as number);
      return response.data; // Trả về đối tượng kiểu Paginator<T>
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // lastPage ở đây có kiểu Paginator<T>
      const { current_page, last_page } = lastPage.meta;

      // Nếu trang hiện tại nhỏ hơn trang cuối cùng thì trả về trang tiếp theo
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 3,
    enabled: !!range,
  });
};

export const useGetProfileAgencyProfile = () => {
  return useQuery({
    queryKey: ['agency-profile'],
    queryFn: () => agencyApi.agencyProfile(),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 3,
    select: (data) => data.data,
  });
};
