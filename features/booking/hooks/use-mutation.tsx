import { useMutation } from '@tanstack/react-query';
import bookingApi from '@/features/booking/api';
import { BookingServiceRequest, PrepareBookingRequest } from '@/features/booking/types';
import { CancelBookingRequest } from '@/features/ktv/types';

export const useMutationPrepareBooking = () => {
  return useMutation({
    mutationFn: (data: PrepareBookingRequest) => bookingApi.prepareBooking(data),
  });
};

export const useMutationBookingService = () => {
  return useMutation({
    mutationFn: (data: BookingServiceRequest) => bookingApi.booking(data),
  });
};

export const useCancelBookingMutation = () => {
  return useMutation({
    mutationFn: (data: CancelBookingRequest) => bookingApi.cancelBooking(data),
  });
};

export const useSelectBookingApplicationMutation = () => {
  return useMutation({
    mutationFn: ({ bookingId, applicationId }: { bookingId: string; applicationId: string }) =>
      bookingApi.selectApplication(bookingId, applicationId),
  });
};
