import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _LanguageCode } from '@/lib/const';
import { _Gender, _UserRole } from '@/features/auth/const';
import { _BookingStatus } from '@/features/service/const';

export type ListKTVItem = {
  id: string;
  name: string;
  phone: string;
  role: _UserRole;
  language: _LanguageCode;
  is_active: boolean;
  last_login_at: string | null;
  rating: number; // Điểm đánh giá trung bình
  review_count: number; // Số lượng đánh giá
  service_count: number; // Số lượng dịch vụ
  jobs_received_count: number; // Số lượng dịch vụ đã nhận
  profile: {
    avatar_url: string | null;
    date_of_birth: string | null; // ISO Date String
    gender: _Gender;
  };
  review_application: {
    address: string;
    experience: number;
    latitude: number;
    longitude: number;
    bio: string;
  };
};
export type KTVDetail = ListKTVItem & {
  display_image: {
    id: string;
    url: string;
  }[];
  first_review: {
    id: string;
    review_by: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
    comment: string| null;
    rating: number;
    created_at: string;
  } | null;
  booking_soon: string | null; // Thời gian hẹn sớm nhất
}

export type ListKTVRequest = BaseSearchRequest<{
  keyword?: string;
  category_id?: string;
  category_name?: string;
  lat?: number;
  lng?: number;
}>;


export type ListKTVResponse = ResponseDataSuccessType<Paginator<ListKTVItem>>;

export type DetailKTVResponse = ResponseDataSuccessType<KTVDetail>;


export type DashboardProfile = {
  "booking_count": {
    [key in _BookingStatus]: number;
  },
  "wallet_balance": string,
  "coupon_user_count": number
}
export type DashboardProfileResponse = ResponseDataSuccessType<DashboardProfile>;

export type ApplyPartnerRequest = {
  name?: string;
  apply_role?: string;
  reviewApplication?: {
    agency_id?: string;
    province_code?: string;
    address?: string;
    bio?: string;
  };
  files?: {
    type?: number;
    file_path: string;
  }[];
};

export type ApplyPartnerResponse = ResponseDataSuccessType<unknown>;
