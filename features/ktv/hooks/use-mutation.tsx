import { useMutation } from '@tanstack/react-query';
import ktvApi from '../api';

export const useStartBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.startBooking(id),
  });
};
