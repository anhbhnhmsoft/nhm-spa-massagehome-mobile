import {
  useAllCategoriesQuery,
  useConfigScheduleQuery,
  useOptionByCategoryQuery,
  useProfileKtvQuery,
  useTotalIncomeQuery,
} from '@/features/ktv/hooks/use-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SelectOption } from '@/components/select-modal';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  DashboardQueryParams,
  EditConfigScheduleRequest, EditProfileKtvRequest,
  PercentChangeResult,
  ServiceForm,
} from '@/features/ktv/types';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import {
  useAddServiceMutation,
  useDeleteImageMutation,
  useDeleteServiceMutation,
  useDetailServiceMutation,
  useLinkReferrerMutation, useSendDangerSupportMutation,
  useUpdateConfigScheduleMutation,
  useUpdateProfileKtvMutation,
  useUpdateServiceMutation,
  useUploadImageMutation,
} from '@/features/ktv/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useKtvStore } from '@/features/ktv/stores';
import { router } from 'expo-router';
import useToast from '@/features/app/hooks/use-toast';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { useApplicationStore } from '@/features/app/stores';
import { _DefaultValueFormConfigSchedule, _DefaultValueFormService, _KTVConfigSchedules, } from '@/features/ktv/consts';
import { useMutationServiceDetail } from '@/features/service/hooks/use-mutation';
import { ServiceItem } from '@/features/service/types';
import { queryClient } from '@/lib/provider/query-provider';
import { DashboardTab } from '@/features/service/const';
import { useGetTransactionList } from '@/features/payment/hooks';
import { computePercentChange } from './useDashboardChart';
import { useAuthStore } from '@/features/auth/stores';
import { useCameraPermissions } from 'expo-camera';
import dayjs from 'dayjs';
import { goBack } from '@/lib/utils';
import { _Gender } from '@/features/auth/const';

