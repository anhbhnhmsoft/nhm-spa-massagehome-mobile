import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _BookingStatus } from '@/features/service/const';

export type BookingCheckItem = {
  booking_id: string;
  service_name: string;
  date: string;
  location: string;
  technician: string;
  price: string;
  price_discount: string;
  price_transportation: string;
  total_price: string;
  reason_cancel: string | null;
};

export type BookingCheckResponse = ResponseDataSuccessType<{
  status: 'waiting' | 'confirmed' | 'failed';
  data?: BookingCheckItem;
}>;

export type ListBookingRequest = BaseSearchRequest<{
  status?: _BookingStatus;
}>;

export type BookingItem = {
  id: string;
  service: {
    id: string;
    name: string;
    image: string;
  };
  ktv_user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  address: string;
  booking_time: string;
  start_time: string | null;
  end_time: string | null;
  note: string | null;
  duration: number;
  status: _BookingStatus;
  price: number;
  price_discount: number;
  price_transportation: number;
  total_price: number;
  coupon: {
    id: string;
    label: string;
  } | null;
  has_reviews: boolean;
  lat: number;
  lng: number;
  reason_cancel: string | null;
};

export type ListBookingResponse = ResponseDataSuccessType<Paginator<BookingItem>>;


// Lấy thông tin trước khi đặt lịch dịch vụ
export type PrepareBookingRequest = {
  category_id: string;
  option_ids: string[];
  ktv_id: string;
  latitude: number;
  longitude: number;
  coupon_id?: string | null;
}

export type PrepareBookingResponse = ResponseDataSuccessType<{
  break_time: number; //  Lấy thời gian nghỉ giữa 2 lần phục vụ của kỹ thuật viên
  price: number; // Giá dịch vụ
  price_per_km: number; // Giá dịch vụ / 1 km
  price_distance: number; // Giá dịch vụ cho khoảng cách
  discount_coupon: number; // Giảm giá coupon
  final_price: number; // Giá cuối cùng sau khi áp dụng coupon
  distance: number; // Khoảng cách từ kỹ thuật viên đến khách hàng
  booking_today: {
    id: string;
    status: _BookingStatus.ONGOING | _BookingStatus.CONFIRMED;
    booking_time: string;
    start_time: string | null;
  }
}>;

export type BookingServiceRequest =  PrepareBookingRequest & {
  address: string;
  note?: string;
};

export type BookingServiceResponse = ResponseDataSuccessType<{
  booking_id: string
}>;