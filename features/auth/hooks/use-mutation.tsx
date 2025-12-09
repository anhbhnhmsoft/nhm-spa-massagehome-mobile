import { useMutation } from '@tanstack/react-query';
import {
  AuthenticateRequest, LoginRequest,
  RegisterRequest,
  SetLanguageRequest,
  VerifyRegisterOTPRequest,
} from '@/features/auth/types';
import authApi from '@/features/auth/api';


export const useAuthenticateMutation = () => {
  return useMutation({
    mutationFn: (data: AuthenticateRequest) => authApi.authenticate(data),
  });
};

export const useSetLanguageMutation = () => {
  return useMutation({
    mutationFn: (data: SetLanguageRequest) => authApi.setLanguage(data),
  });
};

/**
 * Hook để xác thực user xem là login hay register
 */
export const useVerifyRegisterOTPMutation = () => {
  return useMutation({
    mutationFn: (data: VerifyRegisterOTPRequest) => authApi.verifyRegisterOTP(data),
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








