import { SupportChanel } from '@/features/config/types';
import { create } from 'zustand';


interface IConfigStore {
  support_chanel: SupportChanel | null;

  setSupportChanel: (support_chanel: SupportChanel) => void;
}


const useConfigStore = create<IConfigStore>((set) => ({
  support_chanel: null,

  setSupportChanel: (support_chanel) => set({ support_chanel }),
}));


export default useConfigStore;