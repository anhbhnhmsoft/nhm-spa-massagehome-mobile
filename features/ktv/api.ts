import { client } from '@/lib/axios-client';
import { DashboardKtvResponse } from '@/features/ktv/types';
import { ListBookingRequest, ListBookingResponse } from '../booking/types';

const defaultUri = '/ktv';

const ktvApi = {
  dashboard: async (): Promise<DashboardKtvResponse> => {
    const response = await client.get(`${defaultUri}/dashboard`);
    return response.data;
  },
  bookings: async (params: ListBookingRequest): Promise<ListBookingResponse> => {
    console.log('params', params);
    const response = await client.get(`${defaultUri}/list-booking`, { params });
    console.log('res');
    return response.data;
  },
};

export default ktvApi;
