import { useMutationGetRoomId, useMutationSendMessage } from '@/features/chat/hooks/use-mutation';
import useChatStore from '@/features/chat/stores';
import useApplicationStore from '@/lib/store';
import { JoinRoomRequest, ListMessageResponse, PayloadNewMessage } from '@/features/chat/types';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { router } from 'expo-router';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { useInfiniteQueryListMessage } from '@/features/chat/hooks/use-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useAuthStore from '@/features/auth/store';
import SocketService from '@/features/chat/socket-service';
import { queryClient } from '@/lib/provider/query-provider';
import dayjs from 'dayjs';
import { InfiniteData } from '@tanstack/query-core';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';


// Hook để lấy thông tin phòng chat
export const useGetRoomChat = () => {
  const { mutate: getRoomId } = useMutationGetRoomId();
  const setLoading = useApplicationStore((state) => state.setLoading);
  const setRoom = useChatStore((state) => state.setRoom);
  const handleError = useErrorToast();
  const checkRedirect = useCheckAuthToRedirect();

  return (params: JoinRoomRequest) => {
    checkRedirect(() => {
      setLoading(true);
      getRoomId(params, {
        onSuccess: (data) => {
          setRoom(data.data);
          router.push('/(app)/(service)/chat');
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    });
  };
};

export const useChat = () => {
  const {t} = useTranslation();
  const {error: errorToast} = useToast();

  const room = useChatStore((state) => state.room);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const {mutate: sendMessage} = useMutationSendMessage();
  const [joinStatus, setJoinStatus] = useState<'pending' | 'joining' | 'joined' | 'error'>(
    'pending'
  );
  // Trạng thái trực tuyến của đối phương
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);

  const historyQuery = useInfiniteQueryListMessage(
    {
      filter: {},
      page: 1,
      per_page: 10,
    },
    room?.id,
    joinStatus === 'joined'
  );

  const messages = useMemo(() => {
    return historyQuery.data?.pages.flatMap((page) => page.data.data) || [];
  }, [historyQuery.data]);

  // Cập nhật cache tin nhắn khi nhận được tin nhắn mới
  const updateCache = useCallback((msg: PayloadNewMessage) => {
    if (!room?.id) return;

    queryClient.setQueriesData<InfiniteData<ListMessageResponse>>(
      { queryKey: ['chatApi-listMessages', room.id] },
      (oldData) => {
        return produce(oldData, (draft) => {
          if (!draft?.pages?.length) return;
          const firstPage = draft.pages[0];
          const messages = firstPage.data?.data;
          if (!messages) return;
          // 1. Tìm tin nhắn: Ưu tiên tìm theo temp_id trước, sau đó mới tìm theo id thật
          const index = messages.findIndex((m) => {
            const matchTempId = !!(msg.temp_id && m.temp_id === msg.temp_id);
            const matchRealId = !!(msg.id && m.id === msg.id);
            return matchTempId || matchRealId;
          });

          // 2. Cập nhật tin nhắn nếu tìm thấy
          if (index !== -1) {
            messages[index] = {
              ...messages[index],
              ...msg,
              id: msg.id || messages[index].id,
              temp_id: msg.temp_id || messages[index].temp_id,
              status_sent: msg.status_sent || 'sent'
            };
          } else {
            messages.unshift({
              ...msg,
              status_sent: msg.status_sent || 'sent'
            });
          }
        });
      }
    );
  }, [queryClient, room?.id]);

  // Gửi tin nhắn
  const submitMessage = (msg: string) => {
    if (!room || !user) return;

    const tempId = dayjs().unix().toString();

    const tempMsg: PayloadNewMessage = {
      id: tempId,
      room_id: room.id,
      content: msg,
      sender_id: user.id,
      sender_name: user.name,
      created_at: dayjs().toISOString(),
      temp_id: tempId,
      status_sent: 'pending', // Trạng thái gửi (nếu là tin tạm thời) (ko có trong response)
    };
    updateCache(tempMsg);
    sendMessage({
      content: msg,
      room_id: room.id,
      temp_id: tempId,
    }, {
      onSuccess: () => {
        // Cập nhật tin Optimistic thành tin thật khi nhận phản hồi thành công
        updateCache({ ...tempMsg, status_sent: 'sent' });
      },
      onError: (error: any) => {
        // Cập nhật tin Optimistic thành tin thất bại khi nhận phản hồi thất bại
        updateCache({ ...tempMsg, status_sent: 'failed' });
      },
    });
  }

  // Lắng nghe sự kiện khi room hoặc token thay đổi
  useEffect(() => {
    if (!room?.id || !token) {
      setJoinStatus('error');
      return;
    }

    let isMounted = true; // Cờ để tránh set state khi unmount

    const initSocket = async () => {
      try {
        if(isMounted) setJoinStatus('joining');
        // Reset cache tin nhắn cũ khi join room mới
        await queryClient.resetQueries({ queryKey: ['chatApi-listMessages', room.id] });
        // Bắt đầu kết nối
        SocketService.connect(token);
        // QUAN TRỌNG: Đợi kết nối thành công (Handshake xong)
        await SocketService.waitForConnection();
        // Sau khi đã có connection -> Mới Join Room
        await SocketService.joinRoom(room.id);

        if(isMounted) setJoinStatus('joined');

      } catch (error: any) {
        if(isMounted) setJoinStatus('error');
      }
    };

    initSocket();

    SocketService.onMessageNew((newMsg: PayloadNewMessage) => {
      updateCache(newMsg);
    });

    return () => {
      isMounted = false;
      SocketService.leaveRoom(room?.id);
      SocketService.offMessageNew();
      SocketService.disconnect();
    };
  }, [room?.id, token]);

  // Cập nhật joinStatus khi historyQuery gặp lỗi
  useEffect(() => {
    if (historyQuery.isError) {
      setJoinStatus('error');
    }
  }, [historyQuery.isError]);


  // Hiển thị thông báo lỗi khi join room thất bại
  useEffect(() => {
    if (joinStatus === "error") {
      errorToast({message: t('chat.error_join_room')});
      router.back();
    }
  }, [joinStatus]);

  // Lắng nghe thay đổi trạng thái online/offline của partner
  useEffect(() => {
    // Lắng nghe thay đổi realtime từ Socket
    SocketService.socket?.on('user_presence_change', (data: { userId: string, status: string }) => {
      // Nếu ID người thay đổi trạng thái đúng là partner của mình
      if (String(data.userId) === String(room?.partner_id)) {
        setIsPartnerOnline(data.status === 'online');
      }
    });

    return () => {
      SocketService.socket?.off('user_presence_change');
    };
  }, [room?.partner_id]);

  return {
    historyQuery,
    joinStatus,
    messages,
    submitMessage,
    user,
    room,
    isPartnerOnline,
  };
};
