import { BaseSearchRequest, ResponseDataSuccessType, Paginator } from '@/lib/types';
import { _ServiceDuration } from '@/features/service/const';

export type CategoryItem = {
  id: string;
  name: string;
  is_featured: boolean; // Dịch vụ nổi bật
  image_url: string | null;
  usage_count: number; // Số lần sử dụng
  description: string | null;
};

export type CategoryListRequest = BaseSearchRequest<{}>;

export type CategoryListResponse = ResponseDataSuccessType<Paginator<CategoryItem>>;

export type ServiceItem = {
  id: string;
  name: string;
  category_id: string;
  bookings_count: number; // Số lần đặt lịch đã hoàn thành
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
  options: {
    id: string;
    price: string;
    duration: _ServiceDuration;
  }[];
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
  duration: _ServiceDuration;
  book_time: string; // Thời gian đặt lịch
  note?: string;
  address: string;
  lat: number;
  lng: number;
  coupon_id?: string;
}

// Pick only required fields for booking
export type PickBookingItem = Pick<BookingServiceRequest, "service_id" | "service_name" | "duration">;

// Pick only required fields for booking requirement
export type PickBookingRequirement = Omit<BookingServiceRequest, "service_id" | "service_name" | "duration">;


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
  used_count: number; // Số lần sử dụng hiện tại
};
export type ListCouponRequest = BaseSearchRequest<{
  for_service_id?: string; // Dịch vụ áp dụng (null nếu áp dụng cho tất cả dịch vụ)
}>;

export type ListCouponResponse = ResponseDataSuccessType<CouponItem[]>;
