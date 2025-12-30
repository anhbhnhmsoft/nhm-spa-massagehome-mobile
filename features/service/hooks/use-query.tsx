import serviceApi from '@/features/service/api';
import {
  CategoryListRequest,
  CategoryListResponse, CouponUserListRequest, CouponUserListResponse,
  ListCouponRequest, ListCouponResponse, ListReviewRequest, ListReviewResponse,
  ServiceListRequest,
  ServiceListResponse,
} from '@/features/service/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

/**
 * Lấy danh sách category với pagination
 * @param params
 */
export const useInfiniteCategoryList = (
  params: CategoryListRequest
) => {
  return useInfiniteQuery<CategoryListResponse>({
    queryKey: ['serviceApi-listCategory', params],
    queryFn: async ({ pageParam }) => {
      return serviceApi.listCategory({
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

/**
 * Lấy danh sách service với pagination
 * @param params
 * @param enabled
 */
export const useInfiniteServiceList = (
  params: ServiceListRequest, enabled?: boolean
) => {
  return useInfiniteQuery<ServiceListResponse>({
    queryKey: ['serviceApi-listService', params],
    queryFn: async ({ pageParam }) => {
      return serviceApi.listService({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    enabled,
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


/**
 * Lấy danh sách coupon (tất cả)
 */
export const useQueryListCoupon = (
  params: ListCouponRequest, enabled?: boolean
) => {
  return useQuery({
    queryKey: ['serviceApi-listCoupon', params],
    queryFn: async () => {
      return serviceApi.listCoupon(params);
    },
    select: res => res.data,
    enabled,
    refetchInterval: 1000 * 60 * 2, // 2 phút refresh lại dữ liệu nhằm đảm bảo rằng dữ liệu coupon luôn là mới nhất
    refetchOnWindowFocus: true, // Refetch khi ứng dụng quay lại focus
    // --- CẤU HÌNH KHÔNG CACHE ---
    gcTime: 0,      // (Garbage Collection Time) = 0: Xóa khỏi bộ nhớ ngay khi component unmount
    retry: 0,       // Check token lỗi thì fail luôn, đừng thử lại (để logout luôn)
    // --- Đánh dấu để không lưu xuống AsyncStorage ---
    meta: {
      persist: false,
    },
  });
};

// Lấy danh sách coupon user với pagination
export const useQueryListCouponUser = (
  params: CouponUserListRequest, enabled?: boolean
) => {
  return useInfiniteQuery<CouponUserListResponse>({
    queryKey: ['serviceApi-listCouponUser', params],
    queryFn: async ({ pageParam }) => {
      return serviceApi.listCouponUser({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    enabled,
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


export const useInfiniteListReview = (
  params: ListReviewRequest,
  enabled?: boolean
) => {
  return useInfiniteQuery<ListReviewResponse>({
    queryKey: ['serviceApi-listReview', params],
    queryFn: async ({ pageParam }) => {
      return serviceApi.listReview({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    enabled: enabled,
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
