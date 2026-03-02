import { client } from '@/lib/axios-client';
import {
  DetailKTVResponse,
  ListKTVRequest,
  ListKTVResponse,
  ApplyPartnerResponse, CheckApplyPartnerResponse,
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
