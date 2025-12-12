import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _PaymentType, _TransactionStatus, _TransactionType } from '@/features/payment/consts';

export type WalletItem = {
  id: string;
  user_id: string;
  balance: string; // Số dư hiện tại dạng string để tránh lỗi tràn số khi tính toán
  is_active: boolean;
}

export type WalletResponse = ResponseDataSuccessType<WalletItem>

export type ListTransactionRequest = BaseSearchRequest<object>

export type ListTransactionItem = {
  id: string;
  type: _TransactionType;
  money_amount: string; // Số tiền giao dịch dạng string để tránh lỗi tràn số khi tính toán
  point_amount: string; // Số điểm giao dịch dạng string để tránh lỗi tràn số khi tính toán
  balance_after: string; // Số dư sau giao dịch dạng string để tránh lỗi tràn số khi tính toán
  status: _TransactionStatus;
  created_at: string; // Dạng string vì có thể cần format lại sau khi lấy dữ liệu
}

export type ListTransactionResponse = ResponseDataSuccessType<Paginator<ListTransactionItem>>


export type ConfigPaymentItem = {
  currency_exchange_rate: string; // Tỷ giá đổi tiền giữa VND và point
}

export type ConfigPaymentResponse = ResponseDataSuccessType<ConfigPaymentItem>

export type DepositRequest = {
  amount: string;
  payment_type: _PaymentType;
}

export type DepositItem = {
  transaction_id: string;
  payment_type: _PaymentType;
  data_payment: QRBankData; // Tùy vào payment_type, có thể là QRBankData hoặc ZaloPayData hoặc MomoPayData
}

export type QRBankData = {
  bin: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: number;
  description: string;
  qr_code: string;
}

export type DepositResponse = ResponseDataSuccessType<DepositItem>


export type CheckTransactionRequest = {
  transaction_id: string;
}

export type CheckTransactionResponse = ResponseDataSuccessType<{
  is_completed: boolean;
}>
