import { client } from '@/lib/axios-client';
import { ResponseDataSuccessType } from '@/lib/types';
import { KtvProactiveInviteType, NearbyDemandItemType } from './types';

export const proactiveMatchingApi = {
  // KTV quét danh sách khách gần đây
  getNearbyDemands: async (params?: { lat?: number; lng?: number; radius?: number }) => {
    const response = await client.get<ResponseDataSuccessType<NearbyDemandItemType[]>>(
      '/service-requests/proactive/nearby-demands',
      { params }
    );
    return response.data;
  },

  // KTV gửi lời mời trực tiếp
  sendInvite: async (payload: { customer_id: string; request_id?: number | string; note?: string }) => {
    const response = await client.post<ResponseDataSuccessType<KtvProactiveInviteType>>(
      '/service-requests/proactive/send-invite',
      payload
    );
    return response.data;
  },

  // Khách hàng lấy danh sách lời mời nhận được
  getCustomerInvites: async () => {
    const response = await client.get<ResponseDataSuccessType<KtvProactiveInviteType[]>>(
      '/service-requests/proactive/customer-invites'
    );
    return response.data;
  },

  // Khách hàng phản hồi (Đồng ý / Từ chối)
  respondInvite: async (inviteId: number | string, accept: boolean) => {
    const response = await client.post<ResponseDataSuccessType<{ invite: KtvProactiveInviteType; booking?: any }>>(
      `/service-requests/proactive/invites/${inviteId}/respond`,
      { accept }
    );
    return response.data;
  },

  // Khách hàng bật/tắt nhận đề xuất
  toggleStatus: async (enabled: boolean) => {
    const response = await client.post<ResponseDataSuccessType<{ is_proactive_matching_enabled: boolean }>>(
      '/service-requests/proactive/toggle-status',
      { enabled }
    );
    return response.data;
  },
};
