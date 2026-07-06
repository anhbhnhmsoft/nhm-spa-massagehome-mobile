import { ConfigPaymentItem, DepositContext } from '@/features/payment/types';
import { create } from 'zustand';

interface IWalletStore {
  need_refresh: boolean;

  configPayment: ConfigPaymentItem | null;
  depositContext: DepositContext | null;

  setConfigPayment: (configPayment: ConfigPaymentItem | null) => void;
  setDepositContext: (depositContext: DepositContext | null) => void;
  refreshWallet: (need_refresh: boolean) => void;
}

export const useWalletStore = create<IWalletStore>((set) => ({
  configPayment: null,
  need_refresh: false,
  depositContext: null,

  setConfigPayment: (configPayment) => set({ configPayment }),
  refreshWallet: (need_refresh) => set({ need_refresh }),
  setDepositContext: (depositContext) => set({ depositContext }),
}));
