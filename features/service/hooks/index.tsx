import {
  useInfiniteCategoryList,
  useInfiniteServiceList,
  useQueryListCoupon,
} from '@/features/service/hooks/use-query';
import {
  BookingServiceRequest,
  CategoryListFilterPatch,
  CategoryListRequest,
  PickBookingItem,
  PickBookingRequirement,
  ServiceListRequest,
} from '@/features/service/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useApplicationStore from '@/lib/store';
import useServiceStore from '@/features/service/stores';
import { router } from 'expo-router';
import {
  useMutationBookingService,
  useMutationServiceDetail,
} from '@/features/service/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocationAddress } from '@/features/app/hooks/use-location';
import { _StepFormBooking } from '@/features/service/const';
import useAuthStore from '@/features/auth/store';
import { _AuthStatus } from '@/features/auth/const';
import { useImmer } from 'use-immer';

/**
 * Lấy danh sách danh mục dịch vụ
 * @param initialParams
 */
export const useGetCategoryList = (initialParams: Omit<CategoryListRequest, 'filter'>) => {
  // Sử dụng useImmer để quản lý params (chứa filter)
  const [params, setParams] = useImmer<CategoryListRequest>({
    ...initialParams,
    filter: {
      keyword: '',
    },
  });

  // Hàm setFilter
  const setFilter = useCallback(
    (filterPatch: CategoryListFilterPatch) => {
      setParams((draft) => {
        // 🚨 QUAN TRỌNG: Reset page về 1 khi filter thay đổi
        draft.page = 1;
        // Merge filter mới vào draft.filter (sử dụng logic Immer)
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams]
  );

  const query = useInfiniteCategoryList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
    params, // Trả về params hiện tại để dễ debug/hiển thị
    setFilter, // Trả về hàm setFilter để component sử dụng
  };
};

/**
 * Lấy danh sách dịch vụ
 * @param params
 * @param enabled
 */
export const useGetServiceList = (params: ServiceListRequest, enabled?: boolean) => {
  const query = useInfiniteServiceList(params, enabled);

  const setLoading = useApplicationStore((s) => s.setLoading);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading]);

  return {
    ...query,
    data,
    pagination,
  };
};

/**
 * Lưu thông tin dịch vụ vào store và chuyển hướng đến màn hình chi tiết dịch vụ
 */
export const useSetService = () => {
  const setService = useServiceStore((s) => s.setService);

  const status = useAuthStore((state) => state.status);

  const { mutate } = useMutationServiceDetail();

  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleError = useErrorToast();

  return useCallback(
    (id: string) => {
      if (status === _AuthStatus.UNAUTHORIZED) {
        router.push(`/(auth)`);
      } else if (status === _AuthStatus.AUTHORIZED) {
        setLoading(true);
        mutate(id, {
          onSuccess: (res) => {
            setService(res.data);
            router.push('/(app)/(service)/service-detail');
          },
          onError: (error) => {
            handleError(error);
          },
          onSettled: () => {
            setLoading(false);
          },
        });
      }
    },
    [status]
  );
};

/**
 * detail service
 */
export const useServiceDetail = () => {
  const service = useServiceStore((s) => s.service);
  const setService = useServiceStore((s) => s.setService);
  const setPickServiceBooking = useServiceStore((s) => s.setPickServiceBooking);

  // Kiểm tra xem dịch vụ có tồn tại và đang hoạt động hay không
  useEffect(() => {
    // Nếu không có service, quay lại màn hình trước
    if (!service || !service.is_active) {
      router.back();
    }
    // Xóa service khi component unmount
    return () => setService(null);
  }, [service]);

  const pickServiceToBooking = (data: PickBookingItem) => {
    setPickServiceBooking(data);
    router.push('/(app)/(service)/service-booking');
  };

  return {
    service,
    pickServiceToBooking,
  };
};

/**
 * booking service
 */
