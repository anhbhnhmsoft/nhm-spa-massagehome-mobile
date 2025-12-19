import { useMutation } from '@tanstack/react-query';
import commercialApi from '@/features/commercial/api';

// Ghi nhận coupon quảng cáo
export const useCollectCouponMutation = () => {
  return useMutation({
    mutationFn: (couponId: string) => commercialApi.collectCoupon(couponId),
  });
}