// Hook cho chỉnh sửa dịch vụ
export const useSetService = () => {
  const setServiceEdit = useKtvStore((state) => state.setServiceEdit);
  const setServiceDetail = useKtvStore((state) => state.setServiceDetail);

  const setLoading = useApplicationStore((state) => state.setLoading);
  const errorHandle = useErrorToast();
  const { t } = useTranslation();
  const { success: successToast } = useToast();
  const setReloadListService = useKtvStore((state) => state.setReloadListService);

  // mutate function lấy chi tiết dịch vụ để chỉnh sửa
  const { mutate: getDetailServiceEdit } = useDetailServiceMutation();
  // mutate function xóa dịch vụ
  const { mutate: mutateDeleteService } = useDeleteServiceMutation();

  // mutate function lấy chi tiết dịch vụ để hiển thị chi tiết
  const { mutate: mutateGetDetailService } = useMutationServiceDetail();

  // Hook cho sửa dịch vụ
  const editService = useSingleTouch((id: string) => {
    setLoading(true);
    getDetailServiceEdit(
      { id },
      {
        onSuccess: (res) => {
          setServiceEdit(res.data);
          router.push('/(app)/(service-ktv)/form');
        },
        onError: (err) => {
          errorHandle(err);
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  });

  // Hook cho xóa dịch vụ
  const deleteService = useSingleTouch((id: string, needBack: boolean = false) => {
    Alert.alert(t('ktv.services.delete.confirm.title'), t('ktv.services.delete.confirm.message'), [
      {
        text: t('ktv.services.delete.confirm.cancel'),
        style: 'cancel',
      },
      {
        text: t('ktv.services.delete.confirm.confirm'),
        style: 'destructive',
        onPress: () => {
          setLoading(true);
          mutateDeleteService(id, {
            onSuccess: () => {
              successToast({ message: t('ktv.services.delete.success') });
              setReloadListService(true);
              if (needBack) {
                goBack();
              }
            },
            onError: (err) => {
              errorHandle(err);
            },
            onSettled: () => {
              setLoading(false);
            },
          });
        },
      },
    ]);
  });

  // Hook cho chi tiết dịch vụ
  const detailService = useSingleTouch((id: string) => {
    setLoading(true);
    mutateGetDetailService(id, {
      onSuccess: (res) => {
        setServiceDetail(res.data);
        router.push('/(app)/(service-ktv)/service-detail');
      },
      onError: (err) => {
        errorHandle(err);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  });

  return {
    editService,
    deleteService,
    detailService,
  };
};

// Hook cho form dịch vụ
export const useFormService = () => {
  const { t } = useTranslation();
  const query = useAllCategoriesQuery();
  const serviceEdit = useKtvStore((state) => state.service_edit);
  const setServiceEdit = useKtvStore((state) => state.setServiceEdit);

  const setServiceDetail = useKtvStore((state) => state.setServiceDetail);
  const handleError = useErrorToast();
  const { success: successToast } = useToast();

  const setReloadListService = useKtvStore((state) => state.setReloadListService);

  // mutate function thêm dịch vụ
  const { mutate: addService, isPending: isAdding } = useAddServiceMutation();
  // mutate function cập nhật dịch vụ
  const { mutate: updateService, isPending: isUpdating } = useUpdateServiceMutation();

  // Tạo form
  const form = useForm<ServiceForm>({
    defaultValues: _DefaultValueFormService,
    resolver: zodResolver(
      z.object({
        name: z.object({
          vi: z.string().min(1, t('ktv.services.form.error.name')),
          en: z.string().optional(),
          cn: z.string().optional(),
        }),
        description: z.object({
          vi: z.string().min(1, t('ktv.services.form.error.description')),
          en: z.string().optional(),
          cn: z.string().optional(),
        }),
        category_id: z.string().min(1, t('ktv.services.form.error.category')),
        is_active: z.boolean(),
        image: z.object(
          {
            uri: z.string().min(1, t('ktv.services.form.error.image')),
            type: z.string().min(1, t('ktv.services.form.error.image')),
            name: z.string().min(1, t('ktv.services.form.error.image')),
          },
          { error: t('ktv.services.form.error.image') }
        ),
      })
    ),
  });

  const { watch } = form;
  const categoryId = watch('category_id');

  const optionByCategoryQuery = useOptionByCategoryQuery(categoryId);
  const listOptionByCategory = useMemo(() => {
    return optionByCategoryQuery.data || [];
  }, [optionByCategoryQuery.data]);
  // Xử lý khi sửa dịch vụ
  useEffect(() => {
    if (!serviceEdit) return;
    // 1. Set các field cơ bản
    form.setValue('name', serviceEdit.name);
    form.setValue('description', serviceEdit.description);
    form.setValue('category_id', serviceEdit.category_id);
    form.setValue('is_active', serviceEdit.is_active);

    form.setValue('image', {
      uri: serviceEdit.image_url || '',
      name: `${Math.random().toString(36).substring(2, 10)}.jpg`,
      type: 'image/jpg',
    });
  }, [serviceEdit]);

  // Xử lý khi có lỗi trong query category
  useEffect(() => {
    if (query.error) {
      handleError(query.error);
      goBack();
    }
  }, [query.error]);

  // Tạo mảng options cho dropdown category
  const optionsCategory = useMemo((): SelectOption[] => {
    return (
      query.data?.map((item) => ({
        label: item.name,
        value: item.id,
      })) || []
    );
  }, [query.data]);

  // Xử lý chọn ảnh từ thư viện
  const handleSetImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission.picture_lib.title'), t('permission.picture_lib.message'), [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.go_to_settings'),
            onPress: () => Linking.openSettings(),
          },
        ]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });
      if (!result.canceled) {
        const image = result.assets[0];
        form.setValue('image', {
          uri: image.uri,
          name: image.fileName || `${Math.random().toString(36).substring(2, 10)}.jpg`,
          type: image.mimeType || 'image/jpg',
        });
      }
    } catch (error) {
      Alert.alert(t('permission.picture_lib.title'), t('permission.picture_lib.error'));
    }
  };

  // Xử lý reset ảnh
  const resetImage = () => {
    form.setValue('image', {
      uri: '',
      name: '',
      type: '',
    });
  };

  // Xử lý submit form
  const submit = form.handleSubmit((data) => {
    // Tạo FormData từ dữ liệu form
    const formData = new FormData();
    formData.append('category_id', data.category_id);
    formData.append('is_active', data.is_active ? '1' : '0');
    formData.append('image', {
      uri: data.image.uri,
      name: data.image.name,
      type: data.image.type,
    } as any);
    (Object.keys(data.name) as Array<keyof typeof data.name>).forEach((lang) => {
      if (data.name[lang]) {
        formData.append(`name[${lang}]`, data.name[lang]!);
      }
    });
    (Object.keys(data.description) as Array<keyof typeof data.description>).forEach((lang) => {
      if (data.description[lang]) {
        formData.append(`description[${lang}]`, data.description[lang]!);
      }
    });
    if (serviceEdit) {
      // Cập nhật dịch vụ
      updateService(
        { id: serviceEdit.id, data: formData },
        {
          onSuccess: (res) => {
            successToast({ message: t('ktv.services.form.success') });
            setServiceDetail(res.data);
            form.reset(_DefaultValueFormService);
            setReloadListService(true);
            setServiceEdit(null);
            router.back();
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } else {
      // Thêm dịch vụ
      addService(formData, {
        onSuccess: (res) => {
          successToast({ message: t('ktv.services.form.success') });
          form.reset(_DefaultValueFormService);
          setReloadListService(true);
          setServiceEdit(null);
          router.back();
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  });

  return {
    isEdit: !!serviceEdit,
    optionsCategory,
    handleSetImage,
    resetImage,
    form,
    submit,
    loading: isAdding || isUpdating,
    setServiceEdit,
    listOptionByCategory,
  };
};

// Hook cho chi tiết dịch vụ
export const useServiceDetail = () => {
  const serviceDetail = useKtvStore((state) => state.service_detail);

  useEffect(() => {
    if (!serviceDetail) {
      router.back();
    }
  }, [serviceDetail]);

  return {
    detail: serviceDetail as ServiceItem,
  };
};

// Hook cho tổng doanh thu dashboard
export const useDashboardTotalIncome = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>(DashboardTab.DAY);
  const { t } = useTranslation();

  // Params API theo tab hiện tại
  const params: DashboardQueryParams = useMemo(() => ({ type: activeTab }), [activeTab]);

  // Gọi API tổng doanh thu
  const { data, isLoading, isRefetching, refetch } = useTotalIncomeQuery(params);

  // Gọi API danh sách giao dịch
  const queryTransactionList = useGetTransactionList({
    filter: {},
    page: 1,
    per_page: 10,
  });

  // Chuẩn hóa dữ liệu biểu đồ
  const chartData = useMemo(() => {
    if (!data?.chart_data) return [];
    return data.chart_data.map((item) => ({
      label: item.date,
      value: Number(item.total),
    }));
  }, [data?.chart_data]);

  // Tính percent change so với kỳ trước
  const percentChange: PercentChangeResult | null = useMemo(() => {
    if (!data?.chart_data || data.chart_data.length === 0) return null;
    return computePercentChange(activeTab, data.chart_data);
  }, [data?.chart_data, activeTab]);
  // Build text hiển thị percent change với i18next
  const percentChangeText = useMemo(() => {
    if (!percentChange) return '';
    const compareKey =
      activeTab === 'day'
        ? 'yesterday'
        : activeTab === 'week' || activeTab === 'month'
          ? 'last_week'
          : 'last_month';

    if (percentChange.previousTotal === 0 && percentChange.currentTotal === 0) {
      return t('dashboard.percent_change.zero', {
        compare: t(`dashboard.compare.${compareKey}`),
      });
    }

    if (percentChange.previousTotal === 0) {
      return t('dashboard.percent_change.new', {
        compare: t(`dashboard.compare.${compareKey}`),
      });
    }

    const sign = percentChange.percent! > 0 ? '+' : '';

    return `${sign}${percentChange.percent} ${t('dashboard.percent_change.compare', {
      compare: t(`dashboard.compare.${compareKey}`),
    })}`;
  }, [percentChange, activeTab, t]);
  // Set tab hiện tại
  const handleSetTab = useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    handleSetTab,
    isLoading: isLoading || isRefetching,
    refetch,
    data,
    chartData,
    queryTransactionList,
    percentChange,
    percentChangeText, // text đã format sẵn
    t,
  };
};

// Hook cho chỉnh sửa hồ sơ KTV
export const editProfileKTV = () => {
  const { t } = useTranslation();
  const errorHandle = useErrorToast();
  const {success: successToast} = useToast();
  const { data: profileData, refetch, isLoading } = useProfileKtvQuery();
  const { mutate: editProfile } = useUpdateProfileKtvMutation();
  const user = useAuthStore((state) => state.user);
  const setLoading = useApplicationStore((state) => state.setLoading);

  const form = useForm<EditProfileKtvRequest>({
    resolver: zodResolver(z
      .object({
        // SỬA 1: Thêm .optional() cho experience
        experience: z.number().optional(),

        // SỬA 2: Thêm .optional() cho bio và các trường con nếu cần
        bio: z.object({
          vi: z.string().min(1, t('profile.error.bio_required')),
          // Nếu interface IMultiLangField cho phép en, cn là optional thì ở đây cũng nên để optional
          en: z.string().optional(),
          cn: z.string().optional(),
        }).optional(), // <--- Quan trọng: Để khớp với bio?: IMultiLangField

        gender: z.enum(_Gender).optional(),

        date_of_birth: z
          .string()
          .optional()
          .refine((val) => !val || dayjs(val).isValid(), { // Thêm !val để tránh lỗi khi undefined
            error: t('profile.error.invalid_date_of_birth'),
          })
          .refine(
            (val) => {
              if (!val) return true; // Bỏ qua nếu không nhập
              const inputTime = dayjs(val);
              return inputTime.isBefore(dayjs());
            },
            {
              error: t('profile.error.invalid_date_of_birth'),
            }
          ),

        old_pass: z.string().optional(),

        // Phần new_pass giữ nguyên logic của bạn
        new_pass: z
          .string()
          .min(8, { message: t('auth.error.password_invalid') })
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/[0-9]/)
          .optional()
          .or(z.literal('')),
      })
      .refine((data) => !data.new_pass || !!data.old_pass, {
        path: ['old_pass'],
        message: t('profile.error.old_password_min'),
      })),
    mode: 'onSubmit',
    defaultValues: {
      experience: 0,
      bio: {
        vi: '',
        en: '',
        cn: '',
      },
      gender: _Gender.MALE,
      date_of_birth: '',
    },
  });

  const { reset } = form;

  // QUAN TRỌNG: Cập nhật dữ liệu vào form khi profileData có giá trị
  useEffect(() => {
    if (profileData) {
      reset({
        experience: profileData.experience,
        bio: {
          vi: profileData.bio?.vi || '',
          en: profileData.bio?.en || '',
          cn: profileData.bio?.cn || '',
        },
        gender: profileData.gender || 1,
        date_of_birth: profileData.date_of_birth || '',
      });
    }
  }, [profileData, reset]);

  const onSubmit = (data: EditProfileKtvRequest) => {
    setLoading(true);
    editProfile(data, {
      onSuccess: () => {
        refetch();
        successToast({ message: t('common_success.profile_update_success') });
        goBack();
      },
      onError: (error) => errorHandle(error),
      onSettled: () => setLoading(false),
    });
  };

  return { form, profileData, onSubmit, user, isLoading, refetch };
};

const MAX_IMAGE = 5;

// Hook cho thay đổi ảnh đại diện KTV
export const useChangeImage = () => {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  /**
   * Xin quyền camera
   */
  const takePictureCamera = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(t('permission.camera.title'), t('permission.camera.message'));
        return false;
      }
    } else {
      // Nếu có quyền chụp ảnh thì chuyển sang màn hình chụp ảnh
      router.push('/(app)/(service-ktv)/take-picture-image');
      return true;
    }
  }, [permission?.granted, t]);

  /**
   * Chọn ảnh từ thư viện (tối đa 5)
   */
  const chooseImageFromLib = useCallback(
    async (imageLength: number = 0) => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (imageLength >= MAX_IMAGE) {
        Alert.alert(t('common.error'), t('image.max_5'));
        return;
      }
      if (status !== 'granted') {
        Alert.alert(t('permission.picture_lib.title'), t('permission.picture_lib.message'));
        return;
      }
      const remain = MAX_IMAGE - imageLength;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsMultipleSelection: true,
        selectionLimit: remain,
      });

      if (result.canceled) return;

      if (result.assets.length > MAX_IMAGE) {
        Alert.alert(t('common.error'), t('image.max_5'));
        return;
      }

      // 👉 build FormData nhiều ảnh
      const form = new FormData();

      result.assets.forEach((asset, index) => {
        form.append('images[]', {
          uri: asset.uri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        } as any);
      });

      return form; // 👈 trả về cho hook upload
    },
    [t]
  );

  return {
    takePictureCamera,
    chooseImageFromLib,
  };
};

