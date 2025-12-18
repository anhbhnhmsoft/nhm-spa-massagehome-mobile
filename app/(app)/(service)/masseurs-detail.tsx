import React, { useMemo, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import Carousel from 'react-native-reanimated-carousel'; // Import thư viện
import { Star, MessageCircle, ChevronLeft, ChevronRight, } from 'lucide-react-native';
import { useKTVDetail } from '@/features/user/hooks';
import { AvatarKTV, ImageDisplayCustomer, ReviewFistItem, ServiceCard } from '@/components/app/masseurs-detail';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { router } from 'expo-router';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { formatDistance } from '@/lib/utils';
import { _GenderMap } from '@/features/auth/const';
import dayjs from 'dayjs';
import DefaultColor from '@/components/styles/color';
import Empty from '@/components/empty';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// Lấy chiều rộng màn hình để set cho Carousel
const { width: PAGE_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = PAGE_WIDTH * 1.2; // Tỷ lệ ảnh dọc (giống hình mẫu)


const MasseurDetailScreen = () => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  const {detail , queryServices, refreshPage} = useKTVDetail();
  // Danh sách ảnh hiển thị trong Carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  // Trạng thái mở rộng của giới thiệu
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const calculateDistance = useCalculateDistance();

    const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = queryServices;

  const distance = useMemo(() => {
    if (detail) {
      return calculateDistance(
        detail.review_application.latitude,
        detail.review_application.longitude
      );
    }
    return null;
  }, [detail]);

  console.log(detail.id)

  return (
    <View className={`flex-1 bg-base-color-3`}>
      <FlatList
        keyExtractor={(item, index) => `service-${item.id}-${index}`}
        data={data}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
        }}
        onEndReachedThreshold={0.5}
        overScrollMode="never"
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListHeaderComponent={
          <View className="flex-1">
            {/* --- HEADER CAROUSEL --- */}
            <View className="relative">
              {/* --- CAROUSEL --- */}
              <Carousel
                loop
                width={PAGE_WIDTH}
                height={CAROUSEL_HEIGHT}
                autoPlay={false}
                data={detail.display_image}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({ item }) => (
                  <View className="flex-1 justify-center">
                    <ImageDisplayCustomer
                      source={item.url}
                      width={PAGE_WIDTH}
                      height={CAROUSEL_HEIGHT}
                    />
                  </View>
                )}
              />

              {/* Badge đếm số ảnh (Overlay ở góc dưới) */}
              <View
                style={{ bottom: 32, right: 16 }}
                className="absolute rounded-full bg-black/50 px-3 py-1">
                <Text className="text-xs font-medium text-white">
                  {t('masseurs_detail.display_image')} {currentIndex + 1}/
                  {detail.display_image.length}
                </Text>
              </View>

              {/* Nút Chat hỗ trợ */}
              <TouchableOpacity className="absolute right-4 top-12 rounded-full bg-white/80 p-2">
                <Icon as={MessageCircle} size={20} className="text-primary-color-2" />
              </TouchableOpacity>

              {/* Nút Back hoặc Action phía trên (Optional) */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="absolute left-4 top-12 rounded-full bg-white/80 p-2">
                {/* Icon Back ở đây nếu cần */}
                <Icon as={ChevronLeft} size={20} className="text-primary-color-2" />
              </TouchableOpacity>
            </View>

            {/* --- INFO SECTION  --- */}
            <View
              style={{ marginTop: -24 }}
              className="rounded-t-3xl bg-white px-4 pb-6 pt-4 shadow-sm">
              {/* Avatar & Name */}
              <View className="mt-2 flex-row items-center gap-4">
                <AvatarKTV source={detail.profile.avatar_url} />
                <View>
                  <Text className="font-inter-bold text-2xl text-gray-800">{detail.name}</Text>
                  {detail.booking_soon && (
                    <View className="bg-orange-100 self-start px-2 py-0.5 rounded-md mt-1.5">
                      <Text className="text-orange-600 text-[10px] font-bold">
                        {t('masseurs_detail.booking_soon', { time: detail.booking_soon })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Rating & Bio */}
              <View className="mt-3 flex-row items-center">
                {/* Lượt đánh giá */}
                <View className="mr-3 flex-row items-center rounded bg-orange-50 px-2 py-1">
                  <Icon
                    as={Star}
                    className="mr-1"
                    size={14}
                    fill={DefaultColor.yellow[500]}
                    color={DefaultColor.yellow[500]}
                  />
                  <Text className="text-xs font-bold text-orange-500">
                    {detail.rating} ({detail.review_count}) {t('masseurs_detail.review_count')}
                  </Text>
                </View>
                {/* Đã phục vụ bao nhiêu đơn hàng */}
                <Text className="text-xs text-gray-500">
                  {t('masseurs_detail.sales_count', { count: detail.jobs_received_count })}
                </Text>
              </View>
              {/* Giới thiệu */}
              <View className="mt-3">
                <Text className="font-inter-bold text-lg text-primary-color-2">
                  {t('masseurs_detail.introduction')}
                </Text>
                <View className="mt-3">
                  <Text
                    className="text-sm leading-6 text-gray-800"
                    numberOfLines={isBioExpanded ? undefined : 2}>
                    {detail.review_application.bio}
                  </Text>

                  {/* Chỉ hiện nút nếu văn bản dài (ví dụ > 100 ký tự) để tránh hiện nút khi bio quá ngắn */}
                  {detail.review_application.bio && detail.review_application.bio.length > 100 && (
                    <TouchableOpacity
                      className="mt-2 flex-row items-center justify-center rounded-lg bg-gray-50 py-2"
                      onPress={() => setIsBioExpanded(!isBioExpanded)}>
                      <Text className="mr-1 text-xs text-gray-500">
                        {isBioExpanded ? t('common.hide') : t('common.see_more')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Stats Grid (Giữ nguyên như cũ) */}
              <View className="mt-4 flex-row justify-between border-t border-gray-100 pt-4">
                {/* Số năm kinh nghiệm */}
                <View className="items-center gap-1">
                  <Text className="text-xs text-gray-400">{t('masseurs_detail.experience')}</Text>
                  <Text className="font-inter-medium">
                    {detail.review_application.experience} {t('common.year')}
                  </Text>
                </View>
                {/* Giới tính */}
                <View className="items-center gap-1">
                  <Text className="text-xs text-gray-400">{t('masseurs_detail.gender')}</Text>
                  <Text className="font-inter-medium">{t(_GenderMap[detail.profile.gender])}</Text>
                </View>
                {/* Tuổi */}
                <View className="items-center gap-1">
                  <Text className="text-xs text-gray-400">{t('masseurs_detail.age')}</Text>
                  <Text className="font-inter-medium">
                    {detail.profile.date_of_birth
                      ? dayjs().diff(dayjs(detail.profile.date_of_birth), 'year')
                      : '-'}
                  </Text>
                </View>
                {/* Khoảng cách */}
                <View className="items-center gap-1">
                  <Text className="text-xs text-gray-400">{t('masseurs_detail.distance')}</Text>
                  <Text className="font-inter-medium">
                    {distance ? formatDistance(distance) : '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* --- Review Section --- */}
            <View className="mt-2 bg-white p-4">
              {/* --- Header Review --- */}
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-base font-bold text-gray-800">
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
              <ReviewFistItem item={detail.first_review} />

              {/* --- Button Xem tất cả --- */}
              {detail.review_count > 1 && (
                <TouchableOpacity className="mt-4 flex-row items-center justify-center rounded-full bg-gray-50 py-2">
                  <Text className="text-xs font-medium text-gray-500">
                    {t('masseurs_detail.see_all_reviews', { count: detail.review_count - 1 })}
                  </Text>
                  <Icon as={ChevronRight} size={12} className="ml-2 text-gray-500" />
                </TouchableOpacity>
              )}
            </View>

            {/* --- DANH SÁCH DỊCH VỤ --- */}
            <View className="mt-2 bg-white pt-4 px-4">
              <Text className="mb-4 border-l-4 border-primary-color-2 pl-2 font-inter-bold text-lg text-gray-800">
                {t('masseurs_detail.service_list')}
              </Text>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refreshPage()} />
        }
        renderItem={({ item }) => {
          return (
            <View
              key={item.id}
              className="bg-white px-5 pb-4" // Thêm bg-white và padding-bottom
            >
              <ServiceCard item={item} />
            </View>
          )
        }}
        ListEmptyComponent={<Empty />}
        ListFooterComponent={<View style={{
          backgroundColor: 'white',
          paddingBottom: insets.bottom,
        }} />}
      />
    </View>
  );
};

export default MasseurDetailScreen;
