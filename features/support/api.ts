import { client } from '@/lib/axios-client';
import {
  CreateSupportTicketRequest,
  SendSupportMessageRequest,
  SupportCategoryResponse,
  SupportMessageListResponse,
  SupportSeenRequest,
  SupportTicketListResponse,
  SupportTicketResponse,
} from '@/features/support/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/support';

const supportApi = {
  listCategories: async (): Promise<SupportCategoryResponse> => {
    const response = await client.get(`${defaultUri}/categories`);
    return response.data;
  },
  createTicket: async (data: CreateSupportTicketRequest): Promise<SupportTicketResponse> => {
    const response = await client.post(`${defaultUri}/tickets`, data);
    return response.data;
  },
  listTickets: async (params?: Record<string, any>): Promise<SupportTicketListResponse> => {
    const response = await client.get(`${defaultUri}/tickets`, { params });
    return response.data;
  },
  detailTicket: async (ticketId: string | number): Promise<SupportTicketResponse> => {
    const response = await client.get(`${defaultUri}/tickets/${ticketId}`);
    return response.data;
  },
  listMessages: async (
    ticketId: string | number,
    params?: Record<string, any>
  ): Promise<SupportMessageListResponse> => {
    const response = await client.get(`${defaultUri}/messages/${ticketId}`, { params });
    return response.data;
  },
  sendMessage: async (data: SendSupportMessageRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/messages`, data);
    return response.data;
  },
  seenMessages: async (data: SupportSeenRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/seen`, data);
    return response.data;
  },
};

export default supportApi;

