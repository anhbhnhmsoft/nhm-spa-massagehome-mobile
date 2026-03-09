import { useAuthStore } from '@/features/auth/stores';
import { useQueryDashboardProfile } from '@/features/profile/hooks/use-query';
import { useCallback, useMemo } from 'react';

/**
 * Xử lý màn hình profile
 */
export const useProfileCustomer = () => {
  const user = useAuthStore((state) => state.user);

  const {
    data: DashboardData,
    isLoading: DashboardLoading,
    isRefetching: DashboardLoadingRefetch,
    refetch: DashboardRefetch,
  } = useQueryDashboardProfile();

  const isLoading = useMemo(() => {
    return (DashboardLoading || DashboardLoadingRefetch);
  }, [
    DashboardLoading, DashboardLoadingRefetch,
  ]);


  const refreshProfile = useCallback(async () => {
    await DashboardRefetch();
  }, []);

  return {
    user,
    dashboardData: DashboardData,
    refreshProfile,
    isLoading,
  };
};
