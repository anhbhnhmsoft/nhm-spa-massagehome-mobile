import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus, _Gender } from '@/features/auth/const';
import useToast from '@/features/app/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApplicationStore } from '@/features/app/stores';
import { _LanguageCode } from '@/lib/const';
import {
  useAuthenticateMutation,
  useLockAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useMutationDeleteAvatar,
  useMutationEditAvatar,
  useMutationEditProfile,
  useProfileMutation,
  useRegisterMutation,
  useResendRegisterOTPMutation,
  useSetLanguageMutation,
  useVerifyRegisterOTPMutation,
} from '@/features/auth/hooks/use-mutation';
import {
  AuthenticateRequest,
  EditProfileRequest,
  LoginRequest,
  RegisterRequest,
  VerifyRegisterOTPRequest,
} from '@/features/auth/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Href, router } from 'expo-router';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useCameraPermissions } from 'expo-camera';
import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';
import { queryClient } from '@/lib/provider/query-provider';
import { useReferralStore } from '@/features/affiliate/store';
import * as Updates from 'expo-updates';

export * from './use-handle-authenticate';
export * from './use-handle-login';
export * from './use-check-auth-to-redirect';
export * from './use-handle-verify-register-otp';
export * from './use-handle-register';
export * from './use-logout';



/**
 * Hook để kiểm tra xem user có đang được xác thực hay không
 */
export const useCheckAuth = () => {
  const status = useAuthStore((state) => state.status);
  return status === _AuthStatus.AUTHORIZED;
};



/**
 * Hook để lấy profile user
 */
export const useGetProfile = () => {
  const { t } = useTranslation();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const { mutate } = useProfileMutation();
  const { error } = useToast();

  return useCallback(() => {
    mutate(undefined, {
      onSuccess: (res) => {
        setUser(res.data.user);
      },
      onError: () => {
        // Token hết hạn hoặc không hợp lệ
        error({
          message: t('common_error.invalid_or_expired_token'),
        });
        logout();
      },
    });
  }, []);
};



/**
 * Hook để set ngôn ngữ user
 */
export const useSetLanguageUser = (onClose?: () => void) => {
  const { t } = useTranslation();
  // Lấy ngôn ngữ hiện tại từ store
  const selectedLang = useApplicationStore((state) => state.language);

  // Lấy hàm set ngôn ngữ từ store
  const setLanguageStore = useApplicationStore((state) => state.setLanguage);

  // Lấy hàm set ngôn ngữ từ API
  const { mutate, isPending } = useSetLanguageMutation();

  const { error: errorToast } = useToast(!!onClose);

  // loading state

  // Kiểm tra xem user đăng nhập chưa
  const isAuthenticated = useCheckAuth();

  const syncLanguage = useCallback(async (lang: _LanguageCode) => {
    try {
      // Sau khi set ngôn ngữ thành công thì set ngôn ngữ vào store
      await setLanguageStore(lang);
      // Sau khi set ngôn ngữ thành công thì clear cache
      queryClient.clear();
      // Sau khi set ngôn ngữ thành công thì reset lại các query để cập nhật ngôn ngữ mới
      await queryClient.resetQueries();
      // Sau khi set ngôn ngữ thành công thì reload lại app
      await Updates.reloadAsync();
    } catch {
      // do nothing
    }
  }, []);

  // Hook để set ngôn ngữ user
  const setLanguage = useCallback(
    async (lang: _LanguageCode) => {
      // Nếu user đã đăng nhập thì gọi API để set ngôn ngữ
      if (isAuthenticated) {
        // Gọi API để set ngôn ngữ
        mutate(
          { lang },
          {
            onSuccess: async () => {
              await syncLanguage(lang);
            },
            onError: () => {
              errorToast({
                message: t('common_error.failed_to_set_language'),
              });
            },
          }
        );
      } else {
        await syncLanguage(lang);
      }
      // Đóng bottom sheet
      if (onClose) {
        onClose();
      }
    },
    [isAuthenticated, onClose]
  );

  return {
    setLanguage,
    selectedLang,
    isPending,
  };
};

/**
 * Xử lý thay đổi avatar
 */
export const useChangeAvatar = () => {
  const { t } = useTranslation();

  const [permission, requestPermission] = useCameraPermissions();

  const editAvatar = useEditAvatar();

  // Xử lý khi nhấn nút chụp ảnh
  const takePictureCamera = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(t('permission.camera.title'), t('permission.camera.message'));
        return false;
      }
    } else {
      // Nếu có quyền chụp ảnh thì chuyển sang màn hình chụp ảnh
      router.push('/take-picture-avatar');

      return true;
    }
  }, [permission?.granted, t]);

  // Xử lý khi nhấn nút chọn ảnh từ thư viện
  const chooseImageFormLib = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permission.picture_lib.title'), t('permission.picture_lib.message'));
      return false;
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
      });
      if (!result.canceled) {
        const form = new FormData();
        form.append('file', {
          uri: result.assets[0].uri,
          name: 'avatar.jpg',
          type: 'image/jpg',
        } as any);
        editAvatar(form, false);
      }
    }
  }, [t]);

  // Trả về hàm xử lý xoóa avatar và thay đổi avatar
  const deleteAvatar = useCallback(() => {
    editAvatar(undefined, false, true);
  }, [editAvatar]);

  return {
    takePictureCamera,
    chooseImageFormLib,
    deleteAvatar,
  };
};

