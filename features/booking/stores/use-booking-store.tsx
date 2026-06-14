import { BookingApplicationItem, BookingApplicationPreviewResponse } from '@/features/booking/types';
import { create } from 'zustand';


interface IBookingStore {
  booking_id: string | null;
  setBookingId: (bookingId: string | null) => void;
  pending_topup_booking_payload: any | null;
  setPendingTopupBookingPayload: (payload: any | null) => void;
  selected_application: BookingApplicationItem | null;
  application_preview: BookingApplicationPreviewResponse['data'] | null;
  setApplicationSelection: (payload: {
    application: BookingApplicationItem | null;
    preview: BookingApplicationPreviewResponse['data'] | null;
  }) => void;
  clearApplicationSelection: () => void;
  application_selection_source: 'orders' | 'result' | null;
  setApplicationSelectionSource: (source: 'orders' | 'result' | null) => void;
}

export const useBookingStore = create<IBookingStore>((set) => ({
  booking_id: null,
  pending_topup_booking_payload: null,
  selected_application: null,
  application_preview: null,
  application_selection_source: null,

  setBookingId: (bookingId) => set({ booking_id: bookingId }),
  setPendingTopupBookingPayload: (pending_topup_booking_payload) => set({ pending_topup_booking_payload }),
  setApplicationSelection: ({ application, preview }) => set({
    selected_application: application,
    application_preview: preview,
  }),
  clearApplicationSelection: () => set({
    selected_application: null,
    application_preview: null,
    application_selection_source: null,
  }),
  setApplicationSelectionSource: (source) => set({ application_selection_source: source }),
}));
