import { useQuery } from '@tanstack/react-query';
import commercialApi from '@/features/commercial/api';


/**
 * Hook để lấy danh sách banner
 */
export const useListBannerQuery = () => {
  return useQuery({
    queryKey: ['commercialApi-listBanners'],
    queryFn: commercialApi.listBanners,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 24,
  })
}

/**
 * Hook để lấy danh sách coupon quảng cáo
 */
export const useListCommercialCouponQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ['commercialApi-listCoupons'],
    queryFn: commercialApi.listCoupons,
    select: (res) => res.data,
    staleTime: 1000 * 60 * 10, // 10 phút - để tránh gọi lại API quá thường xuyên
    gcTime: 1000 * 60 * 60 * 24, // 1 ngày - để tránh chiếm bộ nhớ quá nhiều
    enabled,
  })
}
