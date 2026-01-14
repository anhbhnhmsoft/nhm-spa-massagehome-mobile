import { client } from '@/lib/axios-client';
import { ConfigAffiliateResponse, MatchAffiliateResponse } from '@/features/affiliate/types';

const defaultUri = '/affiliate';

const affiliateApi = {
  config: async (): Promise<ConfigAffiliateResponse> => {
    const response = await client.get(`${defaultUri}/config`);
    return response.data;
  },

  // check đối tác liên kết
  matchAffilate: async (): Promise<MatchAffiliateResponse> => {
    const response = await client.get(`${defaultUri}/match`);
    return response.data;
  },
};

export default affiliateApi;
