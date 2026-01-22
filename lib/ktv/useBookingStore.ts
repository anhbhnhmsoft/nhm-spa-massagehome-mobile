import { create } from 'zustand';
import { Storage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import { StartBookingResponse } from '@/features/ktv/types';
import { getRemainingTime } from '@/lib/utils';

interface BookingState {
  _hydrated: boolean;
  booking_start: null | StartBookingResponse['data'];
  notification_booking_start_id: string | null;
  time_left: ReturnType<typeof getRemainingTime> | null;

  setBookingStart: (data: StartBookingResponse['data'] | null) => Promise<void>;
  setNotificationBookingStartId: (id: string | null) => Promise<void>;
  setTimeLeft: (data: ReturnType<typeof getRemainingTime> | null) => void;

  hydrate: () => Promise<void>;
  clearBookingStart: () => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  _hydrated: false,
  booking_start: null,
  notification_booking_start_id: null,
  time_left: null,

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

  setTimeLeft: (data) => {
    set({ time_left: data });
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

  clearBookingStart: async () => {
    await Storage.removeItem(_StorageKey.BOOKING_TIME_KEY);
    await Storage.removeItem(_StorageKey.NOTIFICATION_BOOKING);
    set({ time_left: null });
    set({ booking_start: null });
    set({ notification_booking_start_id: null });
  },
}));
