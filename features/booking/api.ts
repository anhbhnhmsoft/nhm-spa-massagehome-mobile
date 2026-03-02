import { client } from '@/lib/axios-client';
import {
  BookingCheckResponse,
  BookingServiceRequest,
  BookingServiceResponse,
  ListBookingRequest,
  ListBookingResponse,
  PrepareBookingRequest,
  PrepareBookingResponse,
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
   * Lấy thông tin trước khi đặt lịch dịch vụ
   */
  prepareBooking: async (data: PrepareBookingRequest): Promise<PrepareBookingResponse> => {
    const response = await client.post(`${defaultUri}/prepare-booking`, data);
    return response.data;
  },
  /**
   * Đặt lịch dịch vụ
   */
  booking: async (data: BookingServiceRequest): Promise<BookingServiceResponse> => {
    const response = await client.post(`${defaultUri}/booking-service`, data);
    return response.data;
  },
  /**
   * Kiểm tra trạng thái đặt lịch
   */
  checkBooking: async (id: string): Promise<BookingCheckResponse> => {
    const response = await client.get(`${defaultUri}/${id}`);
    return response.data;
  },
  /**
   *
   * @param data
   */
  cancelBooking: async (data: CancelBookingRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/cancel`, data); // Sửa lại
    return response.data;
  },
};

export default bookingApi;
