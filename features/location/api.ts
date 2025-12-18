import { client } from '@/lib/axios-client';
import {
  SearchLocationRequest,
  SearchLocationResponse,
  DetailLocationRequest,
  DetailLocationResponse,
  ListAddressRequest,
  ListAddressResponse,
  SaveAddressRequest, EditAddressRequest, DeleteAddressRequest,
  ListProvincesRequest,
  ListProvincesResponse,
} from '@/features/location/types';
import { ResponseSuccessType } from '@/lib/types';

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
  // Lấy danh sách địa chỉ
  listAddress: async (params: ListAddressRequest): Promise<ListAddressResponse> => {
    const response = await client.get(`${defaultUri}/address`, { params });
    return response.data;
  },
  // Lưu địa chỉ
  saveAddress: async (params: SaveAddressRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/save`, params);
    return response.data;
  },
  // Cập nhật địa chỉ
  editAddress: async (params: EditAddressRequest): Promise<ResponseSuccessType> => {
    const response = await client.put(`${defaultUri}/edit/${params.id}`, params);
    return response.data;
  },
  // Xóa địa chỉ
  deleteAddress: async (params: DeleteAddressRequest): Promise<ResponseSuccessType> => {
    const response = await client.delete(`${defaultUri}/delete/${params.id}`);
    return response.data;
  },
  // Lấy danh sách tỉnh/thành
  listProvinces: async (params?: ListProvincesRequest): Promise<ListProvincesResponse> => {
    const response = await client.get(`${defaultUri}/provinces`, { params });
    return response.data;
  },
};

export default locationApi;
