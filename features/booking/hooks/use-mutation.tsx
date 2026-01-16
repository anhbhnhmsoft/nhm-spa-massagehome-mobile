import { useMutation } from '@tanstack/react-query';
import { CancelBookingRequest } from '@/features/ktv/types';
import bookingApi from '@/features/booking/api';

export const useCancelBookingCustomerMutation = () => {
  return useMutation({
    mutationFn: (data: CancelBookingRequest) => bookingApi.cancelBooking(data),
  });
};
