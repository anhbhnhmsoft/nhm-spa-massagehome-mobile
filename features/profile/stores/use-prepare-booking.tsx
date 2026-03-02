import { create } from 'zustand';


export type PrepareBookingItem = {
  service: {
    category_id: string;
    price_id: string;
    name: string;
    duration: number;
    image_url: string | null;
    temp_price: string;
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
