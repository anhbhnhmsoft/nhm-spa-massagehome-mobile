import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { _TimeFilter } from '@/features/agency/const';
import { useDashboardAgencyQuery, useListKtvPerformanceQuery, } from '@/features/agency/hook/use-query';

/**
 * Hook để quản lý dashboard của đại lý
 */
export const useDashboardAgency = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<_TimeFilter>(_TimeFilter.ALL);

  // 1. Thống kê Header
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useDashboardAgencyQuery(activeFilter);

  // 2. Danh sách KTV (Infinite Query)
  const {
    data: performanceData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPerformanceLoading,
    refetch: refetchPerformance,
    isRefetching,
  } = useListKtvPerformanceQuery(activeFilter);

  // 3. Xử lý dữ liệu
  const tabs = useMemo(() => Object.values(_TimeFilter), []);

  const listPerformanceKtv = useMemo(() => {
    return performanceData?.pages.flatMap((page) => page.data) || [];
  }, [performanceData]);

  // 4. Các hàm hành động
  const onRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchPerformance()]);
  }, [refetchStats, refetchPerformance]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    t,
    tabs,
    activeFilter,
    setActiveFilter,
    statsData,
    isStatsLoading,
    listPerformanceKtv,
    isPerformanceLoading,
    isFetchingNextPage,
    isRefetching,
    onRefresh,
    handleLoadMore,
  };
};
