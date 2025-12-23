import { client } from '@/lib/axios-client';
import {
  CategoryListRequest,
  CategoryListResponse,
  ServiceDetailResponse,
  ServiceListRequest,
  ServiceListResponse,
  ListCouponRequest,
  ListCouponResponse,
  BookingServiceRequest,
  BookingServiceResponse,
  CouponUserListRequest,
  CouponUserListResponse,
  SendReviewRequest,
  ListReviewRequest,
  ListReviewResponse,
} from '@/features/service/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/service';

const serviceApi = {
  // Lấy danh sách danh mục
  listCategory: async (params: CategoryListRequest): Promise<CategoryListResponse> => {
    const response = await client.get(`${defaultUri}/list-category`, { params });
    return response.data;
  },
  // Lấy danh sách dịch vụ
  listService: async (params: ServiceListRequest): Promise<ServiceListResponse> => {
    const response = await client.get(`${defaultUri}/list`, { params });
    return response.data;
  },
  // Lấy chi tiết dịch vụ
  detailService: async (serviceId: string): Promise<ServiceDetailResponse> => {
    const response = await client.get(`${defaultUri}/detail/${serviceId}`);
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
  // Đặt lịch dịch vụ
  bookingService: async (data: BookingServiceRequest): Promise<BookingServiceResponse> => {
    const response = await client.post(`${defaultUri}/booking`, data);
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
};

export default serviceApi;
