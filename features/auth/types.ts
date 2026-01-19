import { _Gender, _UserRole } from '@/features/auth/const';
import { _LanguageCode } from '@/lib/const';
import { ResponseDataSuccessType } from '@/lib/types';

export type User = {
  id: string;
  name: string;
  phone: string;
  disabled: boolean;
  role: _UserRole;
  referral_code: string;
  language: _LanguageCode;
  referred_by_user_id: string;
  referrer: {
    id: string;
    name: string;
  } | null;
  review_application: {
    status: number;
    is_leader: boolean;
  } | null;
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
  need_register: boolean;
  expire_minutes: number | null; // Thời gian hết hạn của OTP
  number_of_attempts: number; // Số lần nhập sai OTP
}>;

export type ResendRegisterOTPResponse = ResponseDataSuccessType<{
  expire_minutes: number | null; // Thời gian hết hạn của OTP
}>;

export type VerifyRegisterOTPRequest = {
  phone: string;
  otp: string;
};

export type VerifyRegisterOTPResponse = ResponseDataSuccessType<{
  token: string;
}>;

export type RegisterRequest = {
  token: string;
  name: string;
  password: string;
  referral_code?: string | null;
  gender: _Gender;
  language: _LanguageCode;
};

export type RegisterResponse = ResponseDataSuccessType<AuthData>;

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = ResponseDataSuccessType<AuthData>;

export type ProfileResponse = ResponseDataSuccessType<{
  user: User;
}>;

export type SetLanguageRequest = {
  lang: _LanguageCode;
};

export type DeviceInfoRequest = {
  platform: 'ios' | 'android';
  device_id: string;
  device_name: string;
  token: string;
};

export type EditProfileRequest = {
  name?: string;
  date_of_birth?: string;
  gender?: _Gender;
  bio?: string;
  old_password?: string;
  new_password?: string;
};
