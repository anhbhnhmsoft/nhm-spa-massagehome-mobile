import { client } from '@/lib/axios-client';
import { TermOfUseResponse } from './type';

const defaultUri = '/file';

export const fileApi = {
  /**
   * Hàm để lấy điều khoản dịch vụ và chính sách bảo mật
   */
  getContractFile: async (type: number): Promise<TermOfUseResponse> => {
    const response = await client.get(`${defaultUri}/contract`, {
      params: { type },
    });
    return response.data;
  },
};
