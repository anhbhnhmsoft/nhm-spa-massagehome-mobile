import { RoomItem } from '@/features/chat/types';
import { create } from 'zustand';


interface IChatStore {
  room?: RoomItem | null;

  setRoom: (room: RoomItem | null) => void;
}


const useChatStore = create<IChatStore>((set) => ({
  room: null,

  setRoom: (room) => set({ room }),
}));


export default useChatStore;