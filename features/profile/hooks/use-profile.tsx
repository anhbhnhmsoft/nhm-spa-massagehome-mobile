import { useAuthStore } from '@/features/auth/stores';
import { useQueryDashboardProfile } from '@/features/profile/hooks/use-query';
import { useCallback } from 'react';
import { useGetProfile } from '@/features/auth/hooks';

/**
 * Xử lý màn hình profile
 */
export const useProfileCustomer = () => {
  const user = useAuthStore((state) => state.user);
  const resetProfile = useGetProfile();
  const {
    data: DashboardData,
    isLoading: DashboardLoading,
    refetch: DashboardRefetch,
  } = useQueryDashboardProfile();

  const refreshProfile = useCallback(async () => {
    await DashboardRefetch();
    resetProfile();
  }, [DashboardRefetch, resetProfile]);

  return {
    user,
    dashboardData: DashboardData,
    refreshProfile,
    isLoading: DashboardLoading,
  };
};
