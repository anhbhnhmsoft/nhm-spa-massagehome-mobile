import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import dayjs from 'dayjs';
import { InfiniteData } from '@tanstack/query-core';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';

import { queryClient } from '@/lib/provider/query-provider';
import { goBack } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/stores';
import SocketService from '@/features/chat/socket-service';
import {
  ListMessageRequest,
} from '@/features/chat/types';
import useToast from '@/features/app/hooks/use-toast';
import { useSupportMessagesQuery, useSupportTicketQuery } from '@/features/support/hooks/use-query';
import {
  useMutationSendSupportMessage,
  useMutationSeenSupportMessages,
} from '@/features/support/hooks/use-mutation';
import {
  SupportMessage,
  SupportMessageListResponse,
  SupportSocketMessagePayload,
} from '@/features/support/types';
import useConfigStore from '@/features/config/stores';

type SupportChatMessage = SupportMessage & {
  room_id?: string;
  status_sent?: 'pending' | 'sent' | 'failed';
  sender_id?: string | null;
};

export const useSupportChat = (ticketId?: string | number) => {
  const { t } = useTranslation();
  const { error: errorToast } = useToast();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setActiveSupportRoomId = useConfigStore((s) => s.setActiveSupportRoomId);
  const resetSupportUnreadCount = useConfigStore((s) => s.resetSupportUnreadCount);

  const { mutate: sendMessage } = useMutationSendSupportMessage();
  const { mutate: seenMessages } = useMutationSeenSupportMessages();
  const [joinStatus, setJoinStatus] = useState<'pending' | 'joining' | 'joined' | 'error'>(
    'pending'
  );
  const [params] = useState<ListMessageRequest>({
    filter: {},
    page: 1,
    per_page: 20,
  });

  const ticketQuery = useSupportTicketQuery(ticketId, joinStatus !== 'error');
  const historyQuery = useSupportMessagesQuery(ticketId, params, joinStatus === 'joined');
  const messages = useMemo(
    () => historyQuery.data?.pages.flatMap((p) => p.data.data) ?? [],
    [historyQuery.data]
  );

  const ticket = ticketQuery.data ?? null;
  const roomId = ticket?.room_id ?? (ticket?.id ? `support-ticket:${ticket.id}` : undefined);

  const updateCache = useCallback(
    (msg: Partial<SupportChatMessage> & { id: string; temp_id?: string | null }) => {
      if (!roomId) return;
      queryClient.setQueriesData<InfiniteData<SupportMessageListResponse>>(
        { queryKey: ['supportApi-messages', ticketId] },
        (old) =>
          produce(old, (draft) => {
            const msgs = draft?.pages?.[0]?.data?.data;
            if (!msgs) return;

            const idx = msgs.findIndex(
              (m) => (msg.temp_id && m.temp_id === msg.temp_id) || (msg.id && m.id === msg.id)
            );

            if (idx === -1) {
              const senderId = msg.sender_id ?? msg.sender_user_id ?? msg.sender_admin_id ?? msg.id;
              msgs.unshift({
                ...msg,
                sender_id: senderId,
                status_sent: msg.status_sent ?? 'sent',
              } as SupportMessage);
            } else {
              const senderId = msg.sender_id ?? msg.sender_user_id ?? msg.sender_admin_id ?? msgs[idx].id;
              msgs[idx] = {
                ...msgs[idx],
                ...msg,
                sender_id: senderId,
                status_sent: msg.status_sent ?? msgs[idx].status_sent,
              };
            }
          })
      );
    },
    [roomId, ticketId]
  );

  const submitMessage = useCallback(
    (content: string) => {
      if (!ticket || !user || !roomId) return;

      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const tempMsg: SupportChatMessage = {
        id: tempId,
        temp_id: tempId,
        support_ticket_id: ticket.id,
        room_id: roomId,
        content,
        sender_id: user.id,
        sender_user_id: user.id,
        sender_name: user.name,
        sender_type: 'customer',
        created_at: dayjs().toISOString(),
        status_sent: 'pending',
      };

      updateCache(tempMsg);
      sendMessage(
        { support_ticket_id: ticket.id, content, temp_id: tempId },
        {
          onSuccess: () => updateCache({ ...tempMsg, status_sent: 'sent' }),
          onError: () => updateCache({ ...tempMsg, status_sent: 'failed' }),
        }
      );
    },
    [ticket, user, roomId, updateCache, sendMessage]
  );

  useEffect(() => {
    if (!ticketId || !token) {
      setJoinStatus('error');
      return;
    }

    if (ticketQuery.isLoading || ticketQuery.isFetching) {
      return;
    }

    if (ticketQuery.isError) {
      setJoinStatus('error');
      return;
    }

    if (!roomId) {
      setJoinStatus('error');
      return;
    }

    let mounted = true;
    const handleSupportMessage = (payload: SupportSocketMessagePayload) => {
      const msg = payload?.message;
      if (!msg?.id || !msg?.content) return;
      updateCache({
        ...msg,
        sender_id: msg.sender_user_id ?? msg.sender_admin_id ?? msg.id,
      });
    };

    const connect = async () => {
      try {
        if (mounted) setJoinStatus('joining');
        await queryClient.resetQueries({ queryKey: ['supportApi-messages', ticketId] });
        SocketService.connect(token);
        await SocketService.waitForConnection();
        await SocketService.joinRoom(roomId);
        setActiveSupportRoomId(roomId);
        SocketService.onSupportMessageNew(handleSupportMessage);
        if (mounted) setJoinStatus('joined');
        if (ticket?.id) {
          seenMessages(
            { support_ticket_id: ticket.id },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['supportApi-tickets'] });
              },
            }
          );
        }
        resetSupportUnreadCount();
      } catch {
        if (mounted) setJoinStatus('error');
      }
    };

    const leaveSupportRoom = () => {
      if (roomId) {
        SocketService.leaveRoom(roomId);
      }
      setActiveSupportRoomId(null);
    };

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state.match(/inactive|background/)) leaveSupportRoom();
      else if (state === 'active') connect();
    });

    connect();

    return () => {
      mounted = false;
      leaveSupportRoom();
      sub.remove();
      SocketService.offSupportMessageNew(handleSupportMessage);
    };
  }, [
    ticketId,
    roomId,
    ticket?.id,
    token,
    ticketQuery.isLoading,
    ticketQuery.isFetching,
    ticketQuery.isError,
    seenMessages,
    updateCache,
    resetSupportUnreadCount,
    setActiveSupportRoomId,
  ]);

  useEffect(() => {
    if (historyQuery.isError || ticketQuery.isError) setJoinStatus('error');
  }, [historyQuery.isError, ticketQuery.isError]);

  useEffect(() => {
    if (joinStatus !== 'error') return;
    errorToast({ message: t('chat.error_join_room') });
    goBack();
  }, [joinStatus]);

  return {
    ticket,
    historyQuery,
    joinStatus,
    messages,
    submitMessage,
    user,
  };
};
