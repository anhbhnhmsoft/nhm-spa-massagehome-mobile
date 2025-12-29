import { client } from '@/lib/axios-client';
import {
  JoinRoomRequest,
  JoinRoomResponse, KTVConversationRequest, KTVConversationResponse,
  ListMessageRequest,
  ListMessageResponse,
  SendMessageRequest,
} from '@/features/chat/types';
import { ResponseSuccessType } from '@/lib/types';


const defaultUri = '/chat';

const chatApi = {
  // Tham gia phòng chat
  joinRoom: async (data: JoinRoomRequest): Promise<JoinRoomResponse> => {
    const response = await client.post(`${defaultUri}/room`, data);
    return response.data;
  },
  // Gửi tin nhắn
  sendMessage: async (data: SendMessageRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/message`, data);
    return response.data;
  },
  // Lấy danh sách tin nhắn trong phòng chat
  listMessages: async (
    roomId: string,
    params: ListMessageRequest
  ): Promise<ListMessageResponse> => {
    const response = await client.get(`${defaultUri}/messages/${roomId}`, { params });
    return response.data;
  },
  // Đánh dấu tin nhắn đọc trong phòng chat
  seenMessages: async (roomId: string): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/seen`, { room_id: roomId });
    return response.data;
  },

  // Lấy danh sách cuộc trò chuyện KTV
  listKTVConversations: async (
    params: KTVConversationRequest
  ): Promise<KTVConversationResponse> => {
    const response = await client.get(`${defaultUri}/ktv-conversations`, { params });
    return response.data;
  },

};

export default chatApi;