import React from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useGetReviewList } from '@/features/service/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import dayjs from 'dayjs';
import StarRating from '@/components/star-rating';
import { ReviewItem } from '@/features/service/types';
import { useTranslation } from 'react-i18next';
import {Text} from "@/components/ui/text"
import { TFunction } from 'i18next';

interface ReviewListModalProps {
  isVisible: boolean;
  onClose: () => void;
  ktv_id: string;
}

const Review = React.memo(({ item, t }: { item: ReviewItem, t: TFunction }) => {
  const [imageError, setImageError] = React.useState<boolean>(false);
  return (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        {/* Avatar xử lý hidden */}
        <View className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          {(item.reviewer?.avatar && !item.hidden && !imageError) ? (
            <Image
              source={{ uri: item.reviewer.avatar }}
              style={{ width: '100%', height: '100%' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-blue-100">
              <Text className="text-primary-color-2 font-inter-bold">
                {item.hidden ? "?" : item.reviewer?.name?.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-inter-bold text-gray-800">
            {item.hidden ? t('review.hidden_user') : item.reviewer?.name}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <StarRating rating={item.rating} size={16} />
            <Text className="text-gray-400 text-xs ml-2">
              {dayjs(item.review_at).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>
      </View>

      {item.comment ? (
        <Text className="text-gray-600 text-sm leading-5">{item.comment}</Text>
      ) : (
        <Text className="text-gray-400 font-inter-italic text-sm">{t('review.no_comment')}</Text>
      )}
    </View>
  );
});

const ReviewListModal = ({ isVisible, onClose, ktv_id }: ReviewListModalProps) => {
  const {t} = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    pagination
  } = useGetReviewList(ktv_id);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet" // Chỉ có tác dụng trên iOS để tạo hiệu ứng thẻ bài
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* --- Header --- */}
        <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <View>
            <Text className="text-xl font-inter-bold text-gray-900">{t('review.all_reviews')}</Text>
            {(pagination?.meta?.total || 0) > 0 && (
              <Text className="text-xs text-gray-500">{t('review.total_reviews', { count: pagination?.meta?.total || 0 })}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-100 p-2 rounded-full"
          >
            <X size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* --- List Body --- */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <Review item={item} t={t} />}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}

            // Làm mới danh sách
            onRefresh={refetch}
            refreshing={isLoading}

            // Phân trang
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.3}

            // Trạng thái load thêm
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator color="#3B82F6" />
                </View>
              ) : null
            }

            // Khi không có dữ liệu
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Text className="text-gray-400">{t('review.no_reviews')}</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default ReviewListModal;
