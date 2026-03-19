import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useReferralStore } from '@/features/affiliate/store';
import useToast from '@/features/app/hooks/use-toast';
import { useAuthStore, useFormAuthStore } from '@/features/auth/stores';
import { useRegisterMutation } from '@/features/auth/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { RegisterRequest } from '@/features/auth/types';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { _Gender, _TypeAuthenticate } from '@/features/auth/const';
import { _LanguageCode } from '@/lib/const';
import { useCallback } from 'react';
import { router } from 'expo-router';
import useResetNav from '@/features/app/hooks/use-reset-nav';

/**
 * Hàm để đăng ký user
 */
export const useHandleRegister = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();

  const clearUserReferral = useReferralStore((state) => state.clearUserReferral);

  // handle success toast khi gọi API thành công
  const { success } = useToast();

  // Lấy username/type_authenticate từ auth store khi submit form verify OTP
  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);

  const resetState = useFormAuthStore((state) => state.resetState);

  const login = useAuthStore((state) => state.login);

  const resetNav = useResetNav();

  // mutate function để gọi API đăng ký user
  const mutationRegister = useRegisterMutation();

  // form hook để validate và submit form
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(
      z.object({
        username: z.string().min(1),
        type_authenticate: z.enum(_TypeAuthenticate),
        name: z.string().min(1, { error: t('auth.error.name_required') }),
        password: z
          .string()
          .min(1, { message: t('auth.error.password_invalid') })
          .min(8, { message: t('auth.error.password_invalid') })
          .regex(/[a-z]/, { message: t('auth.error.password_invalid') })
          .regex(/[A-Z]/, { message: t('auth.error.password_invalid') })
          .regex(/[0-9]/, { message: t('auth.error.password_invalid') }),
        referral_code: z.string().optional().nullable(),
        gender: z.enum(_Gender, {
          error: t('auth.error.gender_invalid'),
        }),
        language: z.enum(_LanguageCode, {
          error: t('auth.error.language_invalid'),
        }),
      })
    ),
    defaultValues: {
      username: username || '',
      type_authenticate: typeAuthenticate || _TypeAuthenticate.PHONE,
      name: '',
      password: '',
      gender: _Gender.MALE,
      language: _LanguageCode.VI,
    },
  });

  // handle submit form
  const onSubmit = useCallback((data: RegisterRequest) => {
    mutationRegister.mutate(data, {
      onSuccess: async (res) => {
        success({
          message: t('auth.success.register_success'),
        });
        // Sau khi login thành công thì clear user referral
        clearUserReferral();
        // Reset state form auth store
        resetState();
        // Lưu user vào auth store
        await login(res.data);
        // Sau khi login thành công thì redirect về màn hình home
        resetNav('/(app)/(customer)/(tab)');
      },
      onError: (err) => {
        handleError(err);
      },
    });
  }, []);

  return {
    form,
    onSubmit,
    loading: mutationRegister.isPending,
  };
};
