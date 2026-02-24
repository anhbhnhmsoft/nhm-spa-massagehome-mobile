import { client } from '@/lib/axios-client';
import { AuthenticateRequest, AuthenticateResponse, MeResponse } from '@/features/auth/utils';


const defaultUri = "/auth"

/**
 * Hàm để xác thực user xem đã có tài khoản hay chưa
 * @param data
 */
export const authenticateApi = {
  key: `${defaultUri}/authenticate`,
  call: async (data: AuthenticateRequest): Promise<AuthenticateResponse> => {
    const response = await client.post(`${defaultUri}/authenticate`, data);
    return response.data;
  }
}


export const meApi = {
  key: `${defaultUri}/me`,
  call: async (): Promise<MeResponse> => {
    const response = await client.get(`${defaultUri}/me`);
    return response.data;
  }
}