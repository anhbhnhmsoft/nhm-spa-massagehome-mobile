import { KTVDetail } from '@/features/user/types';
import { create } from 'zustand';


interface IUserServiceStore {
  ktv: KTVDetail | null;

  setKtv: (ktv: KTVDetail | null) => void;
}

export const useUserServiceStore = create<IUserServiceStore>((set) => ({
  ktv: null,
  setKtv: (ktv) => set({ ktv }),
}));