// Hook cho chỉnh sửa ảnh đại diện KTV
export const useEditImage = () => {
  const { mutate: uploadImage } = useUploadImageMutation();
  const { mutate: deleteImage } = useDeleteImageMutation();

  const { chooseImageFromLib } = useChangeImage();

  const setLoading = useApplicationStore((s) => s.setLoading);
  const errorHandle = useErrorToast();
  const { success: successToast } = useToast();
  const { t } = useTranslation();

  const uploadImages = useCallback(
    (form: FormData, onSuccess?: () => void) => {
      setLoading(true);

      uploadImage(form, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ['ktvApi-profileKtv'],
          });

          successToast?.({
            message: res.message,
          });
          onSuccess?.();
        },
        onError: (error) => {
          errorHandle(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    },
    [uploadImage, queryClient, setLoading, errorHandle, successToast, t]
  );

  const addImages = useCallback(
    async (imageLength: number = 0, onSuccess?: () => void) => {
      const form = await chooseImageFromLib(imageLength);
      if (!form) return;

      uploadImages(form, onSuccess);
    },
    [chooseImageFromLib, uploadImages]
  );

  const removeImage = useCallback(
    (imageId: string, onSuccess?: () => void) => {
      Alert.alert(
        t('ktv.edit_profile.common.confirm'),
        t('ktv.edit_profile.image.confirm_delete'),
        [
          {
            text: t('ktv.edit_profile.common.cancel'),
            style: 'cancel',
          },
          {
            text: t('ktv.edit_profile.common.delete'),
            style: 'destructive',
            onPress: () => {
              setLoading(true);

              deleteImage(imageId, {
                onSuccess: (res) => {
                  queryClient.invalidateQueries({
                    queryKey: ['ktvApi-profileKtv'],
                  });

                  successToast?.({
                    message: res.message,
                  });
                  onSuccess?.();
                },
                onError: (error) => {
                  errorHandle(error);
                },
                onSettled: () => {
                  setLoading(false);
                },
              });
            },
          },
        ]
      );
    },
    [deleteImage, queryClient, setLoading, errorHandle, successToast, t]
  );

  return {
    uploadImages,
    addImages,
    removeImage,
  };
};

