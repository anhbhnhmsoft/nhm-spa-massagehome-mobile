import { client } from '@/lib/axios-client';
import {
  DashboardKtvResponse,
  AllCategoriesResponse,
  ListServiceRequest,
  ListServiceResponse,
  DetailServiceRequest,
  ServiceDetailResponse,
} from '@/features/ktv/types';
import { ListBookingRequest, ListBookingResponse } from '../booking/types';
import { ResponseSuccessType } from '@/lib/types';

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
  updateService: async (data: FormData, id: string): Promise<ResponseSuccessType> => {
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
};

export default ktvApi;
