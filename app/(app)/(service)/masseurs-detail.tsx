import React, { useState } from 'react';
import { View, Image, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import {
  X,
  Star,
  Award,
  TrendingUp,
  MapPin,
   User,
} from 'lucide-react-native';
import { router } from 'expo-router';
import {Text} from "@/components/ui/text"
import { useTranslation } from 'react-i18next';
import GradientBackground from '@/components/styles/gradient-background';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import { formatDistance } from '@/lib/utils';
import Empty from '@/components/empty';
import { ServiceCard } from '@/components/app/service-card';
import { useKTVDetail } from '@/features/user/hooks';


export default function MasseursDetailScreen() {
  const {t} = useTranslation();
  const inset = useSafeAreaInsets();
  const {ktv , queryServices} = useKTVDetail();

  const [imageError, setImageError] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const calculateDistance = useCalculateDistance();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = queryServices;

  if (!ktv) {
    return null;
  }

  const distance = calculateDistance(ktv.review_application.latitude, ktv.review_application.longitude);


  return (
    <>
      <View className={`flex-1 bg-white`}>
        <FlatList
          keyExtractor={(item, index) => `package-${item.id}-${index}`}
          data={data}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            gap: 12,
            paddingBottom: 100,
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={null}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          ListHeaderComponent={
            <View>
              {/* --- HEADER Gradient Background --- */}
              <GradientBackground
                className={"pt-12 pb-8 px-5 relative"}
                style={{paddingTop: inset.top + 14, paddingBottom: 32, paddingHorizontal: 20}}
              >
                {/* --- Back Button --- */}
                <TouchableOpacity
                  style={{ top: inset.top + 14 }}
                  className={`absolute  right-5 bg-white/20 p-1.5 rounded-full z-10`}
                  onPress={() => router.back()}
                >
                  <X size={20} color="white" />
                </TouchableOpacity>

                <View className="flex-row items-center gap-4">
                  {/* Avatar & Status Dot */}
                  {ktv.profile.avatar_url && !imageError ? (
                    <Image
                      source={{ uri: ktv.profile.avatar_url }}
                      className="w-20 h-20 rounded-full border-2 border-white"
                      resizeMode="cover"
                      // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    // Fallback UI khi không có ảnh hoặc ảnh lỗi
                    <View className="w-20 h-20 items-center justify-center rounded-full bg-slate-200 border-2 border-white">
                      <User size={32} color="#94a3b8" />
                    </View>
                  )}

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white mb-1" numberOfLines={1}>
                      {ktv.name}
                    </Text>

                    {/* Rating Row */}
                    <TouchableOpacity className="flex-row items-center mb-2">
                      <View className="flex-row mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(ktv.rating) ? "#FACC15" : "#94A3B8"} color={i < Math.floor(ktv.rating) ? "#facc15" : "#64748B"} />
                        ))}
                      </View>
                      <Text className="text-white text-xs opacity-90">
                        {ktv.rating} ({ktv.review_count}) {t('common.see_more')}
                      </Text>
                    </TouchableOpacity>

                    {/* Bio */}
                    <View className="mt-2">
                      <Text
                        className="text-white text-xs leading-4"
                        // Nếu chưa mở rộng (false) thì giới hạn 3 dòng, ngược lại (undefined) là hiện hết
                        numberOfLines={isBioExpanded ? undefined : 2}
                      >
                        {ktv.review_application.bio}
                      </Text>

                      {/* Chỉ hiện nút nếu văn bản dài (ví dụ > 100 ký tự) để tránh hiện nút khi bio quá ngắn */}
                      {ktv.review_application.bio && ktv.review_application.bio.length > 100 && (
                        <TouchableOpacity
                          onPress={() => setIsBioExpanded(!isBioExpanded)}
                          className="mt-1 self-start" // self-start để vùng bấm chỉ gói gọn trong chữ
                        >
                          <Text className="text-yellow-400 text-xs font-inter-bold underline">
                            {isBioExpanded ? 'Thu gọn' : 'Xem thêm'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </GradientBackground>

              <View className={"px-5 pt-6"}>
                {/* Stats Row (3 Blocks) */}
                <View className="flex-row gap-4 justify-between mb-8">
                  {/* Card 1: Kinh nghiệm */}
                  <View className="items-center flex-1">
                    <View className="w-full py-6 bg-blue-100 rounded-xl items-center justify-center mb-2">
                      <Award size={24} color="#3B82F6" />
                    </View>
                    <Text className="text-gray-500 font-inter-medium text-xs mb-0.5">{t('services.experience')}</Text>
                    <Text className="text-gray-900 font-inter-bold text-base">{ktv.review_application.experience} {t('common.year')}</Text>
                  </View>

                  {/* Card 2: Hoàn thành (Dùng icon TrendingUp) */}
                  <View className="items-center flex-1">
                    <View className="w-full py-6 bg-emerald-100 rounded-xl items-center justify-center mb-2">
                      <TrendingUp size={22} color="#10B981" />
                    </View>
                    <Text className="text-gray-500 font-inter-medium text-xs mb-0.5">{t('services.completed')}</Text>
                    <Text className="text-gray-900 font-inter-bold text-base">{ktv.jobs_received_count}</Text>
                  </View>

                  {/* Card 3: Khoảng cách */}
                  {distance && (
                    <View className="items-center flex-1">
                      <View className="w-full py-6 bg-orange-100 rounded-xl items-center justify-center mb-2">
                        <MapPin size={22} color="#F59E0B" />
                      </View>
                      <Text className="text-gray-500 font-inter-medium text-xs mb-0.5">{t('services.distance')}</Text>
                      <Text className="text-gray-900 font-inter-bold text-base">{formatDistance(distance)}</Text>
                    </View>
                  )}
                </View>

                {/* Chuyên môn (Skills) */}
                <View className="mb-8">
                  <Text className="text-lg font-inter-bold text-gray-900 mb-3">
                    {t('services.specialty')}
                  </Text>
                </View>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          renderItem={({ item }) => (
            <View  key={item.id} className="px-5">
              <ServiceCard item={item} />
            </View>
          )}
          ListEmptyComponent={<Empty />}
        />
      </View>
    </>
  );
}