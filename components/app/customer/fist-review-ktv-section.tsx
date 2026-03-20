import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ChevronRight } from 'lucide-react-native';
import React, { FC, useState } from 'react';
import { TFunction } from 'i18next';
import { KTVDetail } from '@/features/user/types';
import dayjs from 'dayjs';
import StarRating from '@/components/star-rating';
import Empty from '@/components/empty';
import ReviewListModal from '@/components/app/list-review';
import Avatar from '@/components/ui/avatar';

type Props = {
  t: TFunction;
  review_count: number;
  recent_reviews: KTVDetail['recent_reviews'] | null;
  ktv_id: string;
};

export const RecentReviewKtvSection: FC<Props> = ({ t, review_count, recent_reviews, ktv_id }) => {
  // Trạng thái hiển thị danh sách review
  const [showReviewList, setShowReviewList] = useState(false);

  return (
    <>
      <View className="mt-2 bg-white p-4">
        {/* --- Header Review --- */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-inter-bold text-base text-gray-800">
            {t('masseurs_detail.review_by_customer')}
          </Text>
        </View>

        {/* --- Disclaimer (Dòng chữ cam) --- */}
        <View className="mb-3 rounded bg-orange-50 px-2 py-1.5">
          <Text className="text-[10px] leading-4 text-orange-500">
            {t('masseurs_detail.review_disclaimer')}
          </Text>
        </View>

        {/* --- Nội dung Review ( comment) --- */}

        {!recent_reviews || recent_reviews.length === 0 ? (
          <Empty />
        ) : (
          recent_reviews.map((item) => <ReviewRecentItem key={item.id} item={item} t={t} />)
        )}

        {/* --- Button Xem tất cả --- */}
        {review_count > 0 && (
          <TouchableOpacity
            className="mt-4 flex-row items-center justify-center rounded-full bg-gray-50 py-2"
            onPress={() => setShowReviewList(true)}>
            <Text className="font-inter-medium text-xs text-gray-500">
              {t('masseurs_detail.see_all_reviews', { count: review_count })}
            </Text>
            <Icon as={ChevronRight} size={12} className="ml-2 text-gray-500" />
          </TouchableOpacity>
        )}
      </View>
      <ReviewListModal
        isVisible={showReviewList}
        onClose={() => setShowReviewList(false)}
        params={{ user_id: ktv_id }}
      />
    </>
  );
};

// Hiển thị đánh giá đầu tiên của KTV
const ReviewRecentItem = ({ item, t }: { item: KTVDetail['recent_reviews'][0]; t: TFunction }) => {
  return (
    <>
      <View className="mt-1 flex-row items-center justify-center">
        <Avatar source={item.review_by?.avatar_url} size={32} borderWidth={0} />
        <View className="ml-3 flex-1 gap-2">
          <View className="flex-row justify-between">
            <Text className="font-inter-bold text-xs text-gray-700">
              {item.review_by?.name ? item.review_by.name : t('review.hidden_user')}
            </Text>
            <Text className="text-[10px] text-gray-400">
              {dayjs(item.created_at).format('DD/MM/YYYY')}
            </Text>
          </View>
          <StarRating rating={item.rating} size={10} />
          <Text className="mb-2 text-xs text-gray-600" numberOfLines={2}>
            {item.comment || t('review.no_comment')}
          </Text>
        </View>
      </View>
    </>
  );
};
