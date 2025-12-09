import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _LanguageCode } from '@/lib/const';
import { _Gender, _UserRole } from '@/features/auth/const';

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
    skills: string[];
    experience: number;
    latitude: number;
    longitude: number;
    bio: string;
  };
};

export type ListKTVRequest = BaseSearchRequest<{}>;

export type ListKTVResponse = ResponseDataSuccessType<Paginator<ListKTVItem>>;

export type DetailKTVResponse = ResponseDataSuccessType<ListKTVItem>;
