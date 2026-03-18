import { goBack } from '@/lib/utils';
import { AppState, AppStateStatus } from 'react-native';
import { useImmer } from 'use-immer';
import { useTranslation } from 'react-i18next';
import useChatStore from '@/features/chat/stores';
import { useAuthStore } from '@/features/auth/stores';
import { useMutationSendMessage } from '@/features/chat/hooks/use-mutation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ListMessageRequest, ListMessageResponse, PayloadNewMessage } from '@/features/chat/types';
import { useInfiniteQueryListMessage } from '@/features/chat/hooks/use-query';
import { queryClient } from '@/lib/provider/query-provider';
import { InfiniteData } from '@tanstack/query-core';
import dayjs from 'dayjs';
import SocketService from '@/features/chat/socket-service';
import { produce } from 'immer';
import useToast from '@/features/app/hooks/use-toast';

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
  const [params, setParams] = useImmer<ListMessageRequest>({
    filter: {},
    page: 1,
    per_page: 10,
  });

  const historyQuery = useInfiniteQueryListMessage(params, room?.id, joinStatus === 'joined');
  const messages = useMemo(
    () => historyQuery.data?.pages.flatMap((p) => p.data.data) ?? [],
    [historyQuery.data]
  );

  const updateCache = useCallback(
    (msg: Partial<PayloadNewMessage> & { id: string; temp_id?: string }) => {
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

            if (idx === -1) {
              msgs.unshift({ ...msg, status_sent: msg.status_sent ?? 'sent' } as PayloadNewMessage);
            } else {
              msgs[idx] = {
                ...msgs[idx],
                ...msg,
                status_sent: msg.status_sent ?? msgs[idx].status_sent,
              };
            }
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

  return {
    historyQuery,
    joinStatus,
    messages,
    submitMessage,
    user,
    room,
    params,
  };
};
