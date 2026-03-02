import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { ChevronRight, User } from 'lucide-react-native';
import React, { FC, useState } from 'react';
import { TFunction } from 'i18next';
import { KTVDetail } from '@/features/user/types';
import { Image } from 'expo-image';
import DefaultColor from '@/components/styles/color';
import dayjs from 'dayjs';
import StarRating from '@/components/star-rating';
import Empty from '@/components/empty';
import ReviewListModal from '@/components/app/list-review';

type Props = {
  t: TFunction;
  review_count: number;
  first_review: KTVDetail['first_review'];
  ktv_id: string;
}

export const FistReviewKtvSection:FC<Props> = ({t, review_count, first_review, ktv_id}) => {
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
       <ReviewFistItem item={first_review} />

       {/* --- Button Xem tất cả --- */}
       {review_count > 1 && (
         <TouchableOpacity
           className="mt-4 flex-row items-center justify-center rounded-full bg-gray-50 py-2"
           onPress={() => setShowReviewList(true)}>
           <Text className="font-inter-medium text-xs text-gray-500">
             {t('masseurs_detail.see_all_reviews', { count: review_count - 1 })}
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
  )
}

// Hiển thị đánh giá đầu tiên của KTV
const ReviewFistItem = ({ item }: { item: KTVDetail['first_review'] }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <View className="mt-1 flex-row items-center justify-center">
        {item ? (
          <>
            {/* Avatar người review (Giả định) */}
            {item.review_by.avatar_url && !imageError ? (
              <Image
                source={{ uri: item.review_by.avatar_url }}
                style={{ width: 32, height: 32, borderRadius: 9999 }}
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  backgroundColor: DefaultColor.slate[200],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon as={User} size={14} className="text-slate-400" />
              </View>
            )}
            <View className="ml-3 flex-1 gap-2">
              <View className="flex-row justify-between">
                <Text className="font-inter-bold text-xs text-gray-700">{item.review_by.name}</Text>
                <Text className="text-[10px] text-gray-400">
                  {dayjs(item.created_at).format('DD/MM/YYYY')}
                </Text>
              </View>
              <StarRating rating={item.rating} size={10} />
              <Text className="mb-2 text-xs text-gray-600">{item.comment}</Text>
            </View>
          </>
        ) : (
          <Empty/>
        )}
      </View>
    </>
  );
};