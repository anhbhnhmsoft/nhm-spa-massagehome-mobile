import { client } from '@/lib/axios-client';
import {
  AllCategoriesResponse,
  BookingDetailsResponse,
  CancelBookingRequest,
  ConfigSchedulesResponse,
  DashboardKtvResponse,
  DashboardQueryParams,
  DetailInfoKTVResponse,
  DetailServiceRequest,
  EditConfigScheduleRequest,
  EditProfileKtvRequest,
  ListOptionCategoriesResponse,
  ListServiceRequest,
  ListServiceResponse,
  ServiceDetailResponse,
  StartBookingResponse,
  TotalIncomeResponse,
} from '@/features/ktv/types';
import { ResponseSuccessType } from '@/lib/types';
import { UpdateServiceResponse } from '@/features/service/types';
import { ListBookingRequest, ListBookingResponse } from '@/features/booking/types';

const defaultUri = '/ktv';

const ktvApi = {
  // api cho màn hình dashboard
  dashboard: async (): Promise<DashboardKtvResponse> => {
    const response = await client.get(`${defaultUri}/dashboard`);
    return response.data;
  },
  // lấy tất cả các category
  allCategories: async (): Promise<AllCategoriesResponse> => {
    const response = await client.get(`${defaultUri}/all-categories`);
    return response.data;
  },
  // api cho màn hình list-service
  listServices: async (params: ListServiceRequest): Promise<ListServiceResponse> => {
    const response = await client.get(`${defaultUri}/list-service`, { params });
    return response.data;
  },
  // api cho màn hình detail-service
  detailService: async (params: DetailServiceRequest): Promise<ServiceDetailResponse> => {
    const response = await client.get(`${defaultUri}/detail-service/${params.id}`);
    return response.data;
  },
  // api cho màn hình add-booking
  addService: async (data: FormData): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/add-service`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // api cho màn hình update-service
  updateService: async (data: FormData, id: string): Promise<UpdateServiceResponse> => {
    const response = await client.post(`${defaultUri}/update-service/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  // api cho màn hình delete-service
  deleteService: async (id: string): Promise<ResponseSuccessType> => {
    const response = await client.delete(`${defaultUri}/delete-service/${id}`);
    return response.data;
  },
  // api cho màn hình list-booking
  bookings: async (params: ListBookingRequest): Promise<ListBookingResponse> => {
    const response = await client.get(`${defaultUri}/list-booking`, { params });
    return response.data;
  },
  // api cho màn hình booking-details
  bookingDetails: async (id: string): Promise<BookingDetailsResponse> => {
    const response = await client.get<BookingDetailsResponse>(`/booking/detail/${id}`);
    return response.data;
  },
  // api bắt đầu booking
  startBooking: async (id: string): Promise<StartBookingResponse> => {
    const response = await client.post(`${defaultUri}/start-booking`, {
      booking_id: id,
    });
    return response.data;
  },
  cancelBooking: async (data: CancelBookingRequest) => {
    const response = await client.post(`${defaultUri}/cancel-booking`, data); // Sửa lại
    return response.data;
  },
  finishBooking: async (id: string) => {
    const response = await client.post(`${defaultUri}/finish-booking`, {
      booking_id: id,
    });
    return response.data;
  },
  totalIncome: async (params: DashboardQueryParams): Promise<TotalIncomeResponse> => {
    const response = await client.get(`${defaultUri}/total-income`, { params });
    return response.data;
  },
  profileKtv: async (): Promise<DetailInfoKTVResponse> => {
    const response = await client.get(`${defaultUri}/profile`);
    return response.data;
  },

  uploadImage: async (data: FormData) => {
    const response = await client.post(`${defaultUri}/upload-ktv-images`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteImage: async (id: string) => {
    const response = await client.delete(`${defaultUri}/delete-ktv-image/${id}`);
    return response.data;
  },
  updateProfile: async (data: EditProfileKtvRequest) => {
    const response = await client.post(`${defaultUri}/edit-profile-ktv`, data);
    return response.data;
  },

  linkQrAgency: async (agency_id: string) => {
    const response = await client.post(`agency/link-qr`, { agency_id });
    return response.data;
  },
  // Lấy thông tin cấu hình thời gian làm việc của KTV
  configSchedule: async (): Promise<ConfigSchedulesResponse> => {
    const response = await client.get(`${defaultUri}/config-schedule`);
    return response.data;
  },
  // câp nhâp thông tin cấu hình thời gian làm việc của KTV
  updateConfigSchedule: async (
    data: EditConfigScheduleRequest
  ): Promise<ConfigSchedulesResponse> => {
    const response = await client.post(`${defaultUri}/config-schedule`, data);
    return response.data;
  },

  // get list danh sách gói dịch vụ của category
  optionByCategories: async (id: string): Promise<ListOptionCategoriesResponse> => {
    const response = await client.get(`${defaultUri}/category-price/${id}`);
    return response.data;
  },

  // quét qr của người giới thiệu
  linkReferrer: async (referrer_id: string) => {
    const response = await client.post(`${defaultUri}/link-referrer`, {
      referrer_id: referrer_id,
    });
    return response.data;
  },
};

export default ktvApi;
