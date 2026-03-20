import { PayloadNewMessage } from '@/features/chat/types';
import { _LanguagesMap } from '@/lib/const';
import { TFunction } from 'i18next';
import { Copy } from 'lucide-react-native';
import React, { forwardRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/text';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { useChatTranslation } from '@/features/chat/hooks';
import AppBottomSheet from '../ui/app-bottom-sheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import { LangPicker } from '../ui/lang-chip';

type SheetContentProps = {
  item: PayloadNewMessage | null;
  onClose: () => void;
  t: TFunction;
};

export const MessageSheetContent = forwardRef<BottomSheetModal, SheetContentProps>(
  ({ item, onClose, t }, ref) => {
    const insets = useSafeAreaInsets();

    const {
      targetLang,
      translatedChat,
      handleChangeTargetLang,
      handleResetTargetLang,
      handleResetTranslateChat,
      isTranslating,
    } = useChatTranslation(item);

    const handleCopyToClipboard = useCopyClipboard();

    const translatedText = targetLang ? translatedChat?.[targetLang] : null;
    const displayContent = translatedText || item?.content;

    return (
      <AppBottomSheet
        ref={ref}
        onDismiss={() => {
          handleResetTranslateChat();
          handleResetTargetLang();
          onClose();
        }}>
        <View style={{ paddingBottom: insets.bottom + 8 }}>
          {/* Preview */}
          <View className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
            <Text className="text-[13px] text-gray-500" numberOfLines={3}>
              {displayContent}
            </Text>

            {translatedText && (
              <Text className="mt-1 text-[11px] text-gray-400">{t('chat.translation')}</Text>
            )}

            {isTranslating && (
              <View className="mt-1 flex-row items-center gap-1">
                <ActivityIndicator size={10} color="#9CA3AF" />
                <Text className="text-[11px] text-gray-400">{t('chat.translating')}</Text>
              </View>
            )}
          </View>

          {/* Copy */}
          <TouchableOpacity
            onPress={() => {
              if (displayContent) handleCopyToClipboard(displayContent);
              onClose();
            }}
            className="flex-row items-center gap-4 rounded-xl px-2 py-4 active:bg-gray-50">
            <Copy size={20} color="#374151" />
            <Text className="text-[16px] font-medium text-gray-800">{t('chat.copy')}</Text>
          </TouchableOpacity>

          <View className="mx-2 h-px bg-gray-100" />

          {/* Lang picker */}
          <LangPicker
            targetLang={targetLang}
            loading={isTranslating}
            handleChangeLang={handleChangeTargetLang}
            t={t}
          />
        </View>
      </AppBottomSheet>
    );
  }
);
