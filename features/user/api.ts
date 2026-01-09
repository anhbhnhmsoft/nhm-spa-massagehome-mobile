import { client } from '@/lib/axios-client';
import {
  DashboardProfileResponse,
  DetailKTVResponse,
  ListKTVRequest,
  ListKTVResponse,
  ApplyPartnerRequest,
  ApplyPartnerResponse,
} from '@/features/user/types';

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

  // User hiện tại đăng ký làm đối tác
  applyPartner: async (payload: FormData): Promise<ApplyPartnerResponse> => {
    const response = await client.post(`${defaultUri}/apply-partner`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default userApi;
