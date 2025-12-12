import { useMutation } from '@tanstack/react-query';
import paymentApi from '@/features/payment/api';
import { DepositRequest } from '@/features/payment/types';

/**
 * Mutation hook để gọi API lấy thông tin cấu hình thanh toán
 */
export const useConfigPaymentMutation = () => {
  return useMutation({
    mutationFn: () => paymentApi.configPayment(),
  })
}

/**
 * Mutation hook để gọi API nạp tiền
 */
export const useDepositMutation = () => {
  return useMutation({
    mutationFn: (data: DepositRequest) => paymentApi.deposit(data),
  })
}
