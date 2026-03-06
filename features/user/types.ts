import {
  BaseSearchRequest, IFileUpload,
  IMultiLangField,
  Paginator,
  ResponseDataSuccessType,
} from '@/lib/types';
import { _LanguageCode } from '@/lib/const';
import { _Gender, _UserRole } from '@/features/auth/const';
import { _BookingStatus } from '@/features/service/const';
import { _PartnerFileType, _ReviewApplicationStatus } from './const';
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
    experience: number;
    bio: string;
  };
  location: {
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  schedule: KTVWorkSchedule;
};


export type ServiceCategoryItem = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  booking_count: number;
  prices: {
    id: string;
    price: string;
    duration: number;
  }[];
}
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
  price_transportation: number ; // Giá vận chuyển
  service_categories: ServiceCategoryItem[];
  on_going_booking: { // Dịch vụ đang diễn ra (nếu có)
    id: string;
    start_time: string; // ISO Date String
    duration: number;
    expect_end_time: string; // ISO Date String
  } | null;
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


export type CheckApplyPartnerResponse = ResponseDataSuccessType<{
  can_apply: boolean;
  review_application: {
    id: string;
    user_id: string;
    nickname: string;
    referrer_id: string | null;
    experience: number;
    reason_cancel?: string;
    status: _ReviewApplicationStatus;
    role: _UserRole.KTV | _UserRole.AGENCY;
    bio: IMultiLangField;
    is_leader: boolean;
    application_date: string; // ISO Date String
    gallery: string[] | null; // Array of image URLs
    cccd_front: string | null; // URL of front side of CCCD
    cccd_back: string | null; // URL of back side of CCCD
    face_with_identity_card: string | null; // URL of face with identity card
    certificate: string | null; // URL of certificate
    address: string | null;
    latitude?: number;
    longitude?: number;
  } | null;
}>;

export type FileUploadItem = {
  type_upload: _PartnerFileType;
  file: IFileUpload;
}

export type ApplyPartnerRequest = {
  role: _UserRole.KTV | _UserRole.AGENCY;
  nickname?: string;
  referrer_id?: string | undefined;
  experience?: number;
  is_leader?: boolean;
  bio: IMultiLangField;
  file_uploads: {
    type_upload: _PartnerFileType;
    file: {
      uri: string; // local uri
      name: string; // filename
      type: string; // mime type
      token?: string; // token for private image upload
    };
  }[];
};


export type ApplyTechnicalRequest = {
  nickname: string;
  referrer_id?: string;
  is_leader?: boolean;
  experience: number;
  bio: string;
  dob: string;
  avatar: IFileUpload;
  file_uploads: FileUploadItem[];
};

export type ApplyAgencyRequest = {
  nickname: string;
  address: string;
  latitude: number;
  longitude: number;
  file_uploads: FileUploadItem[];
};

export type ApplyPartnerResponse = ResponseDataSuccessType<unknown>;
