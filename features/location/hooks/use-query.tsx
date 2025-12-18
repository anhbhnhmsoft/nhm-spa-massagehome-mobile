import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import locationApi from '@/features/location/api';
import { ListAddressRequest, ListAddressResponse, ListProvincesRequest } from '@/features/location/types';



export const useInfinityAddressList = (
  params: ListAddressRequest
) => {
  return useInfiniteQuery<ListAddressResponse>({
    queryKey: ['locationApi-listAddress', params],
    queryFn: async ({ pageParam }) => {
      return locationApi.listAddress({
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

export const useProvinces = (params?: ListProvincesRequest) => {
  return useQuery({
    queryKey: ['locationApi-provinces', params],
    queryFn: () => locationApi.listProvinces(params),
  });
};