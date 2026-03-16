import {
  useMutationGetRoomId,
  useMutationSeenMessages,
  useMutationSendMessage,
} from '@/features/chat/hooks/use-mutation';
import useChatStore from '@/features/chat/stores';
import { useApplicationStore } from '@/features/app/stores';
import {
  JoinRoomRequest,
  KTVConversationItem,
  KTVConversationResponse,
  ListMessageResponse,
  PayloadNewMessage,
} from '@/features/chat/types';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { router } from 'expo-router';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import {
  useInfiniteQueryKTVConversations,
  useInfiniteQueryListMessage,
} from '@/features/chat/hooks/use-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/features/auth/stores';
import SocketService from '@/features/chat/socket-service';
import { queryClient } from '@/lib/provider/query-provider';
import dayjs from 'dayjs';
import { InfiniteData } from '@tanstack/query-core';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import useToast from '@/features/app/hooks/use-toast';
import { _ChatConstant } from '@/features/chat/consts';
import { goBack } from '@/lib/utils';
import { AppState, AppStateStatus } from 'react-native';

// Hook để lấy thông tin phòng chat
export const useGetRoomChat = () => {
  const { mutate: getRoomId } = useMutationGetRoomId();
  const { mutate: seenMessages } = useMutationSeenMessages();
  const setLoading = useApplicationStore((state) => state.setLoading);
  const setRoom = useChatStore((state) => state.setRoom);
  const handleError = useErrorToast();
  const checkRedirect = useCheckAuthToRedirect();

  // Hàm tham gia phòng chat
  return (params: JoinRoomRequest, forWho: 'ktv' | 'customer' = 'customer') => {
    checkRedirect(() => {
      setLoading(true);
      getRoomId(params, {
        onSuccess: (res) => {
          const data = res.data;
          setRoom(data);
          // Đánh dấu tin nhắn đọc trong phòng chat
          seenMessages(data.id, {
            onSuccess: () => {
              setLoading(false);
              if (forWho === 'customer') {
                router.push('/(app)/(customer)/(service)/chat');
              } else {
                router.push('/(app)/(ktv)/(service)/chat');
              }
            },
            onError: (error) => {
              setLoading(false);
              handleError(error);
            },
          });
        },
        onError: (error) => {
          setLoading(false);
          handleError(error);
        },
      });
    });
  };
};

// Hook để quản lý chat

export const useChat = (useFor: 'ktv' | 'customer') => {
  const { t } = useTranslation();
  const { error: errorToast } = useToast();

  // Tách từng selector nhỏ → chỉ re-render khi đúng field thay đổi
  const room = useChatStore((s) => s.room);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const { mutate: sendMessage } = useMutationSendMessage();
  const [joinStatus, setJoinStatus] = useState<'pending' | 'joining' | 'joined' | 'error'>(
    'pending'
  );
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);

  const historyQuery = useInfiniteQueryListMessage(
    { filter: {}, page: 1, per_page: 10 },
    room?.id,
    joinStatus === 'joined'
  );

  const messages = useMemo(
    () => historyQuery.data?.pages.flatMap((p) => p.data.data) ?? [],
    [historyQuery.data]
  );

  // Stable callback – không phụ thuộc object room, chỉ lấy room.id
  const updateCache = useCallback(
    (msg: PayloadNewMessage) => {
      if (!room?.id) return;
      queryClient.setQueriesData<InfiniteData<ListMessageResponse>>(
        { queryKey: ['chatApi-listMessages', room.id] },
        (old) =>
          produce(old, (draft) => {
            const msgs = draft?.pages?.[0]?.data?.data;
            if (!msgs) return;

            const idx = msgs.findIndex(
              (m) => (msg.temp_id && m.temp_id === msg.temp_id) || (msg.id && m.id === msg.id)
            );

            const merged = { ...msgs[idx], ...msg, status_sent: msg.status_sent ?? 'sent' };
            idx !== -1 ? (msgs[idx] = merged) : msgs.unshift(merged);
          })
      );
    },
    [room?.id]
  );

  const submitMessage = useCallback(
    (content: string) => {
      if (!room || !user) return;

      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const tempMsg: PayloadNewMessage = {
        id: tempId,
        temp_id: tempId,
        room_id: room.id,
        content,
        sender_id: user.id,
        sender_name: user.name,
        created_at: dayjs().toISOString(),
        status_sent: 'pending',
      };

      updateCache(tempMsg);
      sendMessage(
        { content, room_id: room.id, temp_id: tempId },
        {
          onSuccess: () => updateCache({ ...tempMsg, status_sent: 'sent' }),
          onError: () => updateCache({ ...tempMsg, status_sent: 'failed' }),
        }
      );
    },
    [room, user, updateCache, sendMessage]
  );

  // Socket lifecycle
  useEffect(() => {
    if (!room?.id || !token) {
      setJoinStatus('error');
      return;
    }

    let mounted = true;

    const connect = async () => {
      try {
        if (mounted) setJoinStatus('joining');
        await queryClient.resetQueries({ queryKey: ['chatApi-listMessages', room.id] });
        SocketService.connect(token);
        await SocketService.waitForConnection();
        await SocketService.joinRoom(room.id);
        SocketService.onMessageNew((msg: PayloadNewMessage) => updateCache(msg));
        if (mounted) setJoinStatus('joined');
      } catch {
        if (mounted) setJoinStatus('error');
      }
    };

    const disconnect = () => {
      SocketService.leaveRoom(room.id);
      SocketService.disconnect();
    };

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state.match(/inactive|background/)) disconnect();
      else if (state === 'active') connect();
    });

    connect();

    return () => {
      mounted = false;
      disconnect();
      sub.remove();
      SocketService.offMessageNew();
      if (useFor === 'ktv') {
        queryClient.invalidateQueries({ queryKey: ['chatApi-listKTVConversations'] });
      }
    };
  }, [room?.id, token, useFor]);

  useEffect(() => {
    if (historyQuery.isError) setJoinStatus('error');
  }, [historyQuery.isError]);

  useEffect(() => {
    if (joinStatus !== 'error') return;
    errorToast({ message: t('chat.error_join_room') });
    goBack();
  }, [joinStatus]);

  // Partner online presence – dùng handler ref để off đúng function
  useEffect(() => {
    const handler = (data: { userId: string; status: string }) => {
      if (String(data.userId) === String(room?.partner_id)) {
        setIsPartnerOnline(data.status === 'online');
      }
    };
    SocketService.socket?.on('user_presence_change', handler);
    return () => {
      SocketService.socket?.off('user_presence_change', handler);
    };
  }, [room?.partner_id]);

  return { historyQuery, joinStatus, messages, submitMessage, user, room, isPartnerOnline };
};

