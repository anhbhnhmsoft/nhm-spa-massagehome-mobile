import { client } from '@/lib/axios-client';
import { DashboardProfileResponse, DetailKTVResponse, ListKTVRequest, ListKTVResponse } from '@/features/user/types';

const defaultUri = '/user';

const userApi = {
  // Lấy danh sách KTV
  listKTV: async (params: ListKTVRequest): Promise<ListKTVResponse> => {
    const response = await client.get(`${defaultUri}/list-ktv`, { params });
    return response.data;
  },
  // Lấy thông tin chi tiết của KTV
  detailKTV: async (id: string): Promise<DetailKTVResponse> => {
    const response = await client.get(`${defaultUri}/ktv/${id}`);
    return response.data;
  },
  // Lấy thông tin dashboard profile
  dashboardProfile: async (): Promise<DashboardProfileResponse> => {
    const response = await client.get(`${defaultUri}/dashboard-profile`);
    return response.data;
  },
};

export default userApi;
