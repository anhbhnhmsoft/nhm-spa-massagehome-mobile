import { ConfigPaymentItem, QRBankData, QRWechatData } from '@/features/payment/types';
import { create } from 'zustand';

interface IWalletStore {
  need_refresh: boolean;

  configPayment: ConfigPaymentItem | null;

  // Thông tin giao dịch hiện tại
  transactionId: string | null;
  qrBankData: QRBankData | null;
  qrWechatData: QRWechatData | null;

  setConfigPayment: (configPayment: ConfigPaymentItem | null) => void;
  // Cập nhật thông tin giao dịch hiện tại
  setTransactionId: (transactionId: string | null) => void;
  setQrBankData: (qrBankData: QRBankData | null) => void;
  setQrWechatData: (qrWechatData: QRWechatData | null) => void;
  refreshWallet: (need_refresh: boolean) => void;
}

export const useWalletStore = create<IWalletStore>((set) => ({
  configPayment: null,
  need_refresh: false,

  // Thông tin giao dịch hiện tại
  transactionId: null,
  qrBankData: null,
  qrWechatData: null,

  setConfigPayment: (configPayment) => set({ configPayment }),
  // Cập nhật thông tin giao dịch hiện tại
  setTransactionId: (transactionId) => set({ transactionId }),
  setQrBankData: (qrBankData) => set({ qrBankData }),
  refreshWallet: (need_refresh) => set({ need_refresh }),
  setQrWechatData: (qrWechatData) => set({ qrWechatData }),
}));
