import profileApi from '@/features/profile/api';
import { useQuery } from '@tanstack/react-query';

/**
 * Lấy thông tin dashboard profile
 */
export const useQueryDashboardProfile = () => {
  return useQuery({
    queryKey: ['profileApi-dashboardProfile'],
    queryFn: async () => {
      return profileApi.dashboardProfile();
    },
    select: res => res.data
  });
};