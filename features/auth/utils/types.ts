import { ResponseDataSuccessType } from '@/lib/types';
import { _LanguageCode } from '@/lib/const';
import { _Gender, _UserRole } from '@/features/auth/utils/constants';


export type User = {
  id: string;
  name: string;
  phone: string;
  disabled: boolean;
  role: _UserRole;
  referral_code: string;
  language: _LanguageCode;
  referred_by_user_id: string;
  affiliate_link: string | null;
  profile: {
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: _Gender | null;
    bio: string | null;
  };
  primary_location: {
    address: string;
    latitude: string;
    longitude: string;
    desc: string | null;
  } | null;
};

export type AuthData = {
  token: string;
  user: User;
};

export type AuthenticateRequest = {
  phone: string;
};

export type AuthenticateResponse = ResponseDataSuccessType<{
  case: "need_login" | "need_register" | "need_re_enter_otp";
  expired_at?: string; // Thời gian hết hạn của OTP
}>;

export type MeResponse = ResponseDataSuccessType<{
  user: User;
}>;

