import { useMutation } from '@tanstack/react-query';
import serviceApi from '@/features/service/api';
import { SendReviewRequest, TranslateReviewRequest } from '@/features/service/types';

/**
 * Gửi đánh giá dịch vụ
 */
export const useMutationSendReview = () => {
  return useMutation({
    mutationFn: (data: SendReviewRequest) => serviceApi.sendReview(data),
  });
};

/**
 * Dich đánh giá dịch vụ
 */
export const useMutationTranslateReview = () => {
  return useMutation({
    mutationFn: (data: TranslateReviewRequest) => serviceApi.translateReview(data),
  });
};
