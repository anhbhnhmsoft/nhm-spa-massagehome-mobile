import { client } from '@/lib/axios-client';
import { BannerResponse, CollectCouponResponse, CommercialCouponResponse } from '@/features/commercial/types';


const defaultUri = '/commercial';

const commercialApi = {
  // Lấy danh sách banner
  listBanners: async (): Promise<BannerResponse> => {
    const response = await client.get(`${defaultUri}/banners`);
    return response.data;
  },
  // Lấy danh sách coupon quảng cáo
  listCoupons: async (): Promise<CommercialCouponResponse> => {
    const response = await client.get(`${defaultUri}/coupons`);
    return response.data;
  },
  // Ghi nhận coupon quảng cáo
  collectCoupon: async (couponId: string): Promise<CollectCouponResponse> => {
    const response = await client.post(`${defaultUri}/collect-coupon/${couponId}`);
    return response.data;
  }
}

export default commercialApi;
