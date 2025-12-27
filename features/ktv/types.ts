import { BaseSearchRequest, IFileUpload, IMultiLangField, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { BookingItem } from '@/features/booking/types';
import { CategoryItem, ReviewItem, ServiceItem } from '@/features/service/types';
import { _LanguageCode } from '@/lib/const';


export type DashboardKtvResponse = ResponseDataSuccessType<{
  booking: BookingItem | null;
  total_revenue_today: number;
  total_revenue_yesterday: number;
  total_booking_completed_today: number;
  total_booking_pending_today: number;
  review_today: ReviewItem[];
}>

export type AllCategoriesResponse = ResponseDataSuccessType<CategoryItem[]>

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
}

export type ListServiceRequest = BaseSearchRequest<object>

export type ListServiceResponse = ResponseDataSuccessType<Paginator<ServiceItem>>

export type DetailServiceRequest = {
  id: string;
}

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
}
export type ServiceDetailResponse = ResponseDataSuccessType<ServiceDetailItem>
