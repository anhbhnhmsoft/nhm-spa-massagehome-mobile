import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useToast from '@/features/app/hooks/use-toast';
import { useAuthStore, useFormAuthStore } from '@/features/auth/stores';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { LoginRequest } from '@/features/auth/types';
import z from 'zod';
import { useForgotPasswordMutation, useLoginMutation } from '@/features/auth/hooks/use-mutation';
import { _UserRole } from '@/features/auth/const';
import useResetNav from '@/features/app/hooks/use-reset-nav';
import { router } from 'expo-router';

/**
 * Hàm để đăng nhập user
 */

export const useHandleLogin = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // set phone_authen vào auth store khi submit form
  const phone = useFormAuthStore((state) => state.phone_authenticate);

  // update state form auth store khi gọi API thành công
  const updateStateForm = useFormAuthStore((state) => state.updateState);

  // reset state form auth store khi gọi API login thành công
  const resetState = useFormAuthStore((state) => state.resetState);

  // handle success toast khi gọi API thành công
  const { success: successToast, error: errorToast } = useToast();

  // reset navigation stack
  const resetNav = useResetNav();

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

  // mutate function để gọi API xác thực user
  const { mutate: mutateLogin, isPending: pendingLogin } = useLoginMutation();

  const { mutate: mutateForgotPassword, isPending: pendingForgotPassword } = useForgotPasswordMutation();

  // handle submit form
  const onSubmit = useCallback((data: LoginRequest) => {
    mutateLogin(data, {
      onSuccess: async (res) => {
        try {
          const data = res.data;
          const user = data.user;
          await login(data);
          successToast({
            message: t('auth.success.login_success'),
          });
          resetState();
          if (user.role === _UserRole.CUSTOMER) {
            return resetNav('/(app)/(customer)/(tab)');
          } else if (user.role === _UserRole.KTV) {
            return resetNav('/(app)/(ktv)/(tab)');
          } else if (user.role === _UserRole.AGENCY) {
            return resetNav('/(app)/(tab-agency)');
          } else {
            errorToast({ message: t('common_error.unknown_error') });
          }
        } catch {
          errorToast({ message: t('common_error.unknown_error') });
        }
      },
      onError: (err) => {
        handleError(err);
      },
    });
  }, []);

  // handle submit forgot password
  const onForgotPassword = useCallback(() => {
    if (!phone) {
      errorToast({ message: t('auth.error.phone_required') });
      return;
    }
    mutateForgotPassword({ phone }, {
      onSuccess: (res) => {
        const dataResponse = res.data;
        const caseHandle = dataResponse.case;
        // case nếu đã verify otp trước đó, chuyển hướng đến reset password
        if (caseHandle === 'need_re_enter_reset_password') {
          router.replace('/(auth)/reset-password');
        }
        // case nếu chưa verify otp, chuyển hướng đến verify otp
        else if (caseHandle === "success" || caseHandle === "need_re_enter_otp"){
          if (dataResponse.last_sent_at && dataResponse.retry_after_seconds) {
            updateStateForm({
              case_verify_otp: "forgot_password",
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
  }, [phone]);

  return {
    form,
    onSubmit,
    onForgotPassword,
    loading: pendingLogin || pendingForgotPassword,
  };
};
