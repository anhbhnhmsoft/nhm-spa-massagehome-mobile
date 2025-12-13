import { client } from '@/lib/axios-client';
import {
  SearchLocationRequest,
  SearchLocationResponse,
  DetailLocationRequest,
  DetailLocationResponse,
} from '@/features/location/types';

const defaultUri = '/location';

const locationApi = {
  // Tìm kiếm địa điểm
  search: async (params: SearchLocationRequest): Promise<SearchLocationResponse> => {
    const response = await client.get(`${defaultUri}/search`, { params });
    return response.data;
  },
  // Lấy chi tiết địa điểm
  detail: async (params: DetailLocationRequest): Promise<DetailLocationResponse> => {
    const response = await client.get(`${defaultUri}/detail`, { params });
    return response.data;
  },
};

export default locationApi;