/**
 * Hook để chỉnh sửa avatar
 */
export const useEditAvatar = () => {
  const { mutate: editAvatar } = useMutationEditAvatar();
  const { mutate: deleteAvatar } = useMutationDeleteAvatar();
  const errorHandle = useErrorToast();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useApplicationStore((state) => state.setLoading);

  return useCallback(
    (data: FormData | undefined, routerBack: boolean = true, isDelete: boolean = false) => {
      setLoading(true);
      // Xử lý khi xóa avatar
      if (isDelete) {
        deleteAvatar(undefined, {
          onSuccess: (res) => {
            setUser(res.data.user);
            if (routerBack) {
              router.back();
            }
          },
          onError: (error) => {
            errorHandle(error);
          },
          onSettled: () => {
            setLoading(false);
          },
        });
      } else if (data) {
        // Xử lý khi chỉnh sửa avatar
        editAvatar(data, {
          onSuccess: (res) => {
            setUser(res.data.user);
            if (routerBack) {
              router.back();
            }
          },
          onError: (error) => {
            errorHandle(error);
          },
          onSettled: () => {
            setLoading(false);
          },
        });
      }
    },
    []
  );
};

/**
 * Hook để chỉnh sửa thông tin profile
 */
export const useEditProfile = () => {
  const { t } = useTranslation();
  const errorHandle = useErrorToast();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const setLoading = useApplicationStore((state) => state.setLoading);

  const { mutate: editProfile } = useMutationEditProfile();

  const form = useForm<EditProfileRequest>({
    defaultValues: {
      name: user?.name,
      date_of_birth: user?.profile.date_of_birth || undefined,
      gender: user?.profile.gender || undefined,
      bio: user?.profile.bio || undefined,
    },
    resolver: zodResolver(
      z
        .object({
          name: z
            .string()
            .min(4, t('profile.error.invalid_name'))
            .max(255)
            .optional()
            .or(z.literal('')),

          // Lưu ý: Form dùng Date object để DatePicker hoạt động
          date_of_birth: z
            .string()
            .optional()
            .refine((val) => dayjs(val).isValid(), {
              error: t('profile.error.invalid_date_of_birth'),
            })
            .refine(
              (val) => {
                const inputTime = dayjs(val);
                // Ngày sinh phải trước ngày hiện tại
                return inputTime.isBefore(dayjs());
              },
              {
                error: t('profile.error.invalid_date_of_birth'), // "Ngày sinh phải trước ngày hiện tại"
              }
            ),

          gender: z.enum(_Gender).optional(),
          bio: z.string().optional(),

          // Thêm password vào schema
          old_password: z
            .string()
            .min(8, 'Mật khẩu cũ tối thiểu 8 ký tự')
            .optional()
            .or(z.literal('')),
          new_password: z
            .string()
            .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
            .optional()
            .or(z.literal('')),
        })
        // Validate logic chéo: Nếu nhập mật khẩu mới thì bắt buộc nhập mật khẩu cũ
        .refine(
          (data) => {
            return !(data.new_password && !data.old_password);
          },
          {
            message: t('profile.error.old_password_required'),
            path: ['old_password'], // Hiển thị lỗi ở trường old_password
          }
        )
    ),
  });

  useEffect(() => {
    // Cập nhật giá trị mặc định khi user thay đổi
    form.reset({
      name: user?.name,
      date_of_birth: user?.profile.date_of_birth || undefined,
      gender: user?.profile.gender || undefined,
      bio: user?.profile.bio || undefined,
    });
  }, [user]);

  // handle submit form
  const onSubmit = useCallback((data: EditProfileRequest) => {
    setLoading(true);
    // Xử lý submit form
    editProfile(data, {
      onSuccess: (res) => {
        setUser(res.data.user);
        router.back();
      },
      onError: (error) => {
        errorHandle(error);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  }, []);

  return {
    form,
    onSubmit,
  };
};



/**
 * Hook để xóa tài khoản
 */
export const useLockAccount = () => {
  const { t } = useTranslation(); // Khởi tạo hàm dịch t
  const { mutate, isPending } = useLockAccountMutation();
  const logout = useAuthStore((s) => s.logout);
  const handleError = useErrorToast();
  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleLockAccount = () => {
    Alert.alert(
      t('profile.delete_account_confirm_title'), // Tiêu đề: Xác nhận xóa tài khoản
      t('profile.delete_account_warning'), // Nội dung cảnh báo hành động không thể hoàn tác
      [
        {
          text: t('common.cancel'), // Chữ: Hủy
          style: 'cancel',
        },
        {
          text: t('profile.delete_account'), // Chữ: Xóa tài khoản
          style: 'destructive',
          onPress: () => {
            setLoading(true);

            mutate(undefined, {
              onSuccess: () => {
                setLoading(false);

                // Thông báo sau khi API thành công
                Alert.alert(
                  t('header_app.notification'), // Tiêu đề: Thông báo
                  t('profile.delete_account_success'), // Nội dung: Tài khoản đã được xóa...
                  [
                    {
                      text: 'Ok', // Chữ: OK
                      onPress: () => {
                        logout();
                      },
                    },
                  ]
                );
              },
              onError: (error) => {
                setLoading(false);
                handleError(error);
              },
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return {
    handleLockAccount,
    isPending,
  };
};
