import { useTranslateMessage } from '@/features/chat/hooks/use-traselate';
import { PayloadNewMessage } from '@/features/chat/types';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { TFunction } from 'i18next';
import { Copy, Languages } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/text';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { cn } from '@/lib/utils';

type LangChipProps = {
  code: _LanguageCode;
  label: string;
  icon: any;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: (code: _LanguageCode) => void;
};

const LangChip = React.memo(
  ({ code, label, icon, isSelected, isDisabled, onPress }: LangChipProps) => {
    const handlePress = useCallback(() => onPress(code), [onPress, code]);
    return (
      <TouchableOpacity
        disabled={isDisabled}
        onPress={handlePress}
        className={cn(
          'flex-row items-center gap-2 rounded-full border px-3 py-2',
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white',
          isDisabled && 'opacity-50'
        )}>
        <Image
          source={icon}
          style={{ width: 16, height: 16, borderRadius: 8 }}
          resizeMode="cover"
        />
        <Text
          className={cn('text-[13px] font-medium', isSelected ? 'text-blue-600' : 'text-gray-700')}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
);

type SheetContentProps = {
  item: PayloadNewMessage;
  onClose: () => void;
  t: TFunction;
  targetLang: _LanguageCode;
  setTargetLang: (lang: _LanguageCode) => void;
  initialIsShowing: boolean;
  onUpdateTranslation: (messageId: string, translated: string | null) => void;
};

export const MessageSheetContent = React.memo(
  ({
    item,
    onClose,
    t,
    targetLang,
    setTargetLang,
    initialIsShowing,
    onUpdateTranslation,
  }: SheetContentProps) => {
    const insets = useSafeAreaInsets();

    const {
      isTranslating,
      isShowingTranslated,
      hasTranslation,
      displayContent,
      handleChangeTargetLang,
      handleTranslateMessage,
      handleCopyToClipboard,
    } = useTranslateMessage(item.id, item.content, targetLang, setTargetLang, initialIsShowing);

    // Sync bản dịch lên parent – chỉ chạy khi trạng thái thực sự thay đổi
    useEffect(() => {
      const translated = isShowingTranslated && hasTranslation ? displayContent : null;
      onUpdateTranslation(item.id, translated);
    }, [isShowingTranslated, hasTranslation, displayContent, item.id, onUpdateTranslation]);

    const handleCopy = useCallback(() => {
      handleCopyToClipboard();
      onClose();
    }, [handleCopyToClipboard, onClose]);

    const translateLabel = isTranslating
      ? t('chat.translating')
      : hasTranslation
        ? isShowingTranslated
          ? t('chat.view_original')
          : t('chat.view_translation')
        : t('chat.translate_message');

    return (
      <View style={{ paddingBottom: insets.bottom + 8 }}>
        {/* Preview */}
        <View className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
          <Text className="text-[13px] text-gray-500" numberOfLines={3}>
            {displayContent}
          </Text>
          {hasTranslation && (
            <Text className="mt-1 text-[11px] text-gray-400">
              {isShowingTranslated ? t('chat.translation') : t('chat.original')}
            </Text>
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
          onPress={handleCopy}
          className="flex-row items-center gap-4 rounded-xl px-2 py-4 active:bg-gray-50">
          <Copy size={20} color="#374151" />
          <Text className="text-[16px] font-medium text-gray-800">{t('chat.copy')}</Text>
        </TouchableOpacity>

        <View className="mx-2 h-px bg-gray-100" />

        {/* Translate toggle */}
        <TouchableOpacity
          disabled={isTranslating}
          onPress={handleTranslateMessage}
          className="flex-row items-center gap-4 rounded-xl px-2 py-4 active:bg-gray-50">
          {isTranslating ? (
            <ActivityIndicator size={20} color="#3B82F6" />
          ) : (
            <Languages size={20} color="#3B82F6" />
          )}
          <Text
            className={cn(
              'text-[16px] font-medium',
              isTranslating ? 'text-gray-400' : 'text-gray-800'
            )}>
            {translateLabel}
          </Text>
        </TouchableOpacity>

        {/* Lang picker */}
        <View className="mx-2 h-px bg-gray-100" />
        <Text className="px-2 pb-2 pt-3 text-[12px] text-gray-400">{t('chat.translate_to')}</Text>
        <View className="flex-row flex-wrap gap-2 px-2 pb-2">
          {_LanguagesMap.map((lang) => (
            <LangChip
              key={lang.code}
              code={lang.code}
              label={lang.label}
              icon={lang.icon}
              isSelected={targetLang === lang.code}
              isDisabled={isTranslating}
              onPress={handleChangeTargetLang}
            />
          ))}
        </View>
      </View>
    );
  }
);
