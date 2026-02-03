import React, { useState } from 'react';
import { PayloadNewMessage } from '@/features/chat/types';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { cn, goBack } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { AlertCircle, Check, ChevronLeft, Clock, Send } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/features/chat/hooks';
import DefaultColor from '@/components/styles/color';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { router } from 'expo-router';


const MessageItem = React.memo(({ item, currentUserId }: { item: PayloadNewMessage, currentUserId: string }) => {
  const isMe = item.sender_id === currentUserId;

  return (
    <View className={cn('my-1 px-4 w-full flex-row', isMe ? 'justify-end' : 'justify-start')}>
      <View
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isMe ? 'bg-blue-600 rounded-br-none' : 'bg-gray-200 rounded-bl-none'
        )}
      >
        <Text className={cn('text-[15px]', isMe ? 'text-white' : 'text-black')}>
          {item.content}
        </Text>
        {/* Status Line */}
        <View className="flex-row items-center justify-end mt-1 gap-1">
          <Text className={cn('text-[10px]', isMe ? 'text-blue-200' : 'text-gray-500')}>
            {/* Format giờ tùy ý, ví dụ dùng dayjs */}
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {/* Chỉ hiện trạng thái gửi cho tin nhắn của mình */}
          {isMe && (
            <>
              {item.status_sent === 'pending' && <Clock size={12} color="#BFDBFE" />}
              {item.status_sent === 'sent' && <Check size={12} color="#BFDBFE" />}
              {item.status_sent === 'failed' && <AlertCircle size={12} color="#FCA5A5" />}
            </>
          )}
        </View>
      </View>
    </View>
  );
});

export default function ChatViewScreen({ useFor }: { useFor: 'ktv' | 'customer'  }) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');

  const {
    messages,
    submitMessage,
    joinStatus,
    historyQuery,
    user,
    room,
    // isPartnerOnline,
  } = useChat(useFor);

  // Xử lý gửi tin
  const handleSend = () => {
    if (!inputText.trim()) return;
    submitMessage(inputText.trim());
    setInputText('');
  };

  // --- UI LOADING KHI MỚI VÀO ---
  if (joinStatus === 'joining' || (joinStatus === 'pending' && historyQuery.isLoading)) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
        <Text className="text-gray-500 mt-2">{t('chat.connecting')}</Text>
      </View>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      {/* --- A. HEADER --- */}
      <View className="flex-row items-center p-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => goBack()} className="mr-3">
          <ChevronLeft size={24} color={DefaultColor.gray[800]} />
        </TouchableOpacity>

        <View className="flex-1">
          {/* Lấy tên đối phương từ store room (giả sử structure room có partner) */}
          <Text className="font-inter-bold text-gray-800" numberOfLines={1}>
            {room?.partner_name || "Chat Room"}
          </Text>
          {/*{isPartnerOnline ? (*/}
          {/*  <Text className="text-xs text-green-600">{t('chat.online')}</Text>*/}
          {/*) : (*/}
          {/*  <Text className="text-xs text-gray-400">{t('chat.offline')}</Text>*/}
          {/*)}*/}
        </View>
      </View>

      {/* --- B. MESSAGE LIST --- */}
      <KeyboardAvoidingView
        behavior={'padding'}
        className="flex-1"
      >
        <FlatList
          data={messages}
          // Key extractor quan trọng: ưu tiên id thật, fallback id tạm
          keyExtractor={(item) => item.temp_id || item.id || Math.random().toString()}

          renderItem={({ item }) => (
            <MessageItem item={item} currentUserId={user?.id || ''} />
          )}

          // QUAN TRỌNG: Đảo ngược danh sách (Tin mới nhất ở dưới cùng)
          inverted
          contentContainerStyle={{ paddingVertical: 10 }}
          // Infinite Scroll Logic
          onEndReached={() => {
            if (historyQuery.hasNextPage) {
              historyQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}

          // Spinner khi load thêm lịch sử (sẽ hiện ở trên cùng do inverted)
          ListFooterComponent={
            historyQuery.isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator size="small" color={DefaultColor.base['primary-color-2']} />
              </View>
            ) : null
          }
        />

        {/* --- C. INPUT BAR --- */}
        <View className="p-3 bg-white border-t border-gray-100 flex-row items-center pb-6">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 mr-3 text-base max-h-24"
            placeholder={t('chat.placeholder')}
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="default"
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}