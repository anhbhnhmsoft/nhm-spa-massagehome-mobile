import { client } from '@/lib/axios-client';
import { DashboardProfileResponse } from '@/features/profile/types';


const defaultUri = '/profile';


const profileApi = {
  // Lấy thông tin dashboard profile
  dashboardProfile: async (): Promise<DashboardProfileResponse> => {
    const response = await client.get(`${defaultUri}/dashboard-profile`);
    return response.data;
  },
}

export default profileApi;