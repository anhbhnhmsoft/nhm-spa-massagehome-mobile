import { client } from '@/lib/axios-client';
import { ConfigAffiliateResponse } from '@/features/affiliate/types';


const defaultUri = '/affiliate'


const affiliateApi = {
  config: async (): Promise<ConfigAffiliateResponse> => {
    const response = await client.get(`${defaultUri}/config`);
    return response.data;
  },
}

export default affiliateApi;