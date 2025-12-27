import { client } from '@/lib/axios-client';
import {
  BookingDetailsResponse,
  DashboardKtvResponse,
  StartBookingResponse,
} from '@/features/ktv/types';
import { ListBookingRequest, ListBookingResponse } from '../booking/types';

const defaultUri = '/ktv';

const ktvApi = {
  dashboard: async (): Promise<DashboardKtvResponse> => {
    const response = await client.get(`${defaultUri}/dashboard`);
    return response.data;
  },
  bookings: async (params: ListBookingRequest): Promise<ListBookingResponse> => {
    const response = await client.get(`${defaultUri}/list-booking`, { params });
    return response.data;
  },
  bookingDetails: async (id: string): Promise<BookingDetailsResponse> => {
    const response = await client.get<BookingDetailsResponse>(`/booking/detail/${id}`);
    return response.data;
  },
  startBooking: async (id: string): Promise<StartBookingResponse> => {
    const response = await client.post(`${defaultUri}/start-booking`, {
      booking_id: id,
    });
    return response.data;
  },
};

export default ktvApi;
