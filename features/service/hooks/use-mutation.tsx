import { useMutation } from '@tanstack/react-query';
import serviceApi from '@/features/service/api';
import { BookingServiceRequest } from '@/features/service/types';


export const useMutationServiceDetail = () => {
  return useMutation({
    mutationFn: (serviceId: string) => serviceApi.detailService(serviceId),
  });
};

export const useMutationBookingService = () => {
  return useMutation({
    mutationFn: (data: BookingServiceRequest) => serviceApi.bookingService(data),
  });
};
