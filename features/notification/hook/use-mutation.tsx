import { useMutation } from '@tanstack/react-query';
import { apiNotification } from '../api';

export const useReadNotificationMutation = () => {
  return useMutation({
    mutationFn: (id: string) => apiNotification.readNotification(id),
  });
};
