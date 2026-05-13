import { useMutation } from '@tanstack/react-query';

import supportApi from '@/features/support/api';
import {
  CreateSupportTicketRequest,
  SendSupportMessageRequest,
  SupportSeenRequest,
  SupportTicketResponse,
} from '@/features/support/types';
import { ResponseSuccessType } from '@/lib/types';

export const useMutationCreateSupportTicket = () => {
  return useMutation<SupportTicketResponse, Error, CreateSupportTicketRequest>({
    mutationFn: (data) => supportApi.createTicket(data),
  });
};

export const useMutationSendSupportMessage = () => {
  return useMutation<ResponseSuccessType, Error, SendSupportMessageRequest>({
    mutationFn: (data) => supportApi.sendMessage(data),
  });
};

export const useMutationSeenSupportMessages = () => {
  return useMutation<ResponseSuccessType, Error, SupportSeenRequest>({
    mutationFn: (data) => supportApi.seenMessages(data),
  });
};

