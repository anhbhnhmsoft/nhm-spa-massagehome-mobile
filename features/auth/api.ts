import { client } from '@/lib/axios-client';
import {
  AuthenticateRequest,
  AuthenticateResponse,
  DeviceInfoRequest,
  EditProfileRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOTPResponse, ResetPasswordRequest,
  SetLanguageRequest,
  VerifyOTPRequest,
} from '@/features/auth/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/auth';

const authApi = {
  /**
   * Hàm để xác thực user xem là login hay register
   */
  authenticate: async (data: AuthenticateRequest): Promise<AuthenticateResponse> => {
    const response = await client.post(`${defaultUri}/authenticate`, data);
    return response.data;
  },

  /**
   * Hàm để login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await client.post(`${defaultUri}/login`, data);
    return response.data;
  },

  /**
   * Hàm để quên mật khẩu
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await client.post(`${defaultUri}/forgot-password`, data);
    return response.data;
  },


  /**
   * Hàm để xác thực OTP register
   */
  verifyRegisterOTP: async (data: VerifyOTPRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/verify-otp-register`, data);
    return response.data;
  },

  /**
   * Hàm để xác thực OTP forgot password
   */
  verifyForgotPasswordOTP: async (data: VerifyOTPRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/verify-otp-forgot-password`, data);
    return response.data;
  },

  /**
   * Hàm để resend OTP register
   */
  resendRegisterOTP: async (data: AuthenticateRequest): Promise<ResendOTPResponse> => {
    const response = await client.post(`${defaultUri}/resend-otp-register`, data);
    return response.data;
  },

  /**
   * Hàm để resend OTP forgot password
   */
  resendForgotPasswordOTP: async (data: AuthenticateRequest): Promise<ResendOTPResponse> => {
    const response = await client.post(`${defaultUri}/resend-otp-forgot-password`, data);
    return response.data;
  },

  /**
   * Hàm để đăng ký user sau khi xác thực OTP
   * @param data
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await client.post(`${defaultUri}/register`, data);
    return response.data;
  },

  /**
   * Hàm để reset password sau khi xác thực OTP
   * @param data
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/reset-password`, data);
    return response.data;
  },

  /**
   * Hàm để lấy thông tin profile của user
   */
  profile: async (): Promise<ProfileResponse> => {
    const response = await client.get(`${defaultUri}/profile`);
    return response.data;
  },

  /**
   * Hàm để set language cho user
   */
  setLanguage: async (data: SetLanguageRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/set-language`, data);
    return response.data;
  },

  /**
   * Hàm để heartbeat user
   */
  heartbeat: async (): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/heartbeat`);
    return response.data;
  },

  /**
   * Hàm để set device info cho user
   */
  setDeviceInfo: async (data: DeviceInfoRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/set-device`, data);
    return response.data;
  },
  /**
   * Hàm để edit avatar cho user
   * @param data
   */
  editAvatar: async (data: FormData): Promise<ProfileResponse> => {
    const response = await client.post(`${defaultUri}/edit-avatar`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  /**
   * Hàm để xóa avatar cho user
   */
  deleteAvatar: async (): Promise<ProfileResponse> => {
    const response = await client.delete(`${defaultUri}/delete-avatar`);
    return response.data;
  },
  /**
   * Hàm để edit profile cho user
   */
  editProfile: async (data: EditProfileRequest): Promise<ProfileResponse> => {
    const response = await client.post(`${defaultUri}/edit-profile`, data);
    return response.data;
  },
  /**
   * Hàm để logout user
   */
  logout: async (): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/logout`);
    return response.data;
  },

  /**
   * Hàm để xóa account
   */
  lockAccount: async (): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/lock-account`);
    return response.data;
  },
};

export default authApi;
