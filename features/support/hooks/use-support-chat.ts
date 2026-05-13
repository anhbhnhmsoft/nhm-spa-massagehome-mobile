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
  PayloadNewMessage,
  ListMessageRequest,
  ListMessageResponse,
} from '@/features/chat/types';
import useToast from '@/features/app/hooks/use-toast';
import { useSupportMessagesQuery, useSupportTicketQuery } from '@/features/support/hooks/use-query';
import {
  useMutationSendSupportMessage,
  useMutationSeenSupportMessages,
} from '@/features/support/hooks/use-mutation';

type SupportChatMessage = PayloadNewMessage & {
  sender_id?: string | null;
  sender_user_id?: string | null;
  sender_admin_id?: string | null;
  sender_type?: 'customer' | 'staff' | 'system';
  sender_name?: string | null;
  sender_avatar?: string | null;
};

export const useSupportChat = (ticketId?: string | number) => {
  const { t } = useTranslation();
  const { error: errorToast } = useToast();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

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

  const updateCache = useCallback(
    (msg: Partial<SupportChatMessage> & { id: string; temp_id?: string }) => {
      if (!ticket?.room_id) return;
      queryClient.setQueriesData<InfiniteData<ListMessageResponse>>(
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
              } as PayloadNewMessage);
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
    [ticket?.room_id, ticketId]
  );

  const submitMessage = useCallback(
    (content: string) => {
      if (!ticket || !user) return;

      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const tempMsg: SupportChatMessage = {
        id: tempId,
        temp_id: tempId,
        room_id: ticket.room_id,
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
    [ticket, user, updateCache, sendMessage]
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

    if (!ticket?.room_id) {
      setJoinStatus('error');
      return;
    }

    let mounted = true;
    const connect = async () => {
      try {
        if (mounted) setJoinStatus('joining');
        await queryClient.resetQueries({ queryKey: ['supportApi-messages', ticketId] });
        SocketService.connect(token);
        await SocketService.waitForConnection();
        await SocketService.joinRoom(ticket.room_id);
        SocketService.onSupportMessageNew((payload: any) => {
          const msg = payload?.message ?? payload;
          if (!msg?.id || !msg?.content) return;
          updateCache(msg);
        });
        if (mounted) setJoinStatus('joined');
        seenMessages({ support_ticket_id: ticket.id });
      } catch {
        if (mounted) setJoinStatus('error');
      }
    };

    const disconnect = () => {
      SocketService.leaveRoom(ticket.room_id);
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
      SocketService.offSupportMessageNew();
    };
  }, [ticketId, ticket?.room_id, ticket?.id, token, ticketQuery.isLoading, ticketQuery.isFetching, ticketQuery.isError]);

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
