import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import {
  _PaymentType,
  _TransactionStatus,
  _TransactionType,
  _UserWithdrawInfoType,
} from '@/features/payment/consts';

export type WalletItem = {
  id: string;
  user_id: string;
  balance: string; // Số dư hiện tại dạng string để tránh lỗi tràn số khi tính toán
  is_active: boolean;
  total_deposit: string; // Tổng số tiền nạp vào ví dạng string để tránh lỗi tràn số khi tính toán
  total_withdrawal: string; // Tổng số tiền rút ra khỏi ví dạng string để tránh lỗi tràn số khi tính toán
};

export type WalletResponse = ResponseDataSuccessType<WalletItem>;

export type ListTransactionRequest = BaseSearchRequest<object>;

export type ListTransactionItem = {
  id: string;
  type: _TransactionType;
  money_amount: string; // Số tiền giao dịch dạng string để tránh lỗi tràn số khi tính toán
  point_amount: string; // Số điểm giao dịch dạng string để tránh lỗi tràn số khi tính toán
  balance_after: string; // Số dư sau giao dịch dạng string để tránh lỗi tràn số khi tính toán
  status: _TransactionStatus;
  created_at: string; // Dạng string vì có thể cần format lại sau khi lấy dữ liệu
};

export type ListTransactionResponse = ResponseDataSuccessType<Paginator<ListTransactionItem>>;

export type ConfigPaymentItem = {
  currency_exchange_rate: string; // Tỷ giá đổi tiền giữa VND và point
  allow_payment: {
    qrcode: boolean; // Cho phép nạp qua QRCode
    zalopay: boolean; // Cho phép nạp qua ZaloPay
    momo: boolean; // Cho phép nạp qua Momo
    wechatpay: boolean; // Cho phép nạp qua WechatPay
  };
};

export type ConfigPaymentResponse = ResponseDataSuccessType<ConfigPaymentItem>;

export type DepositRequest = {
  amount: string;
  payment_type: _PaymentType;
};

export type DepositItem = {
  transaction_id: string;
  payment_type: _PaymentType;
  data_payment: QRBankData | QRWechatData; // Tùy vào payment_type, có thể là QRBankData hoặc ZaloPayData hoặc MomoPayData
};

export type QRBankData = {
  bin: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: number;
  description: string;
  qr_code: string;
};

export interface QRWechatData {
  qr_image: string;
  amount: string;
  description: string;
}

export type DepositResponse = ResponseDataSuccessType<DepositItem>;

export type CheckTransactionRequest = {
  transaction_id: string;
};

export type CheckTransactionResponse = ResponseDataSuccessType<{
  is_completed: boolean;
}>;

type InfoWithdrawConfigBank = {
  bank_bin: string;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
};

export type InfoWithdrawItem = {
  id: string;
  user_id: string;
  type: _UserWithdrawInfoType;
  config: InfoWithdrawConfigBank;
};

export type InfoWithdrawResponse = ResponseDataSuccessType<InfoWithdrawItem[]>;

export type CreateWithdrawInfoRequest = {
  type: _UserWithdrawInfoType.BANK;
  config: {
    bank_bin: string;
    bank_name: string;
    bank_account: string;
    bank_holder: string;
  };
};

export type DeleteWithdrawInfoRequest = {
  id: string;
};

export type BankInfo = {
  id: number;
  name: string;
  code: string;
  bin: string;
  short_name: string;
  logo: string | null;
};

export type ListBankInfoResponse = ResponseDataSuccessType<BankInfo[]>;

export type RequestWithdrawRequest = {
  user_withdraw_info_id: string;
  amount: string;
  note?: string;
};
