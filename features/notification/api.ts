import { client } from '@/lib/axios-client';
import { ListNotificationResponse } from './type';

const defaultUri = '/notification';

export const apiNotification = {
  listNotification: async ({ page }: { page: number }): Promise<ListNotificationResponse> => {
    const response = await client.get(`${defaultUri}/list`, { params: { page } });
    return response.data;
  },
  readNotification: async (id: string) => {
    const response = await client.put(`${defaultUri}/read/${id}`);
    return response.data;
  },
};
