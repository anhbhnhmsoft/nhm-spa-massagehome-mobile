import { client } from '@/lib/axios-client';
import { ConfigApplicationResponse, SupportChanelResponse } from '@/features/config/types';

const defaultUri = '/config';

const configApi = {
  listSupportChanel: async (): Promise<SupportChanelResponse> => {
    const response = await client.get(`${defaultUri}/support-channels`);
    return response.data;
  },
  /**
   * Hàm để check các thông số mà server gửi về client
   */
  configApplication: async (): Promise<ConfigApplicationResponse> => {
    const response = await client.get(`${defaultUri}/config-application`);
    return response.data;
  },

}

export default configApi;