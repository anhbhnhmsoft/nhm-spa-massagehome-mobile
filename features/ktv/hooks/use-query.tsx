import { ListBookingRequest, ListBookingResponse } from '@/features/booking/types';
import ktvApi from '@/features/ktv/api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  DashboardQueryParams,
  ListServiceRequest,
  ListServiceResponse,
} from '@/features/ktv/types';

// lấy thông tin dashboard ktv
export const useDashboardKtvQuery = () => {
  return useQuery({
    queryKey: ['ktvApi-dashboard'],
    queryFn: () => ktvApi.dashboard(),
    select: (res) => res.data,
  });
};

// lấy tất cả các category
export const useAllCategoriesQuery = () => {
  return useQuery({
    queryKey: ['ktvApi-allCategories'],
    queryFn: () => ktvApi.allCategories(),
    select: (res) => res.data,
  });
};

// Lấy danh sách booking theo page
export const useInfiniteBookingList = (params: ListBookingRequest) => {
  return useInfiniteQuery<ListBookingResponse>({
    queryKey: ['ktvApi-bookings', params],
    queryFn: async ({ pageParam }) => {
      return ktvApi.bookings({
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

// Lấy danh sách dịch vụ theo page
export const useInfiniteServiceList = (params: ListServiceRequest) => {
  return useInfiniteQuery<ListServiceResponse>({
    queryKey: ['ktvApi-listServices', params],
    queryFn: async ({ pageParam }) => {
      return ktvApi.listServices({
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

// Lấy thông tin chi tiết booking
export const useBookingDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: ['bookingApi-details-ktv', id],
    queryFn: () => ktvApi.bookingDetails(id),
    select: (res) => res.data,
  });
};

// Lấy thông tin doanh thu theo tháng
export const useTotalIncomeQuery = (params: DashboardQueryParams) => {
  return useQuery({
    queryKey: ['ktvApi-totalIncome', params],
    queryFn: () => ktvApi.totalIncome(params),
    select: (res) => res.data,
  });
};

// Lấy thông tin profile ktv
export const useProfileKtvQuery = () => {
  return useQuery({
    queryKey: ['ktvApi-profileKtv'],
    queryFn: () => ktvApi.profileKtv(),
    select: (res) => res.data,
  });
};

export const useConfigScheduleQuery = () => {
  return useQuery({
    queryKey: ['ktvApi-configSchedule'],
    queryFn: () => ktvApi.configSchedule(),
    select: (res) => res.data,
  });
};

export const useOptionByCategoryQuery = (id?: string) => {
  return useQuery({
    queryKey: ['ktvApi-optionCategorys', id],
    queryFn: () => ktvApi.optionByCategorys(id as string),
    enabled: !!id, // ⭐ chỉ call khi có category_id
    select: (res) => res.data,
  });
};
