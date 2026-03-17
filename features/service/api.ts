import { client } from '@/lib/axios-client';
import {
  CategoryListRequest,
  CategoryListResponse,
  ListCouponRequest,
  ListCouponResponse,
  CouponUserListRequest,
  CouponUserListResponse,
  SendReviewRequest,
  ListReviewRequest,
  ListReviewResponse,
  TranslateReviewRequest,
  TranslateReviewResponse,
} from '@/features/service/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/service';

const serviceApi = {
  // Lấy danh sách danh mục
  listCategory: async (params: CategoryListRequest): Promise<CategoryListResponse> => {
    const response = await client.get(`${defaultUri}/list-category`, { params });
    return response.data;
  },
  // Lấy chi tiết dịch vụ
  setService: async (serviceId: string): Promise<ResponseSuccessType> => {
    const response = await client.get(`${defaultUri}/set-service/${serviceId}`);
    return response.data;
  },
  // Lấy danh sách coupon
  listCoupon: async (params: ListCouponRequest): Promise<ListCouponResponse> => {
    const response = await client.get(`${defaultUri}/list-coupon`, { params });
    return response.data;
  },
  // Lấy danh sách coupon user
  listCouponUser: async (params: CouponUserListRequest): Promise<CouponUserListResponse> => {
    const response = await client.get(`${defaultUri}/my-list-coupon`, { params });
    return response.data;
  },
  // Gửi đánh giá dịch vụ
  sendReview: async (data: SendReviewRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/review`, data);
    return response.data;
  },
  // Lấy danh sách đánh giá dịch vụ
  listReview: async (params: ListReviewRequest): Promise<ListReviewResponse> => {
    const response = await client.get(`${defaultUri}/list-review`, { params });
    return response.data;
  },
  // dich đánh giá
  translateReview: async (data: TranslateReviewRequest): Promise<TranslateReviewResponse> => {
    const response = await client.post(`${defaultUri}/translate-review`, data);
    return response.data;
  },
};

export default serviceApi;
