import { SupportChanel } from '@/features/config/types';
import { create } from 'zustand';


interface IConfigStore {
  support_chanel: SupportChanel | null;
  support_unread_count: number;
  active_support_room_id: string | null;

  setSupportChanel: (support_chanel: SupportChanel) => void;
  setActiveSupportRoomId: (roomId: string | null) => void;
  incrementSupportUnreadCount: (amount?: number) => void;
  resetSupportUnreadCount: () => void;
}


const useConfigStore = create<IConfigStore>((set) => ({
  support_chanel: null,
  support_unread_count: 0,
  active_support_room_id: null,

  setSupportChanel: (support_chanel) => set({ support_chanel }),
  setActiveSupportRoomId: (roomId) => set({ active_support_room_id: roomId }),
  incrementSupportUnreadCount: (amount = 1) =>
    set((state) => ({ support_unread_count: state.support_unread_count + amount })),
  resetSupportUnreadCount: () => set({ support_unread_count: 0 }),
}));


export default useConfigStore;
