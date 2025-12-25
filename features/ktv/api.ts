import { client } from '@/lib/axios-client';
import { DashboardKtvResponse } from '@/features/ktv/types';

const defaultUri = '/ktv';


const ktvApi = {
  dashboard: async (): Promise<DashboardKtvResponse> => {
    const response = await client.get(`${defaultUri}/dashboard`);
    return response.data;
  }
}

export default ktvApi;