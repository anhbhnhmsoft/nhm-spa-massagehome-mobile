import { client } from '@/lib/axios-client';
import { _TimeFilter } from '@/features/agency/const';
import { DashboardAgencyResponse, ListKtvPerformanceResponse } from '@/features/agency/type';

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
};
