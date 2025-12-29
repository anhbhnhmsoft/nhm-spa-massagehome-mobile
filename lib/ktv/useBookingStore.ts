import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { Storage } from '../storages';
import { _StorageKey } from '../storages/key';
import { BookingItem } from '@/features/booking/types';
import ktvApi from '@/features/ktv/api';

interface BookingPersisted {
  bookingId: string;
  endTime: number;
  notificationId: string | null;
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
}

/**
 * Backend trả duration = PHÚT
 */
const calcEndTime = (booking: BookingItem) => {
  if (!booking.start_time) {
    throw new Error('booking.start_time is null');
  }

  const start = new Date(booking.start_time).getTime();
  return start + booking.duration * 60 * 1000;
};

interface BookingPersisted {
  bookingId: string;
  endTime: number;
  notificationId: string | null;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  refreshed: false,
  bookingId: null,
  endTime: null,
  notificationId: null,
  setRefreshed: (refreshed) => {
    set({
      refreshed,
    });
  },
  startBooking: async (booking) => {
    const endTime = calcEndTime(booking);
    let notificationId: string | null = null;
    console.log('end time', endTime);
    // huỷ notification cũ
    const prevNotif = get().notificationId;
    if (prevNotif) {
      try {
        await Notifications.cancelScheduledNotificationAsync(prevNotif);
      } catch {}
    }

    // xin quyền notification
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) {
      await Notifications.requestPermissionsAsync();
    }

    // schedule notification
    try {
      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Hết giờ',
          body: 'Thời gian booking đã kết thúc',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(endTime),
          channelId: 'booking', // Android bắt buộc
        },
      });
    } catch (e) {}

    const persisted = {
      bookingId: booking.id,
      endTime,
      notificationId,
    };

    // persist toàn bộ
    await Storage.setItem(_StorageKey.BOOKING_TIME_KEY, persisted);

    set((state) => ({
      bookingId: booking.id,
      endTime,
      notificationId,
    }));
  },

  clearBooking: async () => {
    const notifId = get().notificationId;
    if (notifId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      } catch {}
    }

    await Storage.removeItem(_StorageKey.BOOKING_TIME_KEY);

    set({
      bookingId: null,
      endTime: null,
      notificationId: null,
    });
  },

  hydrate: async () => {
    const data = await Storage.getItem<BookingPersisted>(_StorageKey.BOOKING_TIME_KEY);

    if (!data) return;
    if (data.endTime <= Date.now()) {
      ktvApi
        .finishBooking(data.bookingId)
        .then(() => {
          set({ refreshed: true });
        })
        .catch((err) => {
          console.log('finish booking failed', err);
        })
        .finally(async () => {
          if (data.notificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(data.notificationId);
            } catch {}
          }

          await Storage.removeItem(_StorageKey.BOOKING_TIME_KEY);
        });

      return;
    }

    // booking còn hiệu lực
    set({
      bookingId: data.bookingId,
      endTime: data.endTime,
      notificationId: data.notificationId,
    });
  },
}));
