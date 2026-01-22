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
import { _KTVConfigSchedules } from '@/features/ktv/consts';

export type DashboardKtvResponse = ResponseDataSuccessType<{
  booking: BookingItem | null;
  booking_ongoing: BookingItem | null;
  total_revenue_today: number;
  total_revenue_yesterday: number;
  total_booking_completed_today: number;
  total_booking_pending_today: number;
  review_today: ReviewItem[];
}>;
export type StartBookingResponse = ResponseDataSuccessType<{
  booking_id: string;
  start_time: string;
  duration: number;
}>;
export type BookingDetailsResponse = ResponseDataSuccessType<BookingItem>;

export type AllCategoriesResponse = ResponseDataSuccessType<CategoryItem[]>;

export type OptionCategory = {
  id: string;
  category_id: string;
  price: string;
  duration: number;
};

export type ServiceForm = {
  category_id: string;
  is_active: boolean;
  // Object đa ngôn ngữ
  name: IMultiLangField;
  description: IMultiLangField;
  // Ảnh (lưu ý: lúc form nhập có thể là null, nhưng khi submit là bắt buộc)
  image: IFileUpload;
};

export type ListServiceRequest = BaseSearchRequest<object>;

export type ListServiceResponse = ResponseDataSuccessType<Paginator<ServiceItem>>;

export type DetailServiceRequest = {
  id: string;
};
export type CancelBookingRequest = {
  booking_id: string;
  reason: string;
};

export type ServiceOption = {
  id: string;
  duration: number;
  price: string;
};
export type ServiceDetailItem = {
  id: string;
  name: Record<_LanguageCode, string>;
  category_id: string;
  description: Record<_LanguageCode, string>;
  image_url: string | null;
  bookings_count: number;
  is_active: boolean;
  options: ServiceOption[];
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
  phone: string;
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
  old_pass?: string;
  new_pass?: string;
};

export type DetailInfoKTVResponse = ResponseDataSuccessType<DetailInfoKTV>;

export type QRCodeAgencyResponse = ResponseDataSuccessType<{ agency_id: string }>;

export type KTVConfigSchedule = {
  id: string;
  ktv_id: string;
  working_schedule: {
    day_key: _KTVConfigSchedules;
    start_time: string;
    end_time: string;
    active: boolean;
  }[];
  is_working: boolean;
};

export type ConfigSchedulesResponse = ResponseDataSuccessType<KTVConfigSchedule>;
export type ListOptionCategoriesResponse = ResponseDataSuccessType<OptionCategory[]>;
export type EditConfigScheduleRequest = {
  working_schedule: {
    day_key: _KTVConfigSchedules;
    start_time: string;
    end_time: string;
    active: boolean;
  }[];
  is_working: boolean;
};
