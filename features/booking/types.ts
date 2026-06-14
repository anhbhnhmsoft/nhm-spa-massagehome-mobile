import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _BookingStatus } from '@/features/service/const';

export type BookingCheckItem = {
  booking_id: string;
  service_name: string;
  date: string;
  location: string;
  technician: string | null;
  is_ktv_selected?: boolean;
  price: string;
  price_discount: string;
  price_transportation: string;
  total_price: string;
  reason_cancel: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  ktv_latitude?: string | number | null;
  ktv_longitude?: string | number | null;
  original_ktv_user?: {
    id: string | null;
    name: string | null;
    avatar_url: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
  } | null;
  ktv_confirm_deadline_at?: string | null;
  assignment_deadline_at?: string | null;
  application_opened_at?: string | null;
  application_open_reason?: string | null;
};

export type BookingCheckResponse = ResponseDataSuccessType<{
  status: 'waiting' | 'waiting_ktv_confirm' | 'open_for_application' | 'confirmed' | 'failed';
  data?: BookingCheckItem;
}>;

export type BookingApplicationTechnician = {
  id: string | null;
  name: string | null;
  avatar_url: string | null;
  experience?: number | null;
  bio?: Record<string, string> | null;
  rating?: number | null;
  review_count?: number | null;
  location?: {
    address: string | null;
    latitude: string | number | null;
    longitude: string | number | null;
  };
  distance?: number | null;
};

export type BookingApplicationItem = {
  id: string;
  booking_id: string;
  ktv_id: string;
  status: number;
  status_label: string | null;
  applied_at: string | null;
  selected_at: string | null;
  removed_reason: string | null;
  ktv: BookingApplicationTechnician;
};

export type ListBookingRequest = BaseSearchRequest<{
  status?: _BookingStatus;
}>;

export type BookingItem = {
  id: string;
  service_category_name?: string | null;
  service: {
    id: string;
    name: string;
    image: string;
  };
  ktv_user: {
    id: string | null;
    name: string;
    avatar_url: string | null;
  };
  selected_ktv_user?: {
    id: string | null;
    name: string;
    avatar_url: string | null;
  } | null;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
    phone: string | null;
  };
  customer_gender?: string | null;
  address: string;
  booking_time: string;
  start_time: string | null;
  end_time: string | null;
  booking_phase?: string;
  is_ktv_selected?: boolean;
  ktv_confirm_deadline_at?: string | null;
  application_opened_at?: string | null;
  application_open_reason?: string | null;
  has_applied?: boolean;
  is_original_ktv?: boolean;
  application_status?: number | null;
  distance?: number | null;
  note: string | null;
  duration: number;
  service_duration_total?: number;
  status: _BookingStatus;
  price: number;
  price_discount: number;
  price_transportation: number;
  total_price: number;
  ktv_service_income?: number;
  ktv_income_total?: number;
  is_customer_contact_visible?: boolean;
  can_chat?: boolean;
  can_call?: boolean;
  can_open_map?: boolean;
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
export type BookingApplicationListResponse = ResponseDataSuccessType<Paginator<BookingApplicationItem>>;
export type BookingApplicationSelectResponse = ResponseDataSuccessType<BookingItem>;
export type BookingApplicationPreviewResponse = ResponseDataSuccessType<{
  booking_id: string;
  ktv_id: string;
  technician_name: string | null;
  price: number;
  price_discount: number;
  price_transportation: number;
  total_price: number;
  distance: number | null;
}>;


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
  wallet_balance: number;
  is_balance_enough: boolean;
  required_topup_amount: number;
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