export const useServiceBooking = () => {
  const pickServiceBooking = useServiceStore((s) => s.pick_service_booking);
  const setPickServiceBooking = useServiceStore((s) => s.setPickServiceBooking);
  const { t } = useTranslation();

  // Lưu trữ bước hiện tại trong booking
  const [step, setStep] = useState<_StepFormBooking>(_StepFormBooking.MAP);
  const [enableCoupon, setEnableCoupon] = useState<boolean>(false);
  const setLoading = useApplicationStore((s) => s.setLoading);
  // Lấy thông tin địa chỉ hiện tại của người dùng
  const { location: storeLocation } = useLocationAddress();

  const handleError = useErrorToast();

  // Thông tin form booking
  const form = useForm<PickBookingRequirement>({
    resolver: zodResolver(
      z.object({
        book_time: z
          .string()
          .refine((val) => dayjs(val).isValid(), {
            error: t('services.error.invalid_time'),
          })
          .refine(
            (val) => {
              const inputTime = dayjs(val);
              // Thời gian tối thiểu = Hiện tại + 1 tiếng
              const minTime = dayjs().add(1, 'hour');

              // Kiểm tra: inputTime phải LỚN HƠN hoặc BẰNG minTime (tính theo phút)
              // 'minute' ở tham số thứ 2 giúp dayjs bỏ qua giây và mili-giây khi so sánh
              return inputTime.isAfter(minTime, 'minute') || inputTime.isSame(minTime, 'minute');
            },
            {
              error: t('services.error.invalid_time'), // "Vui lòng đặt trước ít nhất 1 tiếng"
            }
          ),
        note: z.string().optional(), // Cho phép rỗng
        address: z.string().min(1, { error: t('services.error.invalid_address') }),
        lat: z.number(),
        lng: z.number(),
        coupon_id: z.string().optional(),
      })
    ),
    defaultValues: {
      book_time: dayjs().toISOString(),
      address: '',
      lat: 0,
      lng: 0,
    },
  });

  // Lấy danh sách coupon (tất cả) cho dịch vụ đang chọn
  const queryCoupon = useQueryListCoupon(
    {
      filter: {
        for_service_id: pickServiceBooking?.service_id,
      },
    },
    enableCoupon && !!pickServiceBooking?.service_id
  );

  const mutationBookingService = useMutationBookingService();
  // Auto-fill location
  useEffect(() => {
    if (storeLocation) {
      form.setValue('address', storeLocation.address);
      form.setValue('lat', storeLocation.location.coords.latitude);
      form.setValue('lng', storeLocation.location.coords.longitude);
    }
  }, [storeLocation]);

  // Kiểm tra xem booking có tồn tại hay không
  useEffect(() => {
    // Nếu không có booking, quay lại màn hình trước
    if (!pickServiceBooking) {
      router.back();
    }
    // Xóa booking khi component unmount
    return () => {
      setPickServiceBooking(null);
      setStep(_StepFormBooking.MAP);
    };
  }, [pickServiceBooking]);

  // Xử lý khi nhấn nút "Tiếp tục" ở bước MAP
  const handleNextStep = () => {
    form.trigger(['address', 'lat', 'lng']).then((valid) => {
      if (valid) {
        setStep(_StepFormBooking.FORM);
        setEnableCoupon(true);
      }
    });
  };

  // Xử lý khi nhấn nút "Quay lại" ở bước FORM
  const handleForwardStep = () => {
    setStep(_StepFormBooking.MAP);
    form.setValue('book_time', dayjs().toISOString());
    form.setValue('note', '');
    form.setValue('coupon_id', undefined);
    setEnableCoupon(false);
  };

  // Xử lý khi nhấn nút "Đặt lịch" ở bước FORM
  const handleBooking = (data: PickBookingRequirement) => {
    if (pickServiceBooking) {
      const request: BookingServiceRequest = {
        ...data,
        ...pickServiceBooking,
        book_time: dayjs(data.book_time).format('YYYY-MM-DD HH:mm:ss'),
      };
      setLoading(true);
      mutationBookingService.mutate(request, {
        onSuccess: () => {
          // Xử lý khi đặt lịch thành công
          setLoading(false);
          setPickServiceBooking(null);
          setStep(_StepFormBooking.MAP);
          router.push('/(app)/(tab)/orders');
        },
        onError: (error) => {
          // Xử lý khi có lỗi xảy ra
          setLoading(false);
          handleError(error);
        },
      });
    }
  };

  return {
    pickServiceBooking,
    step,
    form,
    handleNextStep,
    handleForwardStep,
    queryCoupon,
    handleBooking,
  };
};
