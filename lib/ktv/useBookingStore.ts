import { create } from 'zustand';
import { Storage } from '../storages';
import { _StorageKey } from '../storages/key';
import { BookingItem } from '@/features/booking/types';
import ktvApi from '@/features/ktv/api';

interface BookingPersisted {
  bookingId: string;
  endTime: number;
  notificationId?: string | null;
  _hydrated: boolean;
}

interface BookingState {
  refreshed: boolean;
  bookingId: string | null;
  endTime: number | null;
  notificationId: string | null;
  startBooking: (booking: BookingItem) => Promise<void>;
  clearBooking: () => Promise<void>;
  hydrate: () => Promise<void>;
  setRefreshed: (refreshed: boolean) => void;
  setNotificationId: (id: string | null) => Promise<void>;
  _hydrated: boolean;
}

export const calcEndTime = (booking: BookingItem) => {
  if (!booking.start_time) {
    throw new Error('booking.start_time is null');
  }

  const start = new Date(booking.start_time).getTime();
  return start + booking.duration * 60 * 1000;
};

// (removed duplicate BookingPersisted)

export const useBookingStore = create<BookingState>((set, get) => ({
  refreshed: false,
  bookingId: null,
  endTime: null,
  _hydrated: false,
  notificationId: null,
  setRefreshed: (refreshed) => {
    set({
      refreshed,
    });
  },
  startBooking: async (booking) => {
    const endTime = calcEndTime(booking);
    // Persist bookingId + endTime. Notification scheduling is handled externally.
    const persisted: BookingPersisted = {
      bookingId: booking.id,
      endTime,
      _hydrated: true,
    };
    await Storage.setItem(_StorageKey.BOOKING_TIME_KEY, persisted);

    set(() => ({
      bookingId: booking.id,
      endTime,
    }));
  },

  clearBooking: async () => {
    // Notification cancellation is handled by the caller. Clear persisted booking state.
    await Storage.removeItem(_StorageKey.BOOKING_TIME_KEY);

    set({
      bookingId: null,
      endTime: null,
      notificationId: null,
    });
  },

  hydrate: async () => {
    const data = await Storage.getItem<BookingPersisted>(_StorageKey.BOOKING_TIME_KEY);
    if (data) {
      set({
        bookingId: data.bookingId,
        endTime: data.endTime,
        notificationId: data.notificationId ?? null,
      });
    } else {
      set({
        bookingId: null,
        endTime: null,
        notificationId: null,
      });
    }
    set({ _hydrated: true });
  },
  setNotificationId: async (id) => {
    try {
      const cur = await Storage.getItem<BookingPersisted>(_StorageKey.BOOKING_TIME_KEY);
      const persisted: BookingPersisted = {
        bookingId: cur?.bookingId || get().bookingId || '',
        endTime: cur?.endTime ?? get().endTime ?? 0,
        notificationId: id,
        _hydrated: true,
      };
      await Storage.setItem(_StorageKey.BOOKING_TIME_KEY, persisted);
    } catch (e) {}
    set({ notificationId: id });
  },
}));
