import DefaultColor from '@/components/styles/color';

export const _QUICK_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export const _QUICK_WITHDRAW_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export enum _PaymentType {
  QR_BANKING = 1,
  ZALO_PAY = 2,
  MOMO_PAY = 3,
  WECHAT_PAY = 7,
}

export const _PAYMENT_METHODS = [
  {
    id: _PaymentType.QR_BANKING,
    name: 'enum.payment_type.QR_BANKING',
    desc: 'common.auto_pay',
  },
  {
    id: _PaymentType.ZALO_PAY,
    name: 'enum.payment_type.ZALO_PAY',
    desc: 'common.auto_pay',
  },
  {
    id: _PaymentType.WECHAT_PAY,
    name: 'enum.payment_type.WECHAT_PAY',
    desc: 'common.hold_payment',
  },
] as const;

export enum _TransactionType {
  DEPOSIT_QR_CODE = 1, // Nạp tiền qua mã QR
  DEPOSIT_ZALO_PAY = 2, // Nạp tiền qua Zalo Pay
  DEPOSIT_MOMO_PAY = 3, // Nạp tiền qua Momo Pay
  WITHDRAWAL = 4, // Rút tiền (Yêu cầu)
  PAYMENT = 5, // Thanh toán (Booking)
  AFFILIATE = 6, // Nhận hoa hồng
  PAYMENT_FOR_KTV = 7, // Thanh toán cho KTV
  REFUND = 8, // Hoàn tiền cho customer
  RETRIEVE_PAYMENT_REFUND_KTV = 9, // thu hồi tiền thanh toán cho KTV khi hủy booking
  REFERRAL_KTV = 10, // Nhận hoa hồng từ người giới thiệu KTV
  REFERRAL_INVITE_KTV_REWARD = 11, // Nhận hoa hồng từ người giới thiệu KTV khi đăng ký KTV
  DEPOSIT_WECHAT_PAY = 12, // Nạp tiền qua Wechat Pay
}

export const _TransactionTypeMap = {
  [_TransactionType.DEPOSIT_QR_CODE]: 'enum.transaction_type.DEPOSIT_QR_CODE',
  [_TransactionType.DEPOSIT_ZALO_PAY]: 'enum.transaction_type.DEPOSIT_ZALO_PAY',
  [_TransactionType.DEPOSIT_MOMO_PAY]: 'enum.transaction_type.DEPOSIT_MOMO_PAY',
  [_TransactionType.WITHDRAWAL]: 'enum.transaction_type.WITHDRAWAL',
  [_TransactionType.PAYMENT]: 'enum.transaction_type.PAYMENT',
  [_TransactionType.AFFILIATE]: 'enum.transaction_type.AFFILIATE',
  [_TransactionType.PAYMENT_FOR_KTV]: 'enum.transaction_type.PAYMENT_FOR_KTV',
  [_TransactionType.REFUND]: 'enum.transaction_type.REFUND',
  [_TransactionType.RETRIEVE_PAYMENT_REFUND_KTV]:
    'enum.transaction_type.RETRIEVE_PAYMENT_REFUND_KTV',
  [_TransactionType.REFERRAL_KTV]: 'enum.transaction_type.REFERRAL_KTV',
  [_TransactionType.REFERRAL_INVITE_KTV_REWARD]: 'enum.transaction_type.REFERRAL_INVITE_KTV_REWARD',
  [_TransactionType.DEPOSIT_WECHAT_PAY]: 'enum.transaction_type.DEPOSIT_WECHAT_PAY',
};

export enum _TransactionStatus {
  PENDING = 1,
  COMPLETED = 2,
  FAILED = 3,
}

export const _TransactionStatusColor = {
  [_TransactionStatus.PENDING]: DefaultColor.yellow[500],
  [_TransactionStatus.COMPLETED]: DefaultColor.green[500],
  [_TransactionStatus.FAILED]: DefaultColor.red[500],
} as Record<_TransactionStatus, string>;

export const _TransactionStatusMap = {
  [_TransactionStatus.PENDING]: 'enum.transaction_status.PENDING',
  [_TransactionStatus.COMPLETED]: 'enum.transaction_status.COMPLETED',
  [_TransactionStatus.FAILED]: 'enum.transaction_status.FAILED',
};

// Các loại giao dịch vào wallet
export const _TransactionInType = [
  _TransactionType.DEPOSIT_QR_CODE,
  _TransactionType.DEPOSIT_ZALO_PAY,
  _TransactionType.DEPOSIT_MOMO_PAY,
  _TransactionType.AFFILIATE,
  _TransactionType.PAYMENT_FOR_KTV,
  _TransactionType.DEPOSIT_WECHAT_PAY,
  _TransactionType.REFUND,
  _TransactionType.REFERRAL_INVITE_KTV_REWARD,
  _TransactionType.REFERRAL_KTV,
] as readonly _TransactionType[];

export const _TransactionOutType = [
  _TransactionType.WITHDRAWAL,
  _TransactionType.PAYMENT,
  _TransactionType.RETRIEVE_PAYMENT_REFUND_KTV,
] as readonly _TransactionType[];

// Các loại thông tin rút tiền
export enum _UserWithdrawInfoType {
  BANK = 1, // Thông tin tài khoản ngân hàng
}
