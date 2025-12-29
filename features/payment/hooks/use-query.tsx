import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import paymentApi from '@/features/payment/api';
import { ListTransactionRequest, ListTransactionResponse } from '@/features/payment/types';


/**
 * Lấy thông tin ví
 */
export const useWalletQuery = () => {
  return useQuery({
    queryKey: ['paymentApi-myWallet'],
    queryFn: () => paymentApi.myWallet(),
    select: res => res.data,
  });
}

/**
 * Lấy thông tin giao dịch theo transactionId - dùng polling để kiểm tra trạng thái giao dịch
 */
export const useTransactionPolling = (transactionId: string | null) => {
  return useQuery({
    queryKey: ['paymentApi-checkTransaction', transactionId],
    queryFn: async () => {
      return await paymentApi.checkTransaction({ transaction_id: transactionId || '' });
    },

    // Chỉ chạy khi có transactionId
    enabled: !!transactionId,

    // LOGIC POLLING QUAN TRỌNG Ở ĐÂY:
    refetchInterval: (query) => {
      const data = query.state.data;
      // Nếu đã có data và is_completed = true -> Dừng Polling (return false)
      if (data?.data?.is_completed) {
        return false;
      }
      // Nếu chưa hoàn thành -> Tiếp tục gọi lại sau 5 giây (5000ms)
      return 5000;
    },

    // Tự động fetch lại khi user quay lại app (ví dụ chuyển khoản xong quay lại)
    refetchOnWindowFocus: true,
  });
};

/**
 * Lấy danh sách giao dịch
 * @param params
 * @param enabled
 */
export const useInfiniteTransactionList = (
  params: ListTransactionRequest, enabled?: boolean
) => {
  return useInfiniteQuery<ListTransactionResponse>({
    queryKey: ['paymentApi-listTransaction', params],
    queryFn: async ({ pageParam }) => {
      return paymentApi.listTransaction({
        ...params,
        page: pageParam as number,
        per_page: params.per_page,
      });
    },
    enabled,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data?.meta?.current_page ?? 1;
      const lastPageNum = lastPage.data?.meta?.last_page ?? 1;
      if (currentPage < lastPageNum) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

/**
 * Lấy thông tin tài khoản rút tiền
 */
export const useQueryInfoWithdraw = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['paymentApi-infoWithdraw'],
    queryFn: () => paymentApi.infoWithdraw(),
    select: res => res.data,
    enabled,
  });
}

export const useQueryListBankInfo = (enabled?: boolean) => {
  return useQuery({
    queryKey: ['paymentApi-listBankInfo'],
    queryFn: () => paymentApi.listBankInfo(),
    select: res => res.data,
    enabled,
  });
}
