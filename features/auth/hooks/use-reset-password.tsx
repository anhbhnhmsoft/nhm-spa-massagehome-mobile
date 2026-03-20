import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import { useResetPasswordMutation } from '@/features/auth/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { ResetPasswordRequest } from '@/features/auth/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { _TypeAuthenticate } from '@/features/auth/const';
import { useFormAuthStore } from '@/features/auth/stores';
import { useCallback, useEffect } from 'react';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useResetNav from '@/features/app/hooks/use-reset-nav';

export const useResetPassword = () => {
  const { t } = useTranslation();
  const { success: successToast } = useToast();
  const handleError = useErrorToast();

  const username = useFormAuthStore((state) => state.username_authenticate);
  const typeAuthenticate = useFormAuthStore((state) => state.type_authenticate);

  const resetState = useFormAuthStore((state) => state.resetState);

  const { mutate: resetPassword, isPending: pendingResetPassword } = useResetPasswordMutation();
  // reset navigation stack
  const resetNav = useResetNav();

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(
      z.object({
        username: z.string().min(1, { error: t('auth.error.phone_required') }),
        type_authenticate: z.nativeEnum(_TypeAuthenticate),
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
      username: username || '',
      type_authenticate: typeAuthenticate || _TypeAuthenticate.PHONE,
      password: '',
    },
  });

  // set username/type_authenticate vào form khi auth store thay đổi
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
    (data: ResetPasswordRequest) => {
      resetPassword(data, {
        onSuccess: () => {
          successToast({ message: t('auth.success.reset_password_success') });
          resetState();
          resetNav('/(auth)');
        },
        onError: (err) => {
          handleError(err);
        },
      });
    },
    [t]
  );

  return {
    form,
    onSubmit,
    loading: pendingResetPassword,
  };
};
