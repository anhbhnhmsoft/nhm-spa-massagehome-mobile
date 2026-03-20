import React, { forwardRef } from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { _LanguagesMap } from '@/lib/const';
import { Text } from '@/components/ui/text';
import AppBottomSheet from '@/components/ui/app-bottom-sheet';
import { ListReviewRequest, ReviewItem } from '@/features/service/types';
import { useReviewTranslation } from '@/features/service/hooks';
import { LangPicker } from '@/components/ui/lang-chip';
import { Divider } from '@/components/ui/divider';

type Props = {
  review: ReviewItem | null;
  params: ListReviewRequest;
  onDismiss: () => void;
};

export const ReviewTranslateSheet = forwardRef<BottomSheetModal, Props>(
  ({ review, params, onDismiss }, ref) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const {
      loading,
      targetLang,
      translatedComment,
      handleChangeLang,
      handleResetTargetLang,
      handleResetTranslateComment,
    } = useReviewTranslation(review, params);

    return (
      <AppBottomSheet
        ref={ref}
        onDismiss={() => {
          handleResetTranslateComment();
          handleResetTargetLang();
          onDismiss();
        }}>
        <View style={{ paddingBottom: insets.bottom + 8 }} className="px-3">
          <View className="flex-row items-center justify-end">
            <TouchableOpacity
              onPress={() => {
                handleResetTranslateComment();
                handleResetTargetLang();
                onDismiss();
              }}
              className="rounded-full bg-gray-200 p-2">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Preview nội dung */}
          <View className="mb-3 py-3">
            <Text className="text-[13px] text-gray-500" numberOfLines={4}>
              {review?.comment || t('review.no_comment')}
            </Text>

            {targetLang && translatedComment[targetLang] && (
              <>
                <Divider />
                <Text className="mt-1 text-[11px] text-gray-400">
                  {translatedComment[targetLang]}
                </Text>
              </>
            )}
            {loading && (
              <View className="mt-1 flex-row items-center gap-1">
                <ActivityIndicator size={10} color="#9CA3AF" />
                <Text className="text-[11px] text-gray-400">{t('review.translating')}</Text>
              </View>
            )}
          </View>

          {/* Lang picker */}
          <LangPicker
            targetLang={targetLang}
            loading={loading}
            handleChangeLang={handleChangeLang}
            t={t}
          />
        </View>
      </AppBottomSheet>
    );
  }
);

export default ReviewTranslateSheet;
