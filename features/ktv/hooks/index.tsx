import { useAllCategoriesQuery } from '@/features/ktv/hooks/use-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SelectOption } from '@/components/select-modal';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { ServiceForm } from '@/features/ktv/types';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import {
  useAddServiceMutation,
  useDeleteServiceMutation,
  useDetailServiceMutation,
  useFinishBookingMutation,
  useUpdateServiceMutation,
} from '@/features/ktv/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useKtvStore } from '@/features/ktv/stores';
import { router } from 'expo-router';
import useToast from '@/features/app/hooks/use-toast';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import useApplicationStore from '@/lib/store';
import { _DefaultValueFormService } from '@/features/ktv/consts';
import { useMutationServiceDetail } from '@/features/service/hooks/use-mutation';
import { ServiceItem } from '@/features/service/types';
import { useBookingStore } from '@/lib/ktv/useBookingStore';
import { Storage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import * as Notifications from 'expo-notifications';
import { queryClient } from '@/lib/provider/query-provider';


// Hook cho sửa - xóa - chi tiết dịch vụ
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
  const deleteService = useSingleTouch((id: string, goBack: boolean = false) => {
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
              if (goBack) {
                router.back();
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
        options: z
          .array(
            z.object({
              price: z.number().min(0, t('ktv.services.form.error.options_price')),
              duration: z.number().min(15, {
                message: t('ktv.services.form.error.options_duration'),
              }),
            })
          )
          .min(1, t('ktv.services.form.error.options_min')),
      })
    ),
  });

  // Xử lý khi sửa dịch vụ
  useEffect(() => {
    if (serviceEdit) {
      form.setValue('name', serviceEdit.name);
      form.setValue('description', serviceEdit.description);
      form.setValue('category_id', serviceEdit.category_id);
      form.setValue('is_active', serviceEdit.is_active);
      form.setValue('image', {
        uri: serviceEdit.image_url || '',
        name: `${Math.random().toString(36).substring(2, 10)}.jpg`,
        type: 'image/jpg',
      });
      form.setValue('options', serviceEdit.options);
    }
  }, [serviceEdit]);

  // Xử lý khi có lỗi trong query category
  useEffect(() => {
    if (query.error) {
      handleError(query.error);
      router.back();
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
        quality: 0.8,
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
    data.options.forEach((option, index) => {
      formData.append(`options[${index}][price]`, String(option.price));
      formData.append(`options[${index}][duration]`, String(option.duration));
    });
    if (serviceEdit) {
      // Cập nhật dịch vụ
      updateService(
        { id: serviceEdit.id, data: formData },
        {
          onSuccess: () => {
            successToast({ message: t('ktv.services.form.success') });
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
        onSuccess: () => {
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

// Hook cho hydrate booking
export const useHydrateBooking = () => {
  // hydrate state
  const _hydrated = useBookingStore((s) => s._hydrated);
  const hydrate = useBookingStore((s) => s.hydrate);

  // booking data
  const bookingId = useBookingStore((s) => s.bookingId);
  const endTime = useBookingStore((s) => s.endTime);
  const notificationId = useBookingStore((s) => s.notificationId);

  // actions
  const clearBooking = useBookingStore((s) => s.clearBooking);

  const finishBooking = useFinishBookingMutation();
  const [complete, setComplete] = useState(false);

  // chặn gọi finalize nhiều lần
  const hasFinalizedRef = useRef(false);

  useEffect(() => {
    // CHƯA hydrate → gọi hydrate
    if (!_hydrated) {
      hydrate();
      return;
    }

    // ĐÃ xử lý rồi → không làm lại
    if (hasFinalizedRef.current) {
      setComplete(true);
      return;
    }

    const finalizeIfExpired = async () => {
      // Không có booking
      if (!bookingId || !endTime) {
        hasFinalizedRef.current = true;
        setComplete(true);
        return;
      }

      // Booking còn hạn
      if (endTime > Date.now()) {
        hasFinalizedRef.current = true;
        setComplete(true);
        return;
      }

      finishBooking.mutate(bookingId, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['bookingApi-details-ktv', bookingId] });
          // make sure booking list also refreshes
          queryClient.invalidateQueries({ queryKey: ['ktvApi-bookings'] });
        },
        onSettled: async () => {
          if (notificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(notificationId);
            } catch (e) {}
          }

          try {
            await Storage.removeItem(_StorageKey.BOOKING_TIME_KEY);
          } catch (e) {}

          try {
            await clearBooking();
          } catch (e) {}

          hasFinalizedRef.current = true;
          setComplete(true);
        },
      });
    };

    finalizeIfExpired();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hydrated]);


  return complete;
};

export const editProfileKTV = () => {

}