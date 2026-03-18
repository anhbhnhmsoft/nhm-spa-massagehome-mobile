import { PayloadNewMessage } from '@/features/chat/types';
import { cn } from '@/lib/utils';
import { TFunction } from 'i18next';
import React, { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/text';
import { AlertCircle, Check, Clock } from 'lucide-react-native';

const MessageStatus = ({ status }: { status: PayloadNewMessage['status_sent'] }) => {
  if (status === 'pending') return <Clock size={12} color="#BFDBFE" />;
  if (status === 'sent') return <Check size={12} color="#BFDBFE" />;
  if (status === 'failed') return <AlertCircle size={12} color="#FCA5A5" />;
  return null;
};
type MessageItemProps = {
  item: PayloadNewMessage;
  currentUserId: string;
  onLongPress: (item: PayloadNewMessage) => void;
  t: TFunction;
};

export const MessageItem = memo(({ item, currentUserId, onLongPress, t }: MessageItemProps) => {
  const isMe = item.sender_id === currentUserId;
  console.log('render message item', item);

  return (
    <TouchableOpacity
      onLongPress={() => onLongPress(item)}
      delayLongPress={350}
      activeOpacity={0.85}
      className={cn('my-1 w-full flex-row px-4', isMe ? 'justify-end' : 'justify-start')}>
      <View
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isMe ? 'rounded-br-none bg-blue-600' : 'rounded-bl-none bg-gray-200',
          item.status_sent === 'failed' && 'opacity-60'
        )}>
        <Text className={cn('text-[15px]', isMe ? 'text-white' : 'text-black')} selectable>
          {item.translated_content ?? item.content}
        </Text>

        {!!item.translated_content && (
          <Text className={cn('mt-0.5 text-[10px]', isMe ? 'text-blue-200' : 'text-gray-400')}>
            {t('chat.translated')}
          </Text>
        )}

        <View className="mt-1 flex-row items-center justify-end gap-1">
          <Text className={cn('text-[10px]', isMe ? 'text-blue-200' : 'text-gray-500')}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {isMe && <MessageStatus status={item.status_sent} />}
        </View>
      </View>
    </TouchableOpacity>
  );
});
