import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useFormAuthStore } from '@/features/auth/stores';
import { useAuthenticateMutation } from '@/features/auth/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { AuthenticateRequest } from '@/features/auth/types';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useCallback } from 'react';
import { router } from 'expo-router';
import useToast from '@/features/app/hooks/use-toast';

/**
 * Hàm để xác thực user xem là login hay register
 */
export const useHandleAuthenticate = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const {error: errorToast} = useToast();
  const handleError = useErrorToast();
  // set state vào auth store khi submit form
  const updateStateForm = useFormAuthStore((state) => state.updateState);
  // mutate function để gọi API xác thực user
  const { mutate, isPending } = useAuthenticateMutation();
  // form hook để validate và submit form
  const form = useForm<AuthenticateRequest>({
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .min(1, { error: t('auth.error.phone_required') })
          .regex(/^[0-9]+$/, { error: t('auth.error.phone_invalid') })
          .min(9, { error: t('auth.error.phone_min') })
          .max(12, { error: t('auth.error.phone_max') }),
      })
    ),
    defaultValues: {
      phone: '',
    },
  });
  // handle submit form
  const onSubmit = useCallback((data: AuthenticateRequest) => {
    mutate(data, {
      onSuccess: (res) => {
        const dataResponse = res.data;
        const caseHandle = dataResponse.case;
        // Lưu phone_authenticate vào auth store khi submit form
        updateStateForm({
          phone_authenticate: data.phone,
        });
        // case need_login: redirect về màn hình login
        if (caseHandle === "need_login"){
          router.push('/(auth)/login');
        }
        // case need_re_enter_register: redirect về màn hình register
        else if (caseHandle === "need_re_enter_register"){
          router.replace('/(auth)/register');
        }
        // case need_register hoặc need_re_enter_otp: redirect về màn hình verify OTP
        else if (caseHandle === "need_register" || caseHandle === "need_re_enter_otp"){
          if (dataResponse.last_sent_at && dataResponse.retry_after_seconds) {
            updateStateForm({
              case_verify_otp: "register",
              last_sent_at: dataResponse.last_sent_at,
              retry_after_seconds: dataResponse.retry_after_seconds,
            });
            router.replace('/(auth)/verify-otp');
          }else{
            errorToast({
              message: t('common_error.unknown_error'),
            })
          }
        }
      },
      onError: (err) => {
        handleError(err);
      },
    });
  }, []);

  return {
    form,
    onSubmit,
    loading: isPending,
  };
};