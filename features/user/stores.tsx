import { ListKTVItem } from '@/features/user/types';
import { create } from 'zustand';

interface IUserServiceStore {
  ktv: ListKTVItem | null;

  setKtv: (ktv: ListKTVItem | null) => void;
}

const useUserServiceStore = create<IUserServiceStore>((set) => ({
  ktv: null,

  setKtv: (ktv) => set({ ktv }),
}));

export default useUserServiceStore;
