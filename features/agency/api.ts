import { client } from '@/lib/axios-client';
import { _TimeFilter } from '@/features/agency/const';
import {
  AgencyResponse,
  DashboardAgencyResponse,
  ListKtvPerformanceResponse,
  UpdateAgencyRequest,
} from '@/features/agency/type';
import { ResponseDataSuccessType } from '@/lib/types';

const defaultUri = '/agency';

export const agencyApi = {
  /**
   * Lấy thông tin dashboard của đại lý
   * @param range Mốc thời gian
   * @returns Thông tin dashboard
   */
  dashboard: async (range: _TimeFilter): Promise<DashboardAgencyResponse> => {
    const response = await client.get(`${defaultUri}/dashboard?range=${range}`);
    return response.data;
  },
  /**
   * Lấy danh sách KTV có hiệu suất cao
   * @param range Mốc thời gian
   * @returns Danh sách KTV có hiệu suất cao
   */
  listKtvPerformance: async (
    range: _TimeFilter,
    page: number = 1
  ): Promise<ListKtvPerformanceResponse> => {
    const response = await client.get(`${defaultUri}/list-ktv-performance`, {
      params: {
        'filter[range]': range,
        page: page,
        per_page: 10,
      },
    });
    return response.data;
  },

  // Lấy  profile agency
  agencyProfile: async (): Promise<AgencyResponse> => {
    const response = await client.get(`${defaultUri}/profile`);
    return response.data;
  },

  // edit profile agency
  editProfile: async (data: UpdateAgencyRequest): Promise<ResponseDataSuccessType<[]>> => {
    const response = await client.post(`${defaultUri}/edit-profile`, data);
    return response.data;
  },
};
