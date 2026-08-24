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

/**
 * Lấy thông tin CRM Preferences
 */
export const useQueryCrmPreferences = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['profileApi-crmPreferences'],
    queryFn: async () => {
      return profileApi.getCrmPreferences();
    },
    select: res => res.data,
    enabled,
  });
};