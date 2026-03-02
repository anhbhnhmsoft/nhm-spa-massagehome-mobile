import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useToast from '@/features/app/hooks/use-toast';
import { useFormAuthStore } from '@/features/auth/stores';
import { useResendRegisterOTPMutation, useVerifyRegisterOTPMutation } from '@/features/auth/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { VerifyRegisterOTPRequest } from '@/features/auth/types';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import dayjs from 'dayjs';

/**
 * Hàm để xác thực OTP đăng ký
 */
export const useHandleVerifyRegisterOtp = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // handle success toast khi gọi API thành công
  const { success } = useToast();

  // set phone_authen vào auth store khi submit form
  const phone = useFormAuthStore((state) => state.phone_authenticate);

  // mutate function để gọi API xác thực user
  const mutationVerifyRegisterOTP = useVerifyRegisterOTPMutation();

  // form hook để validate và submit form
  const form = useForm<VerifyRegisterOTPRequest>({
    mode: 'onChange',
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .min(1, { error: t('auth.error.phone_required') })
          .regex(/^[0-9]+$/, { error: t('auth.error.phone_invalid') })
          .min(9, { error: t('auth.error.phone_min') })
          .max(12, { error: t('auth.error.phone_max') }),
        otp: z
          .string()
          .min(1, { error: t('auth.error.otp_required') })
          .regex(/^[0-9]+$/, { error: t('auth.error.otp_invalid') })
          .min(6, { error: t('auth.error.otp_min') })
          .max(6, { error: t('auth.error.otp_max') }),
      }),
    ),
    defaultValues: {
      phone: '',
      otp: '',
    },
  });

  // set phone_authen vào form khi submit form
  useEffect(() => {
    if (phone) {
      form.setValue('phone', phone);
    }
  }, [phone]);

  // handle submit form
  const onSubmit = useCallback((data: VerifyRegisterOTPRequest) => {
    mutationVerifyRegisterOTP.mutate(data, {
      onSuccess: () => {
        success({
          message: t('auth.success.verify_register_otp'),
        });
        router.replace('/(auth)/register');
      },
      onError: (err) => {
        handleError(err);
      },
    });
  }, []);

  /**
   * ---------- Resend OTP Logic ----------
   */
  const lastSentAt = useFormAuthStore((state) => state.last_sent_at);
  const retryAfterSeconds = useFormAuthStore((state) => state.retry_after_seconds);
  const setFormAuthStore = useFormAuthStore(state => state.updateState);
  const mutationResendRegisterOTP = useResendRegisterOTPMutation();

  const [secondsLeft, setSecondsLeft] = useState(0);

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
  const resendOTP = useCallback(() => {
    if (phone && secondsLeft === 0) {
      mutationResendRegisterOTP.mutate({ phone: phone },
        {
          onSuccess: (res) => {
            const data = res.data;
            if (data.last_sent_at && data.retry_after_seconds){
              setFormAuthStore({
                last_sent_at: data.last_sent_at,
                retry_after_seconds: data.retry_after_seconds,
              });
            }
            success({
              message: t('auth.success.resend_otp'),
            });
          },
          onError: (err) => {
            handleError(err);
          },
        },
      );
    }
  }, [phone, secondsLeft]);

  return {
    phone,
    secondsLeft,
    form,
    onSubmit,
    resendOTP,
    loading: mutationVerifyRegisterOTP.isPending || mutationResendRegisterOTP.isPending,
  };
};