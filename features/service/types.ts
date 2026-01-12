import { BaseSearchRequest, ResponseDataSuccessType, Paginator } from '@/lib/types';
import { ServiceOption } from '../ktv/types';

export type CategoryItem = {
  id: string;
  name: string;
  is_featured: boolean; // Dịch vụ nổi bật
  image_url: string | null;
  usage_count: number; // Số lần sử dụng
  description: string | null;
};

export type CategoryListFilterPatch = Partial<CategoryListRequest['filter']>;

export type CategoryListRequest = BaseSearchRequest<{
  keyword?: string;
  is_featured?: boolean; // Dịch vụ nổi bật
}>;

export type CategoryListResponse = ResponseDataSuccessType<Paginator<CategoryItem>>;

export type ServiceItem = {
  id: string;
  name: string;
  category_id: string;
  bookings_count: number; // Số lần đặt lịch
  avg_rating: number; // Đánh giá trung bình
  is_active: boolean;
  image_url: string | null;
  description: string | null;
  category: {
    id: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
  };
  options: ServiceOption[];
};

export type ServiceListRequest = BaseSearchRequest<{
  category_id?: string;
  user_id?: string;
}>;

export type ServiceListResponse = ResponseDataSuccessType<Paginator<ServiceItem>>;

export type ServiceDetailResponse = ResponseDataSuccessType<ServiceItem>;

export type BookingServiceRequest = {
  service_id: string;
  service_name: string;
  option_id: string;
  duration: number;
  book_time: string; // Thời gian đặt lịch
  note?: string;
  note_address?: string;
  address: string;
  latitude: number;
  longitude: number;
  coupon_id?: string;
};

// Pick only required fields for booking
export type PickBookingItem = {
  service_id: string;
  service_name: string;
  option_id: string;
  duration: number;
  price: string;
};

// Pick only required fields for booking requirement
export type PickBookingRequirement = Omit<
  BookingServiceRequest,
  'service_id' | 'service_name' | 'option_id' | 'duration'
>;

export type BookingServiceResponse = ResponseDataSuccessType<{
  status: boolean;
  failed?: {
    not_enough_money: boolean;
    final_price: string;
    balance_customer: string;
  };
  success?: {
    booking_id: string;
  };
}>;

export type CouponItem = {
  id: string; // ID coupon
  label: string; // Tên coupon
  code: string; // Mã coupon
  description: string | null; // Mô tả chi tiết về coupon
  for_service_id: string | null; // Dịch vụ áp dụng (null nếu áp dụng cho tất cả dịch vụ)
  is_percentage: boolean; // Có phải là giảm theo phần trăm không
  discount_value: string; // Giá trị giảm (dạng số)
  max_discount: string; // Số tiền tối đa được giảm
  start_at: string; // Thời gian bắt đầu áp dụng
  end_at: string; // Thời gian kết thúc áp dụng
  usage_limit: number; // Số lần sử dụng tối đa
  used_count: number; // Số lần sử dụng hiện tại.
  display_ads: boolean; // Có hiển thị trong quảng cáo không
  banners: string | null; // Banner hiển thị khi áp dụng coupon (null nếu không có)
};
export type ListCouponRequest = BaseSearchRequest<{
  for_service_id?: string; // Dịch vụ áp dụng (null nếu áp dụng cho tất cả dịch vụ)
}>;

export type ListCouponResponse = ResponseDataSuccessType<CouponItem[]>;

export type CouponUserItem = {
  id: string; // ID coupon user
  coupon_id: string; // ID coupon
  user_id: string; // ID user
  is_used: boolean; // Có được sử dụng không
  coupon: CouponItem;
};

export type CouponUserListRequest = BaseSearchRequest<object>;
export type CouponUserListResponse = ResponseDataSuccessType<Paginator<CouponUserItem>>;

export type SendReviewRequest = {
  service_booking_id: string;
  rating: number;
  comment?: string;
  hidden?: boolean;
};

export type ReviewItem = {
  id: string; // ID đánh giá
  user_id: string; // ID user
  review_by: string; // ID user đánh giá
  service_booking_id: string; // ID dịch vụ
  rating: number; // Đánh giá
  comment?: string; // Bình luận
  hidden: boolean; // Có ẩn không
  review_at: string; // Thời gian đánh giá
  reviewer: {
    id: string; // ID user đánh giá
    avatar: string | null; // Hình ảnh user đánh giá
    name: string; // Tên user đánh giá
  } | null; // Thông tin user đánh giá
};

export type ListReviewRequest = BaseSearchRequest<{
  user_id?: string; // tùy chọn, ID của ktv cần lấy đánh giá
  service_id?: string; // tùy chọn, ID của dịch vụ cần lấy đánh giá
}>;

export type ListReviewResponse = ResponseDataSuccessType<Paginator<ReviewItem>>;
export type UpdateServiceResponse = ResponseDataSuccessType<ServiceItem>;
