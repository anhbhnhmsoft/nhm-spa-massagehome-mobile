import { ResponseDataSuccessType } from '@/lib/types';
import { CouponItem } from '@/features/service/types';


export type BannerItem = {
  id: string;
  image_url: string;
}

export type BannerResponse = ResponseDataSuccessType<BannerItem[]>;

// CommercialCouponResponse: Dữ liệu phản hồi khi lấy danh sách coupon quảng cáo.
export type CommercialCouponResponse = ResponseDataSuccessType<CouponItem[]>;

export type CollectCouponResponse = ResponseDataSuccessType<{
  need_login?: boolean;
  already_collected?: boolean;
}>;
