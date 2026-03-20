import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useToast from '@/features/app/hooks/use-toast';
import { useFormAuthStore } from '@/features/auth/stores';
import {
  useResendForgotPasswordOTPMutation,
  useResendRegisterOTPMutation,
  useVerifyForgotPasswordOTPMutation,
  useVerifyRegisterOTPMutation,
} from '@/features/auth/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { ResendOTPResponse, VerifyOTPRequest } from '@/features/auth/types';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { _TypeAuthenticate } from '@/features/auth/const';
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import dayjs from 'dayjs';

/**
 * Hàm để xác thực OTP
 */
export const useHandleVerifyOtp = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // handle success toast khi gọi API thành công
  const { success: successToast, error: errorToast } = useToast();

  // set username/type_authenticate vào auth store khi submit form
  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);

  const caseVerifyOtp = useFormAuthStore((state) => state.case_verify_otp);

  // mutate function để gọi API xác thực đăng ký
  const { mutateAsync: verifyRegisterOTP, isPending: loadingVerifyOTPRegister } =
    useVerifyRegisterOTPMutation();

  // mutate function để gọi API xác thực quên mật khẩu
  const { mutateAsync: verifyForgotPasswordOTP, isPending: loadingVerifyOTPForgotPassword } =
    useVerifyForgotPasswordOTPMutation();

  // form hook để validate và submit form
  const form = useForm<VerifyOTPRequest>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        username: z.string().min(1, { error: t('auth.error.phone_required') }),
        type_authenticate: z.nativeEnum(_TypeAuthenticate),
        otp: z
          .string()
          .min(1, { error: t('auth.error.otp_required') })
          .regex(/^[0-9]+$/, { error: t('auth.error.otp_invalid') })
          .min(6, { error: t('auth.error.otp_min') })
          .max(6, { error: t('auth.error.otp_max') }),
      })
    ),
    defaultValues: {
      username: '',
      type_authenticate: _TypeAuthenticate.PHONE,
      otp: '',
    },
  });

  // set username/type_authenticate vào form khi submit form
  useEffect(() => {
    if (username) {
      form.setValue('username', username);
    }
    if (typeAuthenticate) {
      form.setValue('type_authenticate', typeAuthenticate);
    }
  }, [username, typeAuthenticate]);

  // handle submit form
  const onSubmit = useCallback(
    async (data: VerifyOTPRequest) => {
      if (!caseVerifyOtp) return;

      try {
        switch (caseVerifyOtp) {
          case 'register':
            await verifyRegisterOTP(data);
            successToast({ message: t('auth.success.verify_otp') });
            router.replace('/(auth)/register');
            break;
          case 'forgot_password':
            await verifyForgotPasswordOTP(data);
            successToast({ message: t('auth.success.verify_otp') });
            router.replace('/(auth)/reset-password');
            break;
          default:
            errorToast({ message: t('common_error.unknown_error') });
            return;
        }
      } catch (error) {
        handleError(error);
      }
    },
    [caseVerifyOtp, t]
  );

  return {
    username,
    typeAuthenticate,
    form,
    onSubmit,
    loading: loadingVerifyOTPRegister || loadingVerifyOTPForgotPassword,
  };
};

/**
 * Resend OTP Logic
 */
export const useHandleResendOtp = () => {
  const { t } = useTranslation();
  const { success: successToast, error: errorToast } = useToast();
  const handleError = useErrorToast();

  // State để lưu trữ thời gian chờ resend OTP
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Form state
  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);
  const lastSentAt = useFormAuthStore((state) => state.last_sent_at);
  const retryAfterSeconds = useFormAuthStore((state) => state.retry_after_seconds);
  const setFormAuthStore = useFormAuthStore((state) => state.updateState);
  const caseVerifyOtp = useFormAuthStore((state) => state.case_verify_otp);

  // mutate function để gọi API resend OTP đăng ký
  const { mutateAsync: resendOTPRegister, isPending: loadingResendOTPRegister } =
    useResendRegisterOTPMutation();

  const { mutateAsync: resendOTPForgotPassword, isPending: loadingResendOTPForgotPassword } =
    useResendForgotPasswordOTPMutation();

  // useEffect để tính toán thời gian chờ resend OTP
  useEffect(() => {
    const calculateTime = () => {
      if (!lastSentAt || !retryAfterSeconds) {
        return 60; // Nếu không có lastSentAt hoặc retryAfterSeconds, mặc định là 60 giây
      }
      const lastSent = dayjs(lastSentAt);
      const now = dayjs(); // Lấy thời gian hiện tại của thiết bị
      const nextAllowedTime = lastSent.add(retryAfterSeconds, 'second');

      const diff = nextAllowedTime.diff(now, 'second');

      return diff > 0 ? diff : 0;
    };

    // Khởi tạo giá trị ban đầu
    setSecondsLeft(calculateTime());

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSentAt, retryAfterSeconds]);

  // handle resend OTP
  const resendOTP = useCallback(async () => {
    if (!username || !typeAuthenticate || !caseVerifyOtp || secondsLeft > 0) return;
    try {
      let response: ResendOTPResponse | undefined;
      // 2. Chỉ switch để chọn API cần gọi
      switch (caseVerifyOtp) {
        case 'register':
          response = await resendOTPRegister({ username, type_authenticate: typeAuthenticate });
          break;
        case 'forgot_password':
          response = await resendOTPForgotPassword({
            username,
            type_authenticate: typeAuthenticate,
          });
          break;
        default:
          errorToast({ message: t('common_error.unknown_error') });
          return;
      }

      const data = response?.data;
      if (data?.last_sent_at) {
        setFormAuthStore({
          last_sent_at: data.last_sent_at,
        });
      }

      successToast({
        message: t('auth.success.resend_otp'),
      });
    } catch (error) {
      handleError(error);
    }
  }, [secondsLeft, caseVerifyOtp, t]);

  return {
    resendOTP,
    secondsLeft,
    loading: loadingResendOTPRegister || loadingResendOTPForgotPassword,
  };
};
