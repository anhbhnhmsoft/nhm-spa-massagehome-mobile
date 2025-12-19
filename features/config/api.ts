import { client } from '@/lib/axios-client';
import { SupportChanelResponse } from '@/features/config/types';

const defaultUri = '/config';

const configApi = {
  listSupportChanel: async (): Promise<SupportChanelResponse> => {
    const response = await client.get(`${defaultUri}/support-channels`);
    return response.data;
  },
}

export default configApi;