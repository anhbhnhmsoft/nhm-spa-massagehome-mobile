import { client } from '@/lib/axios-client';
import {
  JoinRoomRequest,
  JoinRoomResponse,
  ListMessageRequest,
  ListMessageResponse,
  SendMessageRequest,
} from '@/features/chat/types';
import { ResponseSuccessType } from '@/lib/types';


const defaultUri = '/chat';

const chatApi = {
  joinRoom: async (data: JoinRoomRequest): Promise<JoinRoomResponse> => {
    const response = await client.post(`${defaultUri}/room`, data);
    return response.data;
  },
  sendMessage: async (data: SendMessageRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/message`, data);
    return response.data;
  },
  listMessages: async (roomId: string, params: ListMessageRequest): Promise<ListMessageResponse> => {
    const response = await client.get(`${defaultUri}/messages/${roomId}`, { params });
    return response.data;
  },
}

export default chatApi;