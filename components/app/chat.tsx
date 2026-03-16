import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AlertCircle, Check, ChevronLeft, Clock, Copy, Languages, Send } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { PayloadNewMessage } from '@/features/chat/types';
import { useChat } from '@/features/chat/hooks';
import { cn, goBack } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import DefaultColor from '@/components/styles/color';
import { useApplicationStore } from '@/features/app/stores';
import { useTranslateMessage } from '@/features/chat/hooks/use-traselate';
import { MessageItem } from './message-item';
import { MessageSheetContent } from './message-sheet-content';

type TranslationMap = Record<string, string | null>;

// ─── SendButton ───────────────────────────────────────────────

type SendButtonProps = { disabled: boolean; onPress: () => void };

const SendButton = React.memo(({ disabled, onPress }: SendButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={cn(
      'h-12 w-12 items-center justify-center rounded-full',
      disabled ? 'bg-gray-300' : 'bg-blue-600'
    )}>
    <Send size={20} color="white" />
  </TouchableOpacity>
));

export default function ChatViewScreen({ useFor }: { useFor: 'ktv' | 'customer' }) {
  const { t } = useTranslation();
  const defaultLang = useApplicationStore((s) => s.language);

  const [inputText, setInputText] = useState('');
  const [translationMap, setTranslationMap] = useState<TranslationMap>({});
  const [selectedItem, setSelectedItem] = useState<PayloadNewMessage | null>(null);
  const [targetLang, setTargetLang] = useState<_LanguageCode>(defaultLang);

  const sheetRef = useRef<BottomSheetModal>(null);

  const { messages, submitMessage, joinStatus, historyQuery, user, room } = useChat(useFor);

  const handleLongPress = useCallback((item: PayloadNewMessage) => {
    setSelectedItem(item);
    sheetRef.current?.present();
  }, []);

  const handleSheetDismiss = useCallback(() => setSelectedItem(null), []);

  const handleCloseSheet = useCallback(() => sheetRef.current?.dismiss(), []);

  // Stable update – sử dụng functional update để không phụ thuộc translationMap
  const handleUpdateTranslation = useCallback(
    (id: string, translated: string | null) =>
      setTranslationMap((p) => {
        if (p[id] === translated) return p;
        return { ...p, [id]: translated };
      }),
    []
  );

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    submitMessage(text);
    setInputText('');
  }, [inputText, submitMessage]);

  const messagesWithTranslation = useMemo(
    () =>
      messages.map((msg) => {
        const translated = translationMap[msg.id] ?? translationMap[msg.temp_id ?? ''] ?? null;
        if (translated === (msg.translated_content ?? null)) return msg;
        return { ...msg, translated_content: translated };
      }),
    [messages, translationMap]
  );

  // initialIsShowing cho sheet: true nếu tin nhắn đang hiển thị bản dịch
  const initialIsShowing = useMemo(() => {
    if (!selectedItem) return false;
    return !!(translationMap[selectedItem.id] ?? translationMap[selectedItem.temp_id ?? '']);
  }, [selectedItem?.id, selectedItem?.temp_id]);

  const renderItem = useCallback(
    ({ item }: { item: PayloadNewMessage }) => (
      <MessageItem item={item} currentUserId={user?.id ?? ''} onLongPress={handleLongPress} t={t} />
    ),
    [user?.id, handleLongPress, t]
  );

  const keyExtractor = useCallback((item: PayloadNewMessage) => item.temp_id ?? item.id, []);

  const listFooter = useMemo(
    () =>
      historyQuery.isFetchingNextPage ? (
        <View className="py-4">
          <ActivityIndicator size="small" color={DefaultColor.base['primary-color-2']} />
        </View>
      ) : null,
    [historyQuery.isFetchingNextPage]
  );

  const handleEndReached = useCallback(() => {
    if (historyQuery.hasNextPage) historyQuery.fetchNextPage();
  }, [historyQuery.hasNextPage, historyQuery.fetchNextPage]);

  // ── Loading state ────────────────────────────────────────────

  if (joinStatus === 'joining' || (joinStatus === 'pending' && historyQuery.isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
        <Text className="mt-2 text-gray-500">{t('chat.connecting')}</Text>
      </View>
    );
  }

  // ── Main render ──────────────────────────────────────────────

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
          data={messagesWithTranslation}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          inverted
          contentContainerStyle={{ paddingVertical: 10 }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={listFooter}
          // Tắt các tính năng không cần thiết để tối ưu FlatList
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
      <AppBottomSheet ref={sheetRef} onDismiss={handleSheetDismiss}>
        {selectedItem && (
          <MessageSheetContent
            item={selectedItem}
            onClose={handleCloseSheet}
            onUpdateTranslation={handleUpdateTranslation}
            t={t}
            targetLang={targetLang}
            setTargetLang={setTargetLang}
            initialIsShowing={initialIsShowing}
          />
        )}
      </AppBottomSheet>
    </SafeAreaView>
  );
}