/**
 * Xử lý màn hình quét qr code khách hàng
 */
export const useScanQRCodeKtv = () => {
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { mutate } = useLinkReferrerMutation();
  const { success: successToast, error: errorToast } = useToast();
  const { t } = useTranslation();

  return (referrer_id: string) => {
    setLoading(true);
    mutate(referrer_id, {
      onSuccess: () => {
        successToast({ message: t('qr_scan.link_success') });
        router.back();
      },
      onError: (err) => {
        errorToast({ message: err.message || t('qr_scan.link_error') });
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };
};

export const useConfigSchedule = () => {
  const { t } = useTranslation();
  const query = useConfigScheduleQuery();
  const { error: errorToast, success } = useToast();
  const setLoading = useApplicationStore((state) => state.setLoading);
  const { mutate } = useUpdateConfigScheduleMutation();
  const form = useForm<EditConfigScheduleRequest>({
    defaultValues: _DefaultValueFormConfigSchedule,
    resolver: zodResolver(
      z.object({
        is_working: z.boolean(),
        working_schedule: z.array(
          z
            .object({
              day_key: z.enum(_KTVConfigSchedules, {
                error: t('config_schedule.error.invalid_day'),
              }),
              start_time: z.string().min(5),
              end_time: z.string().min(5),
              active: z.boolean(),
            })
            .refine(
              (data) => {
                // Nếu ngày đó TẮT (không làm) -> Không cần check -> Luôn đúng
                if (!data.active) return true;
                const start = dayjs(data.start_time, 'HH:mm');
                const end = dayjs(data.end_time, 'HH:mm');
                // Kiểm tra xem giờ bắt đầu và kết thúc có hợp lệ không
                if (!start.isValid() || !end.isValid()) return false;

                // Thêm kiểm tra giờ kết thúc phải sau giờ bắt đầu
                return end.isAfter(start);
              },
              {
                message: t('config_schedule.error.invalid_time_end'),
                path: ['end_time'],
              }
            )
        ),
      })
    ),
  });

  // Lấy dữ liệu cấu hình lịch làm việc khi component mount
  useEffect(() => {
    if (query.data) {
      const data = query.data;
      form.setValue('is_working', data.is_working);
      form.setValue('working_schedule', data.working_schedule);
    }
  }, [query.data]);

  // Xử lý lỗi khi gọi API
  useEffect(() => {
    if (query.isError) {
      errorToast({ message: t('config_schedule.error.something_went_wrong') });
      router.back();
    }
  }, [query.isError]);

  const onSubmit = form.handleSubmit((data: EditConfigScheduleRequest) => {
    setLoading(true);
    mutate(data, {
      onSuccess: (res) => {
        success({ message: res.message });
      },
      onError: (err) => {
        errorToast({ message: err.message });
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  });

  return {
    query,
    form,
    onSubmit,
    loadingSave: form.formState.isSubmitting,
  };
};

export const useSendDangerSupport = () => {
  const { t } = useTranslation();
  const { error: errorToast, success } = useToast();
  const setLoading = useApplicationStore((state) => state.setLoading);
  const userLocation = useApplicationStore((state) => state.location);
  const { mutate } = useSendDangerSupportMutation();

  const sendDangerSupport = () => {
    setLoading(true);
    mutate({
      message: '',
      lat: userLocation?.location?.coords?.latitude?.toString(),
      lng: userLocation?.location?.coords?.longitude?.toString(),
    }, {
      onSuccess: () => {
        success({ message: t('danger_support.success') });
      },
      onError: (err) => {
        errorToast({ message: t('danger_support.error') });
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  return {
    sendDangerSupport,
  }
}