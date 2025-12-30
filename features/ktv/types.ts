import {
  BaseSearchRequest,
  IFileUpload,
  IMultiLangField,
  Paginator,
  ResponseDataSuccessType,
} from '@/lib/types';
import { BookingItem } from '@/features/booking/types';
import { CategoryItem, ReviewItem, ServiceItem } from '@/features/service/types';
import { _LanguageCode } from '@/lib/const';
import { _Gender } from '@/features/auth/const';
import { DashboardTab } from '../service/const';

export type DashboardKtvResponse = ResponseDataSuccessType<{
  booking: BookingItem | null;
  total_revenue_today: number;
  total_revenue_yesterday: number;
  total_booking_completed_today: number;
  total_booking_pending_today: number;
  review_today: ReviewItem[];
}>;
export type StartBookingResponse = ResponseDataSuccessType<{
  status: number;
  start_time: string;
  duration: number;
  booking: BookingItem;
}>;
export type BookingDetailsResponse = ResponseDataSuccessType<{ data: BookingItem }>;

export type AllCategoriesResponse = ResponseDataSuccessType<CategoryItem[]>;

export type ServiceForm = {
  category_id: string;
  is_active: boolean;
  // Object đa ngôn ngữ
  name: IMultiLangField;
  description: IMultiLangField;
  // Ảnh (lưu ý: lúc form nhập có thể là null, nhưng khi submit là bắt buộc)
  image: IFileUpload;
  // Mảng các gói dịch vụ
  options: {
    price: number;
    duration: number;
  }[];
};

export type ListServiceRequest = BaseSearchRequest<object>;

export type ListServiceResponse = ResponseDataSuccessType<Paginator<ServiceItem>>;

export type DetailServiceRequest = {
  id: string;
};
export type CancelBookingRequet = {
  booking_id: string;
  reason: string;
};
export type ServiceDetailItem = {
  id: string;
  name: Record<_LanguageCode, string>;
  category_id: string;
  description: Record<_LanguageCode, string>;
  image_url: string | null;
  bookings_count: number;
  is_active: boolean;
  options: {
    id: string;
    duration: number;
    price: number;
  }[];
};
export interface DashboardStats {
  total_income: string;
  received_income: string;
  total_customers: number;
  affiliate_income: number;
  total_reviews: number;
  chart_data: ChartDataItem[];
}

export interface ChartDataItem {
  date: string; // YYYY-MM-DD
  total: string;
}

export interface DashboardQueryParams {
  type: DashboardTab;
}

export type PercentChangeResult = {
  percent: number | null;
  isIncrease: boolean | null;
  currentTotal: number;
  previousTotal: number;
};

export type ServiceDetailResponse = ResponseDataSuccessType<ServiceDetailItem>;
export type TotalIncomeResponse = ResponseDataSuccessType<DashboardStats>;

export type DetailInfoKTV = {
  id: string;
  name: string;
  bio: IMultiLangField;
  avatar_url: string | null;
  list_images: {
    id: string;
    image_url: string | null;
  }[];
  gender: _Gender;
  dob: string | null;
  lat: string;
  lng: string;
  address: string;
  experience: number;
  date_of_birth: string;
};

export type EditProfileKtvRequest = {
  address?: string;
  experience?: number;
  bio?: IMultiLangField;
  lat?: string;
  lng?: string;

  /** Giới tính (1: Nam, 2: Nữ, 3: Khác – tùy BE) */
  gender?: number;

  /** Ngày sinh (YYYY-MM-DD) */
  date_of_birth?: string;
  old_password?: string;
  new_password?: string;
};

export type DetailInfoKTVResponse = ResponseDataSuccessType<DetailInfoKTV>;
