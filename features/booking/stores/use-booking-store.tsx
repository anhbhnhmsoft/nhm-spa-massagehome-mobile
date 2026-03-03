import { create } from 'zustand';


interface IBookingStore {
  booking_id: string | null;
  setBookingId: (bookingId: string | null) => void;
}

export const useBookingStore = create<IBookingStore>((set) => ({
  booking_id: null,

  setBookingId: (bookingId) => set({ booking_id: bookingId }),
}));