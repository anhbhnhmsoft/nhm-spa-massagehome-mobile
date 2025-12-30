import {
  useInfiniteTransactionList,
  useQueryInfoWithdraw,
  useQueryListBankInfo,
  useTransactionPolling,
  useWalletQuery,
} from '@/features/payment/hooks/use-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useConfigPaymentMutation,
  useCreateWithdrawInfoMutation,
  useDeleteWithdrawInfoMutation,
  useDepositMutation,
  useRequestWithdrawMutation,
} from '@/features/payment/hooks/use-mutation';
import { useWalletStore } from '@/features/payment/stores';
import useApplicationStore from '@/lib/store';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import {
  ConfigPaymentItem,
  CreateWithdrawInfoRequest,
  DepositRequest,
  ListTransactionRequest,
  QRBankData,
  RequestWithdrawRequest,
} from '@/features/payment/types';
import { useForm } from 'react-hook-form';
import { _PaymentType, _UserWithdrawInfoType } from '@/features/payment/consts';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import { useGetCouponUserList } from '@/features/service/hooks';
import { getMessageError } from '@/lib/utils';
import { Alert } from 'react-native';

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
  const queryTransactionList = useGetTransactionList(
    {
      filter: {},
      page: 1,
      per_page: 10,
    },
    tab === 'transaction'
  );

  // Query function dùng để gọi API lấy danh sách coupon user
  const queryCouponUserList = useGetCouponUserList(
    {
      filter: {},
      page: 1,
      per_page: 10,
    },
    tab === 'coupon'
  );

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
        router.push('/(app)/(service-ktv)/deposit');
      },
      onError: (err) => {
        console.log(err);
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
    refresh,
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

/**
 * Hook dùng cho màn rút tiền
 */
export const useWithdrawInfo = (openModal: boolean, onClose: () => void) => {
  const queryListInfoWithdraw = useQueryInfoWithdraw(openModal);
  const { t } = useTranslation();
  const { error: errorToast, success: successToast } = useToast(true);

  const { mutate: deleteWithdrawInfo, isPending: isDeleting } = useDeleteWithdrawInfoMutation();

  useEffect(() => {
    // Kiểm tra nếu có lỗi khi gọi API lấy thông tin rút tiền
    if (queryListInfoWithdraw.isError && openModal) {
      errorToast({
        message: t('payment.error.get_info_withdraw'),
      });
      onClose();
    }
  }, [queryListInfoWithdraw.isError, openModal, t, onClose]);

  // Xóa thông tin rút tiền ngân hàng
  const deleteWithdrawInfoItem = useCallback((id: string) => {
    Alert.alert(
      t('payment.confirm.delete_withdraw_info'),
      t('payment.confirm.delete_withdraw_info_message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.accept'),
          style: 'destructive',
          onPress: () => {
            deleteWithdrawInfo(
              { id },
              {
                onSuccess: () => {
                  successToast({
                    message: t('payment.success.delete_withdraw_info'),
                  });
                  queryListInfoWithdraw.refetch();
                },
                onError: (err) => {
                  const message = getMessageError(err, t);
                  if (message) {
                    errorToast({
                      message,
                    });
                  }
                },
              }
            );
          },
        },
      ]
    );
  }, []);

  return {
    queryListInfoWithdraw,
    deleteWithdrawInfoItem,
    isDeleting,
  };
};

/**
 * Hook dùng cho màn tạo thông tin rút tiền ngân hàng
 */
