import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import { useResetPasswordMutation } from '@/features/auth/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { ResetPasswordRequest } from '@/features/auth/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormAuthStore } from '@/features/auth/stores';
import { useCallback, useEffect } from 'react';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useResetNav from '@/features/app/hooks/use-reset-nav';


export const useResetPassword = () => {
  const {t} = useTranslation();
  const { success: successToast } = useToast();
  const handleError = useErrorToast();

  const phone = useFormAuthStore((state) => state.phone_authenticate);

  const resetState = useFormAuthStore((state) => state.resetState);

  const { mutate: resetPassword, isPending: pendingResetPassword } = useResetPasswordMutation();
  // reset navigation stack
  const resetNav = useResetNav();

  const form = useForm<ResetPasswordRequest>({
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
      }),
    ),
    defaultValues: {
      phone: phone || '',
      password: '',
    },
  });

  // set phone_authen vào form khi phone_authen thay đổi
  useEffect(() => {
    if (!phone) return;
    form.setValue('phone', phone);
  }, [phone]);

  // handle submit form
  const onSubmit = useCallback((data: ResetPasswordRequest) => {
    resetPassword(data, {
      onSuccess: () => {
        successToast({ message: t('auth.success.reset_password_success') });
        resetState();
        resetNav('/(auth)')
      },
      onError: (err) => {
        handleError(err);
      },
    });
  }, [t]);

  return {
    form,
    onSubmit,
    loading: pendingResetPassword,
  }
}