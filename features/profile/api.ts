import { client } from '@/lib/axios-client';
import { CustomerCrmPreferences, CustomerCrmPreferencesResponse, DashboardProfileResponse } from '@/features/profile/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/profile';
const authUri = '/auth';

const profileApi = {
  // Lấy thông tin dashboard profile
  dashboardProfile: async (): Promise<DashboardProfileResponse> => {
    const response = await client.get(`${defaultUri}/dashboard-profile`);
    return response.data;
  },

  // Lấy cài đặt nhu cầu CRM khách hàng
  getCrmPreferences: async (): Promise<CustomerCrmPreferencesResponse> => {
    const response = await client.get(`${authUri}/crm-preferences`);
    return response.data;
  },

  // Cập nhật cài đặt nhu cầu CRM khách hàng
  updateCrmPreferences: async (data: Partial<CustomerCrmPreferences>): Promise<ResponseSuccessType> => {
    const response = await client.put(`${authUri}/crm-preferences`, data);
    return response.data;
  },
};

export default profileApi;