// Lấy danh sách cuộc trò chuyện KTV
export const useGetKTVConversations = () => {
  const token = useAuthStore((state) => state.token);

  // Cấu hình params (Dùng useMemo để tránh re-render object gây fetch lại vô lý)
  const paramsSearch = useMemo(
    () => ({
      filter: {},
      per_page: 15,
      page: 1,
    }),
    []
  );

  // 2. Gọi Hook Infinite Query
  const query = useInfiniteQueryKTVConversations(paramsSearch);

  // 3. Làm phẳng dữ liệu từ Infinite Pages thành Array đơn giản để hiển thị FlatList
  const conversations = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  // Handler xử lý khi có tin nhắn mới
  const handleSocketUpdate = useCallback(
    (payload: PayloadNewMessage) => {
      const queryKey = ['chatApi-listKTVConversations', paramsSearch];
      queryClient.setQueryData<InfiniteData<KTVConversationResponse>>(queryKey, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        return produce(oldData, (draft) => {
          let foundItem: KTVConversationItem | null = null;
          // A. TÌM VÀ CẮT (Duyệt qua các pages)
          for (const page of draft.pages) {
            const list = page.data.data;
            // Tìm index trong mảng items
            const index = list.findIndex((item) => item.id === payload.room_id);
            if (index !== -1) {
              foundItem = list[index]; // Giữ lại item cũ (proxy)
              list.splice(index, 1); // Xóa khỏi vị trí cũ
              break;
            }
          }
          // CHUẨN BỊ ITEM MỚI HOẶC UPDATE ITEM CŨ
          if (foundItem) {
            // Đã tồn tại -> Update
            foundItem.unread_count = (foundItem.unread_count || 0) + 1;
            foundItem.latest_message = {
              id: payload.id?.toString() || Date.now().toString(),
              content: payload.content,
              created_at: payload.created_at,
            };
          } else {
            // Mới tinh -> Tạo mới đúng chuẩn Type KTVConversationItem
            foundItem = {
              id: payload.room_id,
              customer: {
                id: payload.sender_id,
                name: payload.sender_name,
                avatar: payload.sender_avatar || null,
              },
              unread_count: 1,
              latest_message: {
                id: payload.id?.toString(),
                content: payload.content,
                created_at: payload.created_at,
              },
            };
          }

          // CHÈN LÊN ĐẦU TRANG 1
          if (draft.pages.length > 0) {
            draft.pages[0].data.data.unshift(foundItem);
          }
        });
      });
    },
    [queryClient, paramsSearch]
  );

  // 4. Xử lý Realtime Socket
  useEffect(() => {
    if (!token) return;
    // Lấy lại dữ liệu mới khi có sự thay đổi trên socket
    query.refetch();
    // Đảm bảo socket đã kết nối
    const socket = SocketService.connect(token);

    // Đăng ký lắng nghe sự kiện
    socket.on(_ChatConstant.CHAT_CONVERSATION_UPDATE, handleSocketUpdate);

    // Cleanup khi unmount
    return () => {
      socket.off(_ChatConstant.CHAT_CONVERSATION_UPDATE, handleSocketUpdate);
      // Không cần ngắt kết nối socket
      SocketService.disconnect();
    };
  }, [token, paramsSearch]); // Dependencies quan trọng

  return {
    conversations,
    ...query,
  };
};
