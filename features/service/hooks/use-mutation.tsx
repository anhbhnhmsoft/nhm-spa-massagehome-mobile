import { useMutation } from '@tanstack/react-query';
import serviceApi from '@/features/service/api';
import { SendReviewRequest } from '@/features/service/types';

/**
 * Lấy thông tin chi tiết dịch vụ
 */
export const useMutationServiceDetail = () => {
  return useMutation({
    mutationFn: (serviceId: string) => serviceApi.detailService(serviceId),
  });
};



/**
 * Gửi đánh giá dịch vụ
 */
export const useMutationSendReview = () => {
  return useMutation({
    mutationFn: (data: SendReviewRequest) => serviceApi.sendReview(data),
  });
};