export const useCreateInfoWithdraw = (
  openModal: boolean,
  onClose: () => void,
  onSuccess: () => void
) => {
  const { t } = useTranslation();

  const { error: errorToast, success: successToast } = useToast(true);

  const queryListBankInfo = useQueryListBankInfo(openModal);

  const { mutate: mutateCreateWithdrawInfo, isPending } = useCreateWithdrawInfoMutation();

  // Schema validate form thông tin rút tiền ngân hàng
  const form = useForm<CreateWithdrawInfoRequest>({
    resolver: zodResolver(
      z.object({
        type: z.literal(_UserWithdrawInfoType.BANK),
        config: z.object({
          bank_bin: z.string().min(1),
          bank_name: z
            .string({ error: t('payment.error.bank_name') })
            .min(1, t('payment.error.bank_name_empty')),
          bank_account: z
            .string({ error: t('payment.error.bank_account') })
            .min(1, t('payment.error.bank_account_empty')),
          bank_holder: z
            .string({ error: t('payment.error.bank_holder') })
            .min(1, t('payment.error.bank_holder_empty')),
        }),
      })
    ),
  });

  // Kiểm tra nếu có lỗi khi gọi API lấy thông tin ngân hàng
  useEffect(() => {
    if (queryListBankInfo.isError && openModal) {
      errorToast({
        message: t('payment.error.get_bank_info'),
      });
      onClose();
    }
  }, [queryListBankInfo.isError, openModal, t, onClose]);

  // Reset form khi mở modal
  useEffect(() => {
    if (openModal) {
      form.reset({
        type: _UserWithdrawInfoType.BANK,
        config: {
          bank_bin: '',
          bank_name: '',
          bank_account: '',
          bank_holder: '',
        },
      });
    }
  }, [openModal]);

  // Tạo options cho select ngân hàng
  const optionSelectBank = useMemo(
    () =>
      queryListBankInfo.data?.map((item) => ({
        value: item.bin,
        label: item.short_name,
      })) || [],
    [queryListBankInfo.data]
  );

  const submitCreateWithdrawInfo = form.handleSubmit((values) => {
    mutateCreateWithdrawInfo(values, {
      onSuccess: () => {
        successToast({
          message: t('payment.success.create_withdraw_info'),
        });
        onSuccess();
      },
      onError: (err) => {
        const message = getMessageError(err, t);
        if (message) {
          errorToast({
            message,
          });
        }
      },
    });
  });

  return {
    form,
    loading: queryListBankInfo.isLoading || isPending,
    optionSelectBank,
    submitCreateWithdrawInfo,
  };
};

/**
 * Hook dùng cho màn yêu cầu rút tiền ngân hàng
 */
export const useRequestWithdraw = (id: string, setId: (id: string) => void) => {
  const { t } = useTranslation();
  const { error: errorToast, success: successToast } = useToast(true);

  const configPayment = useWalletStore((state) => state.configPayment);
  const setConfigPayment = useWalletStore((state) => state.setConfigPayment);
  // Làm mới dữ liệu ví sau khi yêu cầu rút tiền thành công
  const refreshWallet = useWalletStore((state) => state.refreshWallet);

  // config payment
  const { mutate: mutateConfigPayment, isPending: isConfigPaymentPending } =
    useConfigPaymentMutation();

  // mutate function để gọi API yêu cầu rút tiền ngân hàng
  const { mutate: mutateRequestWithdraw, isPending: isRequestWithdrawPending } =
    useRequestWithdrawMutation();

  // form validate
  const form = useForm<RequestWithdrawRequest>({
    resolver: zodResolver(
      z.object({
        user_withdraw_info_id: z.string().min(1),
        amount: z
          .string()
          .min(1, t('payment.error.amount_withdraw_empty'))
          .transform((val) => val.replace(/,/g, '')) // Xóa dấu phẩy trước khi check số
          .refine((val) => !isNaN(Number(val)) && Number(val) >= 50, {
            message: t('payment.error.amount_withdraw_min'),
          }),
        note: z.string().optional(),
      })
    ),
    defaultValues: {
      user_withdraw_info_id: id,
      amount: '',
      note: '',
    },
  });

  useEffect(() => {
    // Gọi API config payment khi mở modal
    if (id) {
      form.setValue('user_withdraw_info_id', id);
      mutateConfigPayment(undefined, {
        onSuccess: (res) => {
          setConfigPayment(res.data);
        },
        onError: (err) => {
          setId('');
          const message = getMessageError(err, t);
          if (message) {
            errorToast({
              message,
            });
          }
        },
      });
    }
  }, [id]);

  // submit form yêu cầu rút tiền ngân hàng
  const submitRequestWithdraw = form.handleSubmit((values) => {
    mutateRequestWithdraw(values, {
      onSuccess: () => {
        successToast({
          message: t('payment.success.request_withdraw'),
        });
        refreshWallet(true);
        setId('');
      },
      onError: (err) => {
        const message = getMessageError(err, t);
        if (message) {
          errorToast({
            message,
          });
        }
      },
    });
  });

  return {
    form,
    submitRequestWithdraw,
    loading: isConfigPaymentPending || isRequestWithdrawPending,
    configPayment,
  };
};
