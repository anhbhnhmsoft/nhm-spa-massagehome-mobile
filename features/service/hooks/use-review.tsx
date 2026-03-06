import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import { useMutationSendReview } from '@/features/service/hooks/use-mutation';
import { useForm } from 'react-hook-form';
import { SendReviewRequest } from '@/features/service/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useEffect, useRef } from 'react';
import { getMessageError } from '@/lib/utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

/**
 * hook dùng cho modal đánh giá dịch vụ
 * @param onSuccess Callback khi đánh giá thành công
 */
export const useReview = (onSuccess: () => void) => {
  const { t } = useTranslation();
  const ref  = useRef<BottomSheetModal>(null);
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
      service_booking_id: '',
      rating: 5,
      comment: '',
      hidden: false,
    },
  });

  const onSubmit = (data: SendReviewRequest) => {
    sendReview(data, {
      onSuccess: () => {
        success({ message: t('services.success.review_success') });
        onSuccess();
        handleClose();
      },
      onError: (error) => {
        const message = getMessageError(error, t);
        if (message) {
          form.setError('comment', { message: message });
        }
      },
    });
  };

  const handleOpen = useCallback((serviceBookingId: string) => {
    ref.current?.present();
    form.setValue('service_booking_id', serviceBookingId);
  }, []);

  const handleClose = useCallback(() => {
    ref.current?.close();
    form.reset();
  }, []);


  return {
    form,
    loading: isPending,
    onSubmit,
    handleOpen,
    handleClose,
    ref
  };
};