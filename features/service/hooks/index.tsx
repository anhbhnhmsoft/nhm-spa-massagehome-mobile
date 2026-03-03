import {
  useInfiniteListReview,
  useQueryListCouponUser,
} from '@/features/service/hooks/use-query';
import {
  CouponUserListRequest,
  ListReviewRequest,
  SendReviewRequest,
} from '@/features/service/types';
import { useCallback, useEffect, useMemo } from 'react';
import {
  useMutationSendReview,
} from '@/features/service/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useImmer } from 'use-immer';
import useToast from '@/features/app/hooks/use-toast';
import {  getMessageError } from '@/lib/utils';

export * from './use-get-category-list';



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

  const onSubmit = (data: SendReviewRequest) => {
    sendReview(data, {
      onSuccess: () => {
        success({ message: t('services.success.review_success') });
        onSuccess();
        form.reset();
      },
      onError: (error) => {
        const message = getMessageError(error, t);
        if (message) {
          form.setError('comment', { message: message });
        }
      },
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
 */
export const useGetReviewList = (enabled?: boolean) => {
  const [params, setParams] = useImmer<ListReviewRequest>({
    filter: {},
    page: 1,
    per_page: 10,
  });
  // Hàm setFilter
  const setFilter = useCallback(
    (filterPatch: Partial<ListReviewRequest['filter']>) => {
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

  const query = useInfiniteListReview(params, enabled);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    params,
    setFilter,
    data,
    pagination,
  };
};
