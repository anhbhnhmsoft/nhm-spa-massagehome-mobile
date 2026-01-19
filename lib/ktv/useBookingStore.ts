import { create } from 'zustand';
import { Storage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import { BookingItem } from '@/features/booking/types';
import { StartBookingResponse } from '@/features/ktv/types';

interface BookingState {
  _hydrated: boolean;
  booking_start: null | StartBookingResponse['data'];
  notification_booking_start_id: string | null;

  setBookingStart: (data: StartBookingResponse['data'] | null) => Promise<void>;

  setNotificationBookingStartId: (id: string | null) => Promise<void>;

  hydrate: () => Promise<void>,
}

export const useBookingStore = create<BookingState>((set, get) => ({
  _hydrated: false,
  booking_start: null,
  notification_booking_start_id: null,

  setBookingStart: async (data) => {
    await Storage.setItem(_StorageKey.BOOKING_TIME_KEY, data);
    set({
      booking_start: data,
    });
  },

  setNotificationBookingStartId: async (id) => {
    await Storage.setItem(_StorageKey.NOTIFICATION_BOOKING, id);
    set({ notification_booking_start_id: id });
  },
  hydrate: async () => {
    const booking_start = await Storage.getItem<StartBookingResponse['data']>(
      _StorageKey.BOOKING_TIME_KEY
    );
    const notification_booking_start_id = await Storage.getItem<string>(
      _StorageKey.NOTIFICATION_BOOKING
    );
    set({ booking_start });
    set({ notification_booking_start_id });
    set({ _hydrated: true });
  },
}));
