import { useMutation, useQueryClient } from '@tanstack/react-query';
import profileApi from '@/features/profile/api';
import { CustomerCrmPreferences } from '@/features/profile/types';

/**
 * Hook để cập nhật cài đặt nhu cầu CRM khách hàng
 */
export const useMutationUpdateCrmPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CustomerCrmPreferences>) => profileApi.updateCrmPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileApi-crmPreferences'] });
    },
  });
};
