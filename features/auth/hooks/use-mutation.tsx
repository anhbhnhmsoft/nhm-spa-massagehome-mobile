import { useMutation } from '@tanstack/react-query';
import {
  AuthenticateRequest,
  EditProfileRequest, ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest, ResetPasswordRequest,
  SetLanguageRequest,
  VerifyOTPRequest,
} from '@/features/auth/types';
import authApi from '@/features/auth/api';

/**
 * Hook để xác thực user xem là login hay register
 */
export const useAuthenticateMutation = () => {
  return useMutation({
    mutationFn: (data: AuthenticateRequest) => authApi.authenticate(data),
  });
};

/**
 * Hook để set language user
 */
export const useSetLanguageMutation = () => {
  return useMutation({
    mutationFn: (data: SetLanguageRequest) => authApi.setLanguage(data),
  });
};

/**
 * Hook để xác thực OTP register
 */
export const useVerifyRegisterOTPMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => authApi.verifyRegisterOTP(data),
  });
};

/**
 * Hook để resend OTP register
 */
export const useResendRegisterOTPMutation = () => {
  return useMutation({
    mutationFn: (data: AuthenticateRequest) => authApi.resendRegisterOTP(data),
  });
};

/**
 * Hook để đăng ký user sau khi xác thực OTP
 */
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
};

/**
 * Hook để login user
 */
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
};


/**
 * Hook để quên mật khẩu
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
  });
};

/**
 * Hook để xác thực user xem là login hay register
 */
export const useVerifyForgotPasswordOTPMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => authApi.verifyForgotPasswordOTP(data),
  });
};

/**
 * Hook để resend OTP forgot password
 */
export const useResendForgotPasswordOTPMutation = () => {
  return useMutation({
    mutationFn: (data: AuthenticateRequest) => authApi.resendForgotPasswordOTP(data),
  });
};

/**
 * Hook để reset password user
 */
export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
  });
};


/**
 * Hook để lấy thông tin profile user
 */
export const useProfileMutation = () => {
  return useMutation({
    mutationFn: () => authApi.profile(),
  });
};

/**
 * Hook để chỉnh sửa avatar user
 */
export const useMutationEditAvatar = () =>
  useMutation({
    mutationFn: (data: FormData) => authApi.editAvatar(data),
  });

/**
 * Hook để xóa avatar user
 */
export const useMutationDeleteAvatar = () =>
  useMutation({
    mutationFn: () => authApi.deleteAvatar(),
  });

/**
 * Hook để chỉnh sửa profile user
 */
export const useMutationEditProfile = () =>
  useMutation({
    mutationFn: (data: EditProfileRequest) => authApi.editProfile(data),
  });

/**
 * Hook để logout user
 */
export const useLogoutMutation = () =>
  useMutation({
    mutationFn: () => authApi.logout(),
  });

/**
 * Hook để xóa account
 */

export const useLockAccountMutation = () => {
  return useMutation({
    mutationFn: () => authApi.lockAccount(),
  });
};
