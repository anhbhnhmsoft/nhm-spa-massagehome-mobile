import useAuthStore from '@/features/auth/store';
import { _AuthStatus, _Gender } from '@/features/auth/const';
import { useHeartbeatQuery, useProfileQuery } from '@/features/auth/hooks/use-query';
import useToast from '@/features/app/hooks/use-toast';
import { ForwardedRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useApplicationStore from '@/lib/store';
import { _LanguageCode } from '@/lib/const';
import {
  useAuthenticateMutation, useLoginMutation, useRegisterMutation, useResendRegisterOTPMutation,
  useSetLanguageMutation, useVerifyRegisterOTPMutation,
} from '@/features/auth/hooks/use-mutation';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AuthenticateRequest, LoginRequest, RegisterRequest, VerifyRegisterOTPRequest } from '@/features/auth/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import useErrorToast from '@/features/app/hooks/use-error-toast';

/**
 * Hàm để xác thực user xem là login hay register
 */
export const useHandleAuthenticate = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // set phone_authen vào auth store khi submit form
  const setPhoneAuthen = useAuthStore((state) => state.setPhoneAuthen);
  // set expire_minutes vào auth store khi submit form
  const setExpireMinutes = useAuthStore((state) => state.setExpireMinutes);
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
        // Nếu cần đăng ký thì redirect đến màn hình xác thực OTP
        const needRegister = res.data?.need_register || false;
        setPhoneAuthen(data.phone);
        if (needRegister) {
          // Lưu expire_minutes vào auth store khi submit form
          const expireMinutes = res.data?.expire_minutes || null;
          setExpireMinutes(expireMinutes);
          // Nếu cần đăng ký thì redirect đến màn hình xác thực OTP
          router.replace('/(auth)/verify-otp');
        } else {
          // Nếu không cần đăng ký thì redirect đến màn hình login
          router.replace('/(auth)/login');
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

/**
 * Hàm để đăng nhập user
 */
export const useHandleLogin = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // set phone_authen vào auth store khi submit form
  const phone = useAuthStore((state) => state.phone_authen);
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
        password: z.string()
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
        login(res.data).then(() => {
          success({
            message: t('auth.success.login_success'),
          });
          // Sau khi login thành công thì redirect về màn hình home
          router.replace('/(tab)');
        }).catch((err) => {
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
}

/**
 * Hàm để xác thực OTP đăng ký
 */
export const useHandleVerifyRegisterOtp = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // handle success toast khi gọi API thành công
  const {success} = useToast();

  // set phone_authen vào auth store khi submit form
  const phoneAuthen = useAuthStore((state) => state.phone_authen);

  // set token_register vào auth store khi submit form
  const setTokenRegister = useAuthStore((state) => state.setTokenRegister);

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
      })
    ),
    defaultValues: {
      phone: '',
      otp: '',
    },
  });

  // set phone_authen vào form khi submit form
  useEffect(() => {
    if (phoneAuthen) {
      form.setValue('phone', phoneAuthen);
    }
  }, [phoneAuthen]);

  // handle submit form
  const onSubmit = useCallback((data: VerifyRegisterOTPRequest) => {
    mutationVerifyRegisterOTP.mutate(data, {
      onSuccess: (res) => {
        setTokenRegister(res.data.token);
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
    // mutate function để gọi API resend OTP register
  const mutationResendRegisterOTP = useResendRegisterOTPMutation();
  // Timer để đếm ngược thời gian resend OTP
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: number;

    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // handle resend OTP
  const resendOTP = () => {
    if (phoneAuthen && timer === 0) {
      mutationResendRegisterOTP.mutate({
        phone: phoneAuthen,
      }, {
        onSuccess: () => {
          success({
            message: t('auth.success.resend_otp'),
          });
          setTimer(60);
        },
        onError: (err) => {
          handleError(err);
        },
      });
    }
  };


  return{
    phoneAuthen,
    timer,
    form,
    onSubmit,
    resendOTP,
    loading: mutationVerifyRegisterOTP.isPending || mutationResendRegisterOTP.isPending,
  }
}

/**
 * Hàm để đăng ký user
 */
export const useHandleRegister = () => {
  const { t } = useTranslation();
  // handle error toast khi gọi API thất bại
  const handleError = useErrorToast();
  // handle success toast khi gọi API thành công
  const { success, error } = useToast();
  // Lấy token_register từ auth store khi submit form verify OTP
  const tokenRegister = useAuthStore((state) => state.token_register);

  const login = useAuthStore((state) => state.login);

  // mutate function để gọi API đăng ký user
  const mutationRegister = useRegisterMutation();

  // form hook để validate và submit form
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(
      z.object({
        token: z.string().min(1),
        name: z.string().min(1, { error: t('auth.error.name_required') }),
        password: z.string()
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
      token: tokenRegister || '',
      name: '',
      password: '',
      gender: _Gender.MALE,
      language: _LanguageCode.VI,
    },
  });

  // handle submit form
  const onSubmit = useCallback((data: RegisterRequest) => {
    mutationRegister.mutate(data, {
      onSuccess: (res) => {
        // Sau khi đăng ký thành công thì login user
        login(res.data).then(() => {
          success({
            message: t('auth.success.register_success'),
          });
          // Sau khi login thành công thì redirect về màn hình home
          router.replace('/(tab)');
        }).catch((err) => {
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

  return{
    form,
    onSubmit,
    loading: mutationRegister.isPending,
  }
}

/**
 * Hook để kiểm tra xem user có đang được xác thực hay không
 */
export const useCheckAuth = () => {
  const status = useAuthStore((state) => state.status);
  return status === _AuthStatus.AUTHORIZED;
};

/**
 * Hook để hydrate auth state từ local storage
 */
export const useHydrateAuth = () => {
  const { hydrate, setUser, _hydrated, logout, status } = useAuthStore();

  const { refetch, data, isError, isSuccess, error: errorQuery } = useProfileQuery();

  const { error } = useToast();

  const [complete, setComplete] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    // hydrate auth store và refetch profile query khi app ready
    if (!_hydrated) {
      hydrate();
    }
    if (status === _AuthStatus.AUTHORIZED) {
      refetch();
    }
  }, [_hydrated]);

  useEffect(() => {
    // Nếu đã hydrate rồi và không có lỗi thì set user vào store
    if (_hydrated) {
      if (status === _AuthStatus.AUTHORIZED) {
        if (isSuccess && data) {
          // Nếu có dữ liệu user thì set vào store
          setUser(data).finally(() => {
            // Sau khi set user thành công thì set complete thành true
            setComplete(true);
          });
        }
        if (isError) {
          // Nếu có lỗi thì logout
          error({
            message: t('common_error.invalid_or_expired_token'),
          });
          logout();
          setComplete(true);
        }
      } else {
        setComplete(true);
      }
    }
  }, [_hydrated, status, isError, data, isSuccess, errorQuery]);

  return {
    complete,
    status,
  };
};

/**
 * Hook để set ngôn ngữ user
 */
export const useSetLanguageUser = (ref: ForwardedRef<BottomSheetModal>) => {
  const { t } = useTranslation();
  // Lấy ngôn ngữ hiện tại từ store
  const selectedLang = useApplicationStore((state) => state.language);

  // Lấy hàm set ngôn ngữ từ store
  const setLanguageStore = useApplicationStore((state) => state.setLanguage);

  // Lấy hàm set ngôn ngữ từ API
  const { mutate } = useSetLanguageMutation();

  const { error: errorToast } = useToast();

  // loading state
  const [loading, setLoading] = useState(false);

  // Kiểm tra xem user đăng nhập chưa
  const isAuthenticated = useCheckAuth();

  // Hook để set ngôn ngữ user
  const setLanguage = useCallback(
    async (lang: _LanguageCode) => {
      // Nếu user đã đăng nhập thì gọi API để set ngôn ngữ
      if (isAuthenticated) {
        setLoading(true);
        // Gọi API để set ngôn ngữ
        mutate(
          { lang },
          {
            onSuccess: (data) => {
              // Sau khi set ngôn ngữ thành công thì set ngôn ngữ vào store
              setLanguageStore(lang);
            },
            onError: (error) => {
              errorToast({
                message: t('common_error.failed_to_set_language'),
              });
            },
          }
        );
        setLoading(false);
      } else {
        await setLanguageStore(lang);
      }
      // Đóng bottom sheet
      (ref as any).current?.dismiss();
    },
    [isAuthenticated]
  );

  return {
    setLanguage,
    loading,
    selectedLang,
  };
};

/**
 * Hook để kiểm tra xem user có đang được xác thực hay không
 */
export const useHeartbeat = () => {
  const status = useAuthStore((state) => state.status);
  useHeartbeatQuery(status === _AuthStatus.AUTHORIZED);
}