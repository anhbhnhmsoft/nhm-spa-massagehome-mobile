import React, { useCallback, useRef, useState } from 'react';
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
import { useChat } from '@/features/chat/hooks';
import { cn, goBack } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import DefaultColor from '@/components/styles/color';
import { MessageItem } from './message-item';
import { MessageSheetContent } from './message-sheet-content';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { PayloadNewMessage } from '@/features/chat/types';

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

export default function ChatViewScreen({ useFor }: { useFor: 'ktv' | 'customer' }) {
  const { t } = useTranslation();
  const translateSheetRef = useRef<BottomSheetModal>(null);
  const [selectedMessage, setSelectedMessage] = useState<PayloadNewMessage | null>(null);
  const [inputText, setInputText] = useState('');

  const { messages, submitMessage, joinStatus, historyQuery, user, room, params } = useChat(useFor);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    submitMessage(text);
    setInputText('');
  }, [inputText, submitMessage]);

  // Handle long press to show translate sheet
  const handleLongPress = useCallback((item: PayloadNewMessage) => {
    setSelectedMessage(item);
    requestAnimationFrame(() => translateSheetRef.current?.present());
  }, []);

  // Handle dismiss sheet
  const handleDismissSheet = useCallback(() => {
    setSelectedMessage(null);
    translateSheetRef.current?.dismiss();
  }, []);

  const handleEndReached = useCallback(() => {
    if (historyQuery.hasNextPage) historyQuery.fetchNextPage();
  }, [historyQuery.hasNextPage, historyQuery.fetchNextPage]);

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

      {/* Header */}
      <View className="flex-row items-center border-b border-gray-100 bg-white p-4">
        <TouchableOpacity onPress={goBack} className="mr-3">
          <ChevronLeft size={24} color={DefaultColor.gray[800]} />
        </TouchableOpacity>
        <Text className="flex-1 font-inter-bold text-gray-800" numberOfLines={1}>
          {room?.partner_name ?? 'Chat Room'}
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <FlatList
          data={messages}
          keyExtractor={(item) => item.temp_id ?? item.id}
          renderItem={({ item }) => (
            <MessageItem
              item={item}
              currentUserId={user?.id ?? ''}
              onLongPress={handleLongPress}
              t={t}
            />
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

        {/* Input */}
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
      </KeyboardAvoidingView>

      {/* Bottom Sheet */}
      <MessageSheetContent
        item={selectedMessage}
        ref={translateSheetRef}
        onClose={handleDismissSheet}
        t={t}
        params={params}
      />
    </SafeAreaView>
  );
}
