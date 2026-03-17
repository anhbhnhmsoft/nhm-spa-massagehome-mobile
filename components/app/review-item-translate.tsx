import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Languages, X } from 'lucide-react-native';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { Text } from '@/components/ui/text';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import { cn } from '@/lib/utils';
import { ReviewItem as ReviewItemType } from '@/features/service/types';
import { useReviewTranslation } from '@/features/service/hooks/use-review-translation';

// ─── StarRating ───────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => (
  <View className="flex-row gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Text key={i} className={cn('text-sm', i < rating ? 'text-yellow-400' : 'text-gray-300')}>
        ★
      </Text>
    ))}
  </View>
);

// ─── LangChip ─────────────────────────────────────────────────

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

// ─── ReviewSheetContent ───────────────────────────────────────

type SheetContentProps = {
  review: ReviewItemType;
  onClose: () => void;
  t: TFunction;
  onUpdateTranslation?: (reviewId: string, translated: string | null) => void;
};

export const ReviewSheetContent = ({
  review,
  onClose,
  t,
  onUpdateTranslation,
}: SheetContentProps) => {
  const insets = useSafeAreaInsets();
  const {
    targetLang,
    isTranslating,
    isShowingTranslated,
    hasTranslation,
    displayComment,
    handleChangeLang,
    handleToggleTranslation,
  } = useReviewTranslation(review.id, review.comment ?? '', onUpdateTranslation);

  const translateLabel = isTranslating
    ? t('review.translating')
    : hasTranslation
      ? isShowingTranslated
        ? t('review.view_original')
        : t('review.view_translation')
      : t('review.translate');

  return (
    <View style={{ paddingBottom: insets.bottom + 8 }}>
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between px-4">
        <View>
          <Text className="font-inter-bold text-lg text-gray-800">{t('review.translate')}</Text>
        </View>
        <TouchableOpacity onPress={onClose} className="rounded-full p-2">
          <X size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Preview nội dung */}
      <View className="mb-3 rounded-xl bg-gray-50 px-4 py-3">
        <Text className="text-[13px] text-gray-500" numberOfLines={4}>
          {displayComment || t('review.no_comment')}
        </Text>
        {hasTranslation && (
          <Text className="mt-1 text-[11px] text-gray-400">
            {isShowingTranslated ? t('review.translation') : t('review.original')}
          </Text>
        )}
        {isTranslating && (
          <View className="mt-1 flex-row items-center gap-1">
            <ActivityIndicator size={10} color="#9CA3AF" />
            <Text className="text-[11px] text-gray-400">{t('review.translating')}</Text>
          </View>
        )}
      </View>

      {/* Toggle dịch / gốc */}
      <TouchableOpacity
        disabled={isTranslating || !review.comment}
        onPress={handleToggleTranslation}
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
      <Text className="px-2 pb-2 pt-3 text-[12px] text-gray-400">{t('review.translate_to')}</Text>
      <View className="flex-row flex-wrap gap-2 px-2 pb-2">
        {_LanguagesMap.map((lang) => (
          <LangChip
            key={lang.code}
            code={lang.code}
            label={lang.label}
            icon={lang.icon}
            isSelected={targetLang === lang.code}
            isDisabled={isTranslating}
            onPress={handleChangeLang}
          />
        ))}
      </View>
    </View>
  );
};

type Props = {
  review: ReviewItemType;
  onUpdateTranslation?: (reviewId: string, translated: string | null) => void;
  onClose: () => void;
  onDismiss?: () => void;
};

const ReviewTranslateSheet = forwardRef<BottomSheetModal, Props>(
  ({ review, onUpdateTranslation, onClose, onDismiss }, ref) => {
    const { t } = useTranslation();

    return (
      <AppBottomSheet ref={ref} onDismiss={onDismiss}>
        <ReviewSheetContent
          review={review}
          t={t}
          onClose={onClose}
          onUpdateTranslation={onUpdateTranslation}
        />
      </AppBottomSheet>
    );
  }
);

export default ReviewTranslateSheet;
