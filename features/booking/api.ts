import { client } from '@/lib/axios-client';
import {
  BookingCheckResponse,
  ListBookingRequest,
  ListBookingResponse,
} from '@/features/booking/types';
import { CancelBookingRequest } from '@/features/ktv/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/booking';

const bookingApi = {
  /**
   * Lấy danh sách lịch hẹn
   */
  listBookings: async (params: ListBookingRequest): Promise<ListBookingResponse> => {
    const response = await client.get(`${defaultUri}/list`, { params });
    return response.data;
  },
  /**
   * Kiểm tra trạng thái đặt lịch
   * @param id
   */
  checkBooking: async (id: string): Promise<BookingCheckResponse> => {
    const response = await client.get(`${defaultUri}/${id}`);
    return response.data;
  },
  cancelBooking: async (data: CancelBookingRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/cancel`, data); // Sửa lại
    return response.data;
  },
};

export default bookingApi;
