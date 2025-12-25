import { useMutation } from '@tanstack/react-query';
import paymentApi from '@/features/payment/api';
import {
  DepositRequest,
  CreateWithdrawInfoRequest,
  DeleteWithdrawInfoRequest,
  RequestWithdrawRequest,
} from '@/features/payment/types';

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

/**
 * Mutation hook để gọi API tạo thông tin rút tiền ngân hàng
 */
export const useCreateWithdrawInfoMutation = () => {
  return useMutation({
    mutationFn: (data: CreateWithdrawInfoRequest) => paymentApi.createWithdrawInfo(data),
  })
}

/**
 * Mutation hook để gọi API xóa thông tin rút tiền ngân hàng
 */
export const useDeleteWithdrawInfoMutation = () => {
  return useMutation({
    mutationFn: (data: DeleteWithdrawInfoRequest) => paymentApi.deleteWithdrawInfo(data),
  })
}

/**
 * Mutation hook để gọi API yêu cầu rút tiền
 */
export const useRequestWithdrawMutation = () => {
  return useMutation({
    mutationFn: (data: RequestWithdrawRequest) => paymentApi.requestWithdraw(data),
  })
}
