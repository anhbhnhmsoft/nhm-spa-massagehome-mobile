import { client } from '@/lib/axios-client';
import { DetailKTVResponse, ListKTVRequest, ListKTVResponse } from '@/features/user/types';

const defaultUri = '/user';

const userApi = {
  listKTV: async (params: ListKTVRequest): Promise<ListKTVResponse> => {
    const response = await client.get(`${defaultUri}/list-ktv`, { params });
    return response.data;
  },

  detailKTV: async (id: string): Promise<DetailKTVResponse> => {
    const response = await client.get(`${defaultUri}/ktv/${id}`);
    return response.data;
  },
};

export default userApi;
