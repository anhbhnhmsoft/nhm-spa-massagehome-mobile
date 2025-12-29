import { useMutation } from '@tanstack/react-query';
import { JoinRoomRequest, SendMessageRequest } from '@/features/chat/types';
import chatApi from '@/features/chat/api';

// Mutation để gửi tin nhắn
export const useMutationSendMessage = () => {
  return useMutation({
    mutationFn: (data: SendMessageRequest) => chatApi.sendMessage(data),
  });
}

// Mutation để lấy ID phòng chat
export const useMutationGetRoomId = () => {
  return useMutation({
    mutationFn: (data: JoinRoomRequest) => chatApi.joinRoom(data),
  });
}

// Mutation để đánh dấu tin nhắn đọc trong phòng chat
export const useMutationSeenMessages = () => {
  return useMutation({
    mutationFn: (roomId: string) => chatApi.seenMessages(roomId),
  });
}


