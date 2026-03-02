import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useToast from '@/features/app/hooks/use-toast';
import { useAuthStore, useFormAuthStore } from '@/features/auth/stores';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { router } from 'expo-router';
import { LoginRequest } from '@/features/auth/types';
import z from 'zod';
import { useLoginMutation } from '@/features/auth/hooks/use-mutation';

/**
 * Hàm để đăng nhập user
 */

export const useHandleLogin = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // set phone_authen vào auth store khi submit form
  const phone = useFormAuthStore((state) => state.phone_authenticate);
  // handle success toast khi gọi API thành công
  const { success, error } = useToast();
  // set login vào auth store khi submit form
  const login = useAuthStore((state) => state.login);
  // form hook để validate và submit form
  const form = useForm<LoginRequest>({
    resolver: zodResolver(
      z.object({
        phone: z
          .string()
          .min(1, { error: t('auth.error.phone_required') })
          .regex(/^[0-9]+$/, { error: t('auth.error.phone_invalid') })
          .min(9, { error: t('auth.error.phone_min') })
          .max(12, { error: t('auth.error.phone_max') }),
        password: z
          .string()
          .min(1, { message: t('auth.error.password_invalid') })
          .min(8, { message: t('auth.error.password_invalid') })
          .regex(/[a-z]/, { message: t('auth.error.password_invalid') })
          .regex(/[A-Z]/, { message: t('auth.error.password_invalid') })
          .regex(/[0-9]/, { message: t('auth.error.password_invalid') }),
      })
    ),
    defaultValues: {
      phone: phone || '',
      password: '',
    },
  });
  // mutate function để gọi API xác thực user
  const { mutate, isPending } = useLoginMutation();
  // handle submit form
  const onSubmit = useCallback((data: LoginRequest) => {
    mutate(data, {
      onSuccess: (res) => {
        // Sau khi đăng ký thành công thì login user
        login(res.data)
          .then(() => {
            success({
              message: t('auth.success.login_success'),
            });
            // Sau khi login thành công thì redirect về màn hình home
            router.push('/(app)/(tab)');
          })
          .catch((err) => {
            error({
              message: t('auth.error.register_failed'),
            });
          });
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
