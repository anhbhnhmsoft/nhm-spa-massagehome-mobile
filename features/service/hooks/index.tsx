import {
  useInfiniteCategoryList, useInfiniteListReview,
  useInfiniteServiceList,
  useQueryListCoupon,
  useQueryListCouponUser,
} from '@/features/service/hooks/use-query';
import {
  BookingServiceRequest,
  CategoryListFilterPatch,
  CategoryListRequest,
  CouponUserListRequest, ListReviewRequest,
  PickBookingItem,
  PickBookingRequirement,
  SendReviewRequest,
  ServiceItem,
  ServiceListRequest,
} from '@/features/service/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useApplicationStore from '@/lib/store';
import useServiceStore from '@/features/service/stores';
import { router } from 'expo-router';
import {
  useMutationBookingService,
  useMutationSendReview,
  useMutationServiceDetail,
} from '@/features/service/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useLocationAddress } from '@/features/app/hooks/use-location';
import useAuthStore from '@/features/auth/store';
import { useImmer } from 'use-immer';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import useToast from '@/features/app/hooks/use-toast';
import { formatBalance, getMessageError } from '@/lib/utils';

/**
 * Lấy danh sách danh mục dịch vụ
 * @param initialParams
 * @param isFeature
 */
export const useGetCategoryList = (initialParams: Omit<CategoryListRequest, 'filter'>, isFeature?: boolean) => {
  // Sử dụng useImmer để quản lý params (chứa filter)
  const [params, setParams] = useImmer<CategoryListRequest>({
    ...initialParams,
    filter: {
      keyword: '',
      is_featured: isFeature === true ? true : undefined,
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
  const redirect = useCheckAuthToRedirect();

  const { mutate } = useMutationServiceDetail();

  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleError = useErrorToast();

  return (id: string) => {
    redirect(() => {
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
    });
  };
};

/**
 * detail service
 */
export const useServiceDetail = () => {
  const service = useServiceStore((s) => s.service);
  const setPickServiceBooking = useServiceStore((s) => s.setPickServiceBooking);

  // Kiểm tra xem dịch vụ có tồn tại và đang hoạt động hay không
  useEffect(() => {
    // Nếu không có service, quay lại màn hình trước
    if (!service || !service.is_active) {
      router.back();
    }
  }, [service]);

  const pickServiceToBooking = (data: PickBookingItem) => {
    setPickServiceBooking(data);
    router.push('/(app)/(service)/service-booking');
  };

  return {
    detail: service as ServiceItem,
    pickServiceToBooking,
  };
};

/**
 * booking service
 */
export const useServiceBooking = () => {
  const pickServiceBooking = useServiceStore((s) => s.pick_service_booking);
  const setPickServiceBooking = useServiceStore((s) => s.setPickServiceBooking);
  const user = useAuthStore((s) => s.user);
  const mutationBookingService = useMutationBookingService();
  const { t } = useTranslation();
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { location: storeLocation } = useLocationAddress();
  const handleError = useErrorToast();
  const { error: errorToast, warning: warningToast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  // Thông tin form booking
  const form = useForm<PickBookingRequirement>({
    resolver: zodResolver(
      z.object({
        book_time: z.string().refine((val) => dayjs(val).isValid(), {
          error: t('services.error.invalid_time'),
        }),
        note: z.string().optional(), // Cho phép rỗng
        note_address: z.string().optional(), // Cho phép rỗng
        address: z.string().min(1, { error: t('services.error.invalid_address') }),
        latitude: z.number(),
        longitude: z.number(),
        coupon_id: z.string().optional(),
      })
    ),
    defaultValues: {
      book_time: dayjs().toISOString(),
      address: '',
      latitude: 0,
      longitude: 0,
    },
  });

  // Lấy danh sách coupon (tất cả) cho dịch vụ đang chọn
  const queryCoupon = useQueryListCoupon(
    {
      filter: {
        for_service_id: pickServiceBooking?.service_id,
      },
    },
    true
  );

  // Auto-fill location
  useEffect(() => {
    // Nếu có primary_location, tự động điền thông tin vào form
    if (user && user.primary_location) {
      form.setValue('address', user.primary_location.address);
      form.setValue('latitude', Number(user.primary_location.latitude));
      form.setValue('longitude', Number(user.primary_location.longitude));
      form.setValue('note_address', user.primary_location.desc || '');
    } else if (storeLocation) {
      form.setValue('address', storeLocation.address);
      form.setValue('latitude', storeLocation.location.coords.latitude);
      form.setValue('longitude', storeLocation.location.coords.longitude);
    }
  }, [storeLocation, user]);

  // Kiểm tra xem booking có tồn tại hay không
  useEffect(() => {
    // Nếu không có booking, quay lại màn hình trước
    if (!pickServiceBooking) {
      router.back();
    }
    // Nếu có, reset form khi quay lại màn hình
    return () => {
      form.reset();
    };
  }, [pickServiceBooking]);

  // Xử lý khi nhấn nút "Đặt lịch"
  const handleBooking = (data: PickBookingRequirement) => {
    if (pickServiceBooking) {
      const request: BookingServiceRequest = {
        ...data,
        ...pickServiceBooking,
        book_time: dayjs(data.book_time).format('YYYY-MM-DD HH:mm:ss'),
      };
      setLoading(true);
      mutationBookingService.mutate(request, {
        onSuccess: (res) => {
          const data = res.data;
          // Xử lý khi đặt lịch thành công
          if (data.status && data.success) {
            setShowSuccessModal(true);
            setBookingId(data.success.booking_id);
          }
          // Xử lý khi đặt lịch thất bại
          else {
            if (data.failed) {
              // Trường hợp không đủ tiền
              if (data.failed.not_enough_money) {
                const finalPrice = formatBalance(data.failed.final_price);
                const balance = formatBalance(data.failed.balance_customer);
                warningToast({
                  message: t('services.error.not_enough_money', {
                    total_price: finalPrice,
                    balance: balance,
                    currency: t('common.currency'),
                  }),
                });
                // Chuyển hướng đến màn hình wallet để nạp tiền
                router.push('/(app)/(profile)/wallet');
              }
            } else {
              // trường hợp không có lỗi cụ thể
              errorToast({ message: t('common_error.unknown_error') });
            }
          }
        },
        onError: (error) => {
          // Xử lý khi có lỗi xảy ra
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  return {
    detail: pickServiceBooking as PickBookingItem,
    form,
    queryCoupon,
    handleBooking,
    showSuccessModal,
    bookingId,
    setShowSuccessModal,
    setPickServiceBooking,
  };
};

/**
 * Lấy danh sách coupon đã sử dụng của user
 * @param params
 * @param enabled
 */
export const useGetCouponUserList = (params: CouponUserListRequest, enabled?: boolean) => {
  const query = useQueryListCouponUser(params, enabled);

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
  };
};

/**
 * hook dùng cho modal đánh giá dịch vụ
 * @param serviceBookingId ID của dịch vụ cần đánh giá
 * @param onSuccess Callback khi đánh giá thành công
 */
export const useReviewModal = (serviceBookingId: string, onSuccess: () => void) => {
  const { t } = useTranslation();
  const { success } = useToast();

  const { mutate: sendReview, isPending } = useMutationSendReview();

  const form = useForm<SendReviewRequest>({
    resolver: zodResolver(
      z.object({
        service_booking_id: z.string(),
        rating: z
          .number()
          .min(1, { error: t('services.error.rating_invalid') })
          .max(5, { error: t('services.error.rating_invalid') }),
        comment: z.string().max(1000).optional().or(z.literal('')),
        hidden: z.boolean().default(false),
      })
    ),
    defaultValues: {
      service_booking_id: serviceBookingId || '',
      rating: 5,
      comment: '',
      hidden: false,
    },
  });

  useEffect(() => {
    if (serviceBookingId) {
      form.setValue('service_booking_id', serviceBookingId);
    }
  }, [serviceBookingId]);

  const onSubmit =  (data: SendReviewRequest) => {
    sendReview(data, {
      onSuccess: () => {
        success({ message: t('services.success.review_success') });
        onSuccess();
        form.reset();
      },
      onError: (error) => {
        const message = getMessageError(error, t);
        if (message) {
          form.setError('comment', {message: message});
        }
      }
    });
  };

  return {
    form,
    loading: isPending,
    onSubmit,
  };
};

/**
 * Lấy danh sách review của user
 * @param user_id
 */
export const useGetReviewList = (user_id: string) => {
  const query = useInfiniteListReview({
    filter: {
      user_id: user_id,
    },
    page: 1,
    per_page: 10
  });

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
  };
};