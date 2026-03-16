import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Languages, X } from 'lucide-react-native';
import { useGetReviewList } from '@/features/service/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import dayjs from 'dayjs';
import StarRating from '@/components/star-rating';
import { ListReviewRequest, ReviewItem } from '@/features/service/types';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { TFunction } from 'i18next';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet'; // 👈 thêm
import ReviewTranslateSheet from './review-item-translate';

interface ReviewListModalProps {
  isVisible: boolean;
  onClose: () => void;
  params: ListReviewRequest['filter'];
}

// ─── Review item ──────────────────────────────────────────────────────────────

interface ReviewProps {
  item: ReviewItem;
  t: TFunction;
  onLongPress: (item: ReviewItem) => void; // 👈 thêm
  translatedComment: string | null; // 👈 thêm
}

const Review = React.memo(({ item, t, onLongPress, translatedComment }: ReviewProps) => {
  const [imageError, setImageError] = React.useState(false);
  const isTranslated = !!translatedComment;
  const displayComment = translatedComment ?? item.comment;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      delayLongPress={100}
      onLongPress={() => onLongPress(item)}
      className="mb-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      {/* Avatar + Info */}
      <View className="mb-3 flex-row items-center">
        <View className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
          {item.reviewer?.avatar && !item.hidden && !imageError ? (
            <Image
              source={{ uri: item.reviewer.avatar }}
              style={{ width: '100%', height: '100%' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-blue-100">
              <Text className="font-inter-bold text-primary-color-2">
                {item.hidden ? '?' : item.reviewer?.name?.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-inter-bold text-gray-800">
            {item.hidden ? t('review.hidden_user') : item.reviewer?.name}
          </Text>
          <View className="mt-0.5 flex-row items-center">
            <StarRating rating={item.rating} size={16} />
            <Text className="ml-2 text-xs text-gray-400">
              {dayjs(item.review_at).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>
      </View>

      {/* Comment */}
      {displayComment ? (
        <View>
          <Text className="text-sm leading-5 text-gray-600">{displayComment}</Text>
          {/* 👇 Badge "Đã dịch" khi có bản dịch */}
          {isTranslated && (
            <View className="mt-2 flex-row items-center gap-1">
              <Languages size={10} color="#60A5FA" />
              <Text className="text-[10px] text-blue-400">{t('review.translation')}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text className="font-inter-italic text-sm text-gray-400">{t('review.no_comment')}</Text>
      )}

      {/* Hint */}
      {!isTranslated && (
        <Text className="mt-2 text-right text-[10px] text-gray-300">
          {t('review.hold_to_translate', { defaultValue: 'Nhấn giữ để dịch' })}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const ReviewListModal = ({ isVisible, onClose, params }: ReviewListModalProps) => {
  const { t } = useTranslation();
  const translateSheetRef = useRef<BottomSheetModal>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [translationMap, setTranslationMap] = useState<Record<string, string | null>>({});

  const handleUpdateTranslation = useCallback((reviewId: string, translated: string | null) => {
    setTranslationMap((prev) => ({ ...prev, [reviewId]: translated }));
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
    pagination,
    setFilter,
  } = useGetReviewList(isVisible);

  useEffect(() => {
    if (isVisible) {
      setFilter(params);
      refetch();
    }
  }, [isVisible, params]);

  const handleLongPress = useCallback((item: ReviewItem) => {
    setSelectedReview(item);
    // Delay present so the sheet is mounted first (prevents ref being null)
    requestAnimationFrame(() => translateSheetRef.current?.present());
  }, []);

  const handleDismissSheet = useCallback(() => {
    setSelectedReview(null);
  }, []);

  const handleCloseSheet = useCallback(() => {
    translateSheetRef.current?.dismiss();
  }, []);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <BottomSheetModalProvider>
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-4">
            <View>
              <Text className="font-inter-bold text-xl text-gray-900">
                {t('review.all_reviews')}
              </Text>
              {(pagination?.meta?.total || 0) > 0 && (
                <Text className="text-xs text-gray-500">
                  {t('review.total_reviews', { count: pagination?.meta?.total || 0 })}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-gray-100 p-2">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* List */}
          {isLoading || isRefetching ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Review
                  item={item}
                  t={t}
                  onLongPress={handleLongPress}
                  translatedComment={translationMap[item.id] ?? null}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              onRefresh={refetch}
              refreshing={isLoading}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4">
                    <ActivityIndicator color="#3B82F6" />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View className="items-center justify-center py-20">
                  <Text className="text-gray-400">{t('review.no_reviews')}</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>

        {selectedReview && (
          <ReviewTranslateSheet
            ref={translateSheetRef}
            review={selectedReview}
            onUpdateTranslation={handleUpdateTranslation}
            onClose={handleCloseSheet}
            onDismiss={handleDismissSheet}
          />
        )}
      </BottomSheetModalProvider>
    </Modal>
  );
};

export default ReviewListModal;
