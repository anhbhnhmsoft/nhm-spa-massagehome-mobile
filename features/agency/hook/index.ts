import { useCallback, useEffect, useMemo, useState } from 'react';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useWalletStore } from '@/features/payment/stores';
import { useConfigPaymentMutation } from '@/features/payment/hooks/use-mutation';
import { useWalletQuery } from '@/features/payment/hooks/use-query';
import { useGetTransactionList } from '@/features/payment/hooks';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { _TimeFilter } from '@/features/agency/const';
import { useDashboardAgencyQuery, useListKtvPerformanceQuery, } from '@/features/agency/hook/use-query';

/**
 * Hook dùng cho màn ví
 */
export const useWallet = () => {
  const setLoading = useApplicationStore((state) => state.setLoading);
  const handleError = useErrorToast();
  const setConfigPayment = useWalletStore((state) => state.setConfigPayment);
  const needRefresh = useWalletStore((state) => state.need_refresh);
  const refreshWallet = useWalletStore((state) => state.refreshWallet);
  // Mutate function dùng để gọi API cấu hình nạp tiền
  const { mutate: mutateConfigPayment } = useConfigPaymentMutation();

  // Query function dùng để gọi API lấy thông tin ví
  const queryWallet = useWalletQuery();

  // Query function dùng để gọi API lấy danh sách giao dịch
  const queryTransactionList = useGetTransactionList({
    filter: {},
    page: 1,
    per_page: 10,
  });

  useEffect(() => {
    // Nếu cần refresh ví, gọi API refresh ví
    if (needRefresh) {
      refresh();
    }
  }, [needRefresh]);

  useEffect(() => {
    if (queryWallet.error) {
      handleError(queryWallet.error);
    }
    if (queryTransactionList.error) {
      handleError(queryTransactionList.error);
    }
  }, [queryWallet.error, queryTransactionList.error]);

  // Hàm gọi API refresh ví và danh sách giao dịch
  const refresh = async () => {
    await queryWallet.refetch();
    try {
      await queryWallet.refetch();
      await queryTransactionList.refetch();
    } catch (error) {
      handleError(error);
    } finally {
      refreshWallet(false);
    }
  };

  // Hàm điều hướng đến màn hình nạp tiền
  const goToDepositScreen = useCallback(() => {
    setLoading(true);
    mutateConfigPayment(undefined, {
      onSuccess: (res) => {
        setConfigPayment(res.data);
        router.push('/(app)/(service-agency)/deposit');
      },
      onError: (err) => {
        handleError(err);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  }, []);

  return {
    queryWallet,
    queryTransactionList,
    goToDepositScreen,
    refresh,
  };
};

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
