import {
  BaseSearchRequest,
  IMultiLangField,
  Paginator,
  ResponseDataSuccessType,
} from '@/lib/types';
import { _LanguageCode } from '@/lib/const';
import { _Gender, _UserRole } from '@/features/auth/const';
import { _BookingStatus } from '@/features/service/const';
import { _PartnerFileType } from './const';
import { _KTVConfigSchedules } from '@/features/ktv/consts';

export type KTVWorkSchedule = {
  is_working: boolean;
  schedule_time: {
    day_key: _KTVConfigSchedules;
    start_time: string;
    end_time: string;
    active: boolean;
  }[];
};

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
  schedule: KTVWorkSchedule;
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
    comment: string | null;
    rating: number;
    created_at: string;
  } | null;
  booking_soon: string | null; // Thời gian hẹn sớm nhất
};

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
  booking_count: {
    [key in _BookingStatus]: number;
  };
  wallet_balance: string;
  coupon_user_count: number;
};
export type DashboardProfileResponse = ResponseDataSuccessType<DashboardProfile>;

export type ApplyPartnerRequest = {
  role: _UserRole.KTV | _UserRole.AGENCY;
  referrer_id?: string | undefined;
  province_code: string;
  address: string;
  latitude?: string | undefined;
  longitude?: string | undefined;
  experience: number;
  is_leader?: boolean;
  bio: IMultiLangField;
  file_uploads: {
    type_upload: _PartnerFileType;
    file: {
      uri: string; // local uri
      name: string; // filename
      type: string; // mime type
    };
  }[];
};

export type ApplyPartnerResponse = ResponseDataSuccessType<unknown>;
