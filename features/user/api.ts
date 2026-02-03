import { client } from '@/lib/axios-client';
import {
  DashboardProfileResponse,
  DetailKTVResponse,
  ListKTVRequest,
  ListKTVResponse,
  ApplyPartnerRequest,
  ApplyPartnerResponse, CheckApplyPartnerResponse,
} from '@/features/user/types';
import { ListKtvResponse } from '@/features/agency/type';

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
  // Kiểm tra thông tin đăng ký đối tác (KTV hoặc Agency)
  checkApplyPartner: async (): Promise<CheckApplyPartnerResponse> => {
    const response = await client.get(`${defaultUri}/check-apply-partner`);
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
  // Lấy danh sách KTV được quản lý bởi Agency hoặc KTV
  listManageKTV: async (params: ListKTVRequest): Promise<ListKTVResponse> => {
    const response = await client.get(`${defaultUri}/list-manage-ktv`, { params });
    return response.data;
  },
};

export default userApi;
