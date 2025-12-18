import {
  useInfiniteTransactionList,
  useTransactionPolling,
  useWalletQuery,
} from '@/features/payment/hooks/use-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useConfigPaymentMutation,
  useDepositMutation,
} from '@/features/payment/hooks/use-mutation';
import { useWalletStore } from '@/features/payment/stores';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import {
  ConfigPaymentItem,
  DepositRequest,
  ListTransactionRequest,
  QRBankData,
} from '@/features/payment/types';
import { useForm } from 'react-hook-form';
import { _PaymentType } from '@/features/payment/consts';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import { useGetCouponUserList } from '@/features/service/hooks';

/**
 * Hook dùng cho màn danh sách giao dịch
 * @param params
 * @param enabled
 */
export const useGetTransactionList = (params: ListTransactionRequest, enabled?: boolean) => {
  const query = useInfiniteTransactionList(params, enabled);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
  };
};

/**
 * Hook dùng cho màn ví
 */
export const useWallet = () => {
  const setLoading = useApplicationStore((state) => state.setLoading);
  const handleError = useErrorToast();
  const setConfigPayment = useWalletStore((state) => state.setConfigPayment);
  const needRefresh = useWalletStore((state) => state.need_refresh);
  const refreshWallet = useWalletStore((state) => state.refreshWallet);
  const [tab, setTab] = useState<'transaction' | 'coupon'>('transaction');

  // Mutate function dùng để gọi API cấu hình nạp tiền
  const { mutate: mutateConfigPayment } = useConfigPaymentMutation();

  // Query function dùng để gọi API lấy thông tin ví
  const queryWallet = useWalletQuery();

  // Query function dùng để gọi API lấy danh sách giao dịch
  const queryTransactionList = useGetTransactionList({
    filter: {},
    page: 1,
    per_page: 10,
  }, tab === 'transaction');

  // Query function dùng để gọi API lấy danh sách coupon user
  const queryCouponUserList = useGetCouponUserList({
    filter: {},
    page: 1,
    per_page: 10,
  }, tab === 'coupon');

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
      await queryCouponUserList.refetch();
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
        router.push('/(app)/(profile)/deposit');
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
    tab,
    setTab,
    queryWallet,
    queryTransactionList,
    queryCouponUserList,
    goToDepositScreen,
    refresh
  };
};

/**
 * Hook dùng cho màn nạp tiền
 */
export const useDeposit = () => {
  const configPayment = useWalletStore((state) => state.configPayment);
  const setLoading = useApplicationStore((state) => state.setLoading);
  const handleError = useErrorToast();
  const { t } = useTranslation();

  // State lưu trữ dữ liệu QRBankData khi nạp tiền qua VietQR
  const setTransactionId = useWalletStore((state) => state.setTransactionId);
  const setQrBankData = useWalletStore((state) => state.setQrBankData);

  // Mutate function dùng để gọi API nạp tiền
  const { mutate: mutateDeposit } = useDepositMutation();

  // Form dùng để validate và submit
  const form = useForm<DepositRequest>({
    defaultValues: {
      amount: '',
      payment_type: _PaymentType.QR_BANKING,
    },
    resolver: zodResolver(
      z.object({
        // Amount nhận vào là string (từ input), nhưng cần validate logic số học
        amount: z
          .string()
          .min(1, t('payment.error.empty_amount')) // Check rỗng
          .refine(
            (val) => {
              // Loại bỏ dấu chấm/phẩy để lấy số thực
              const numberValue = parseInt(val.replace(/[^0-9]/g, ''));
              return !isNaN(numberValue) && numberValue >= 10000;
            },
            {
              error: t('payment.error.min_amount'),
            }
          )
          .refine(
            (val) => {
              const numberValue = parseInt(val.replace(/[^0-9]/g, ''));
              return numberValue <= 50000000;
            },
            {
              error: t('payment.error.max_amount'),
            }
          ),

        payment_type: z.enum(_PaymentType, {
          error: t('payment.error.invalid_payment_type'),
        }),
      })
    ),
  });

  // Hàm submit nạp tiền
  const submitDeposit = (data: DepositRequest) => {
    setLoading(true);
    mutateDeposit(data, {
      onSuccess: (res) => {
        const resData = res.data;
        setTransactionId(resData.transaction_id);
        // Tùy vào payment_type, có thể là QRBankData hoặc ZaloPayData hoặc MomoPayData
        switch (data.payment_type) {
          case _PaymentType.QR_BANKING:
            const qrBankData = resData.data_payment as QRBankData;
            setQrBankData(qrBankData);
            break;
          default:
            break;
        }
      },
      onError: (err) => {
        handleError(err);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    // Kiểm tra nếu không có configPayment thì quay lại màn hình trước
    if (!configPayment) {
      router.back();
    }
  }, [configPayment]);

  return {
    configPayment: configPayment as ConfigPaymentItem,
    form,
    submitDeposit,
  };
};

/**
 * Hook dùng cho màn kiểm tra nạp tiền qua QR Banking
 */
export const useCheckPaymentQRCode = () => {
  const setLoading = useApplicationStore((state) => state.setLoading);
  const handleError = useErrorToast();
  const { t } = useTranslation();
  const { success } = useToast();

  // State lưu trữ dữ liệu QRBankData khi nạp tiền chuyển khoản
  const qrBankData = useWalletStore((state) => state.qrBankData);
  const transactionId = useWalletStore((state) => state.transactionId);
  const setTransactionId = useWalletStore((state) => state.setTransactionId);
  const setQrBankData = useWalletStore((state) => state.setQrBankData);

  const refreshWallet = useWalletStore((state) => state.refreshWallet);

  const [visible, setVisible] = useState(false);

  const { data: pollData } = useTransactionPolling(transactionId);

  useEffect(() => {
    setVisible(!!transactionId && !!qrBankData);
  }, [transactionId, qrBankData]);

  useEffect(() => {
    // Kiểm tra nếu is_completed = true
    if (pollData?.data?.is_completed) {
      // 1. Thông báo thành công
      success({
        message: t('payment.success.deposit'),
      });
      closeModal(); // Đóng modal
      refreshWallet(true);
      router.push('/(app)/(profile)/wallet');
    }
  }, [pollData?.data?.is_completed]);

  const closeModal = () => {
    setTransactionId(null);
    setQrBankData(null);
  };
  return {
    visible,
    closeModal,
    qrBankData,
  };
};
