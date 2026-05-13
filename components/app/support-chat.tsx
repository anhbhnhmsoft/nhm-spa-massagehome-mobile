import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import DefaultColor from '@/components/styles/color';
import { MessageItem } from './message-item';
import { goBack } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import { PayloadNewMessage } from '@/features/chat/types';
import { useSupportChat } from '@/features/support/hooks/use-support-chat';
import { SupportTicketStatus } from '@/features/support/types';

type SendButtonProps = { disabled: boolean; onPress: () => void };

const SendButton = ({ disabled, onPress }: SendButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={cn(
      'h-12 w-12 items-center justify-center rounded-full',
      disabled ? 'bg-gray-300' : 'bg-blue-600'
    )}>
    <Send size={20} color="white" />
  </TouchableOpacity>
);

/** Trả về màu badge và label tương ứng với status của ticket */
const useStatusBadge = (status: SupportTicketStatus | undefined, t: ReturnType<typeof useTranslation>['t']) => {
  return useMemo(() => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t('support.status_pending') };
      case 'assigned':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: t('support.status_assigned') };
      case 'in_progress':
        return { bg: 'bg-green-100', text: 'text-green-700', label: t('support.status_in_progress') };
      case 'closed':
        return { bg: 'bg-gray-100', text: 'text-gray-500', label: t('support.status_closed') };
      default:
        return null;
    }
  }, [status, t]);
};

export default function SupportChatViewScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ ticketId?: string }>();
  const [inputText, setInputText] = useState('');

  const { ticket, messages, submitMessage, joinStatus, historyQuery, user } = useSupportChat(
    params.ticketId
  );

  const locale = useMemo(() => {
    const lang = i18n.language?.toLowerCase() ?? 'vi';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('zh') || lang.startsWith('cn')) return 'zh';
    return 'vi';
  }, [i18n.language]);

  const categoryName = useMemo(() => {
    if (!ticket?.category) return t('support.title');
    return (
      ticket.category.name?.[locale] ??
      ticket.category.name?.vi ??
      Object.values(ticket.category.name ?? {})[0] ??
      t('support.title')
    );
  }, [ticket?.category, locale, t]);

  const statusBadge = useStatusBadge(ticket?.status, t);

  const normalizedMessages = useMemo<PayloadNewMessage[]>(
    () =>
      messages.map((item: any) => {
        const isCustomer = item.sender_type === 'customer';
        const isStaff = item.sender_type === 'staff';

        const senderId = isCustomer
          ? String(item.sender_user_id ?? '')
          : isStaff
            ? String(item.sender_admin_id ?? '')
            : String(item.id);

        const senderName = isCustomer
          ? (item.sender_name ?? ticket?.customer?.name ?? '')
          : (item.sender_name ?? '');

        return {
          id: item.id,
          room_id: ticket?.room_id ?? String(item.support_ticket_id ?? ''),
          content: item.content,
          sender_id: senderId,
          sender_name: senderName,
          sender_avatar: item.sender_avatar ?? undefined,
          created_at: item.created_at ?? dayjs().toISOString(),
          temp_id: item.temp_id ?? undefined,
          // Chỉ set status_sent cho message của chính mình (customer)
          status_sent: isCustomer && item.sender_user_id === user?.id
            ? (item.status_sent ?? 'sent')
            : undefined,
        };
      }),
    [messages, ticket?.room_id, ticket?.customer?.name, user?.id]
  );

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    submitMessage(text);
    setInputText('');
  }, [inputText, submitMessage]);

  const handleEndReached = useCallback(() => {
    if (historyQuery.hasNextPage) historyQuery.fetchNextPage();
  }, [historyQuery.hasNextPage, historyQuery.fetchNextPage]);

  const isClosed = ticket?.status === 'closed';

  if (joinStatus === 'joining' || (joinStatus === 'pending' && historyQuery.isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
        <Text className="mt-2 text-gray-500">{t('chat.connecting')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden />

      {/* Header: Category name + status badge + assigned staff */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity onPress={goBack} className="mr-3">
          <ChevronLeft size={24} color={DefaultColor.gray[800]} />
        </TouchableOpacity>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="flex-1 font-inter-bold text-gray-800" numberOfLines={1}>
              #{ticket?.id} - {categoryName}
            </Text>
            {statusBadge && (
              <View className={cn('rounded-full px-2 py-0.5', statusBadge.bg)}>
                <Text className={cn('text-[10px] font-inter-bold', statusBadge.text)}>
                  {statusBadge.label}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {ticket?.assigned_staff?.name
              ? `${t('common.assigned_user')}: ${ticket.assigned_staff.name}`
              : t('common.pending')}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <FlatList
          data={normalizedMessages}
          keyExtractor={(item) => item.temp_id ?? item.id}
          renderItem={({ item }) => (
            <MessageItem item={item} currentUserId={user?.id ?? ''} onLongPress={() => {}} t={t} />
          )}
          inverted
          contentContainerStyle={{ paddingVertical: 10 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            historyQuery.isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator size="small" color={DefaultColor.base['primary-color-2']} />
              </View>
            ) : null
          }
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={15}
        />

        {/* Nếu ticket đã đóng, hiển thị banner thông báo và ẩn ô nhập */}
        {isClosed ? (
          <View className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <Text className="text-center text-sm text-gray-400">{t('support.ticket_closed')}</Text>
          </View>
        ) : (
          <View className="flex-row items-center border-t border-gray-100 bg-white p-3 pb-6">
            <TextInput
              className="mr-3 max-h-24 flex-1 rounded-full bg-gray-100 px-5 py-3 text-base"
              placeholder={t('chat.placeholder')}
              value={inputText}
              onChangeText={setInputText}
              multiline
              returnKeyType="default"
            />
            <SendButton disabled={!inputText.trim()} onPress={handleSend} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
