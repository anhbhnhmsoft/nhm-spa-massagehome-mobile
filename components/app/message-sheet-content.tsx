import { PayloadNewMessage } from '@/features/chat/types';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { TFunction } from 'i18next';
import { Copy, Languages } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/text';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { cn } from '@/lib/utils';

// ─── LangChip ────────────────────────────────────────────────

type LangChipProps = {
  code: _LanguageCode;
  label: string;
  icon: any;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: (code: _LanguageCode) => void;
};

const LangChip = ({ code, label, icon, isSelected, isDisabled, onPress }: LangChipProps) => {
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
      <Image source={icon} style={{ width: 16, height: 16, borderRadius: 8 }} resizeMode="cover" />
      <Text
        className={cn('text-[13px] font-medium', isSelected ? 'text-blue-600' : 'text-gray-700')}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ─── MessageSheetContent ─────────────────────────────────────

type SheetContentProps = {
  item: PayloadNewMessage;
  onClose: () => void;
  t: TFunction;
  handleTranslateMessage: () => void;
  handleCopy: () => void;
  targetLang: _LanguageCode;
  setTargetLang: (lang: _LanguageCode) => void;
  isTranslating: boolean;
};

export const MessageSheetContent = ({
  item,
  onClose,
  t,
  handleTranslateMessage,
  handleCopy,
  targetLang,
  setTargetLang,
  isTranslating,
}: SheetContentProps) => {
  const insets = useSafeAreaInsets();

  // Lang đã được dịch thành công — chỉ update khi API trả về
  const [translatedLang, setTranslatedLang] = useState<_LanguageCode | null>(null);

  // Đang xem bản dịch hay bản gốc
  const [isShowingTranslated, setIsShowingTranslated] = useState(false);

  // Ref để detect translated_content thay đổi (API vừa trả về bản dịch mới)
  const prevTranslatedContent = useRef(item.translated_content);

  // ✅ Bản dịch hiện tại có khớp với lang đang chọn không
  const isTranslatedForCurrentLang = !!item.translated_content && translatedLang === targetLang;

  // ✅ Nội dung hiển thị
  const displayContent =
    isShowingTranslated && isTranslatedForCurrentLang ? item.translated_content! : item.content;

  // ✅ Khi API trả về bản dịch mới (translated_content thay đổi)
  // → lưu lang vừa dịch + tự show bản dịch
  useEffect(() => {
    if (item.translated_content && item.translated_content !== prevTranslatedContent.current) {
      prevTranslatedContent.current = item.translated_content;
      setTranslatedLang(targetLang);
      setIsShowingTranslated(true);
    }
  }, [item.translated_content, targetLang]);

  // ✅ Khi đổi targetLang sang lang chưa dịch → ẩn bản dịch cũ
  useEffect(() => {
    if (translatedLang !== targetLang) {
      setIsShowingTranslated(false);
    }
  }, [targetLang]);

  const handleTranslate = useCallback(() => {
    if (isTranslatedForCurrentLang) {
      // Đã có bản dịch đúng lang → toggle gốc/dịch
      setIsShowingTranslated((prev) => !prev);
    } else {
      // Chưa dịch hoặc đổi lang mới → gọi API
      handleTranslateMessage();
    }
  }, [isTranslatedForCurrentLang, handleTranslateMessage]);

  // ✅ Label button rõ ràng theo từng trạng thái
  const translateLabel = isTranslating
    ? t('chat.translating')
    : isTranslatedForCurrentLang
      ? isShowingTranslated
        ? t('chat.view_original') // đang xem dịch → cho xem gốc
        : t('chat.view_translation') // đang xem gốc → cho xem dịch
      : t('chat.translate_message'); // chưa dịch / đổi lang mới

  return (
    <View style={{ paddingBottom: insets.bottom + 8 }}>
      {/* Preview */}
      <View className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
        <Text className="text-[13px] text-gray-500" numberOfLines={3}>
          {displayContent}
        </Text>
        {isTranslatedForCurrentLang && (
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

      {/* Translate button */}
      <TouchableOpacity
        disabled={isTranslating}
        onPress={handleTranslate}
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
            onPress={setTargetLang}
          />
        ))}
      </View>
    </View>
  );
};
