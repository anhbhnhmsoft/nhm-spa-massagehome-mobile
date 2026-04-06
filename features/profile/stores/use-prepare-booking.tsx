import { create } from 'zustand';


export type PrepareBookingItem = {
  service: {
    category_id: string;
    name: string;
    image_url: string | null;
    options: { id: string, price: string, duration: number }[];
  },
  ktv: {
    id: string;
    name: string;
    image_url: string | null;
    rating: number;
  }
}

interface IPrepareBooking {
  item: PrepareBookingItem | null;
  setItem: (items: PrepareBookingItem | null) => void,
}

export const usePrepareBookingStore = create<IPrepareBooking>((set) => ({
  item: null,
  setItem: (item) => set({ item }),
}));
