import { useMutation } from '@tanstack/react-query';
import serviceApi from '@/features/service/api';
import { BookingServiceRequest, PrepareBookingRequest, SendReviewRequest } from '@/features/service/types';

/**
 * Lấy thông tin chi tiết dịch vụ
 */
export const useMutationServiceDetail = () => {
  return useMutation({
    mutationFn: (serviceId: string) => serviceApi.detailService(serviceId),
  });
};

/**
 * Đặt lịch hẹn dịch vụ
 */
export const useMutationBookingService = () => {
  return useMutation({
    mutationFn: (data: BookingServiceRequest) => serviceApi.bookingService(data),
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

/**
 * Lấy thông tin trước khi đặt lịch dịch vụ
 */
export const useMutationPrepareBooking = () => {
  return useMutation({
    mutationFn: (data: PrepareBookingRequest) => serviceApi.prepareBooking(data),
  })
}