import { client } from '@/lib/axios-client';
import { ListKtvResponse } from './type';

const defaultUri = '/agency';

export const agencyApi = {
  listKtv: async ({ page }: { page: number }): Promise<ListKtvResponse> => {
    const response = await client.get(`${defaultUri}/manage-ktv`, { params: { page } });
    return response.data;
  },
};
