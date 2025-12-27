import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import {
  Star,
  Clock,
  Banknote, // Icon tiền
  Trash2,
  Pencil,
  User,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { useServiceDetail, useSetService } from '@/features/ktv/hooks';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { cn, formatBalance } from '@/lib/utils';

export const SERVICE_DETAIL = {
  id: '1',
  name: 'Massage Thụy Điển Cao Cấp',
  image:
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop',
  status: 'active', // active | inactive
  bookingCount: 245,
  rating: 4.8,
  ratingCount: 120,
  description:
    'Liệu pháp massage toàn thân sử dụng tinh dầu thiên nhiên giúp thư giãn cơ bắp, giảm căng thẳng và cải thiện tuần hoàn máu. Bao gồm các kỹ thuật xoa bóp nhẹ nhàng đến trung bình, phù hợp cho người mới bắt đầu trải nghiệm massage hoặc muốn thư giãn sâu sau những giờ làm việc căng thẳng.',
  options: [
    { id: 'opt1', duration: 90, price: 650000 },
    { id: 'opt2', duration: 60, price: 450000 },
  ],
  reviews: [
    {
      id: 'r1',
      user: 'Nguyễn Thùy Linh',
      avatar: 'https://i.pravatar.cc/150?img=5',
      date: '12/10/2023',
      rating: 5.0,
      comment:
        'Kỹ thuật viên tay nghề rất tốt, không gian yên tĩnh và thơm mùi tinh dầu sả chanh dễ chịu. Rất đáng trải nghiệm!',
    },
    {
      id: 'r2',
      user: 'Trần Huy',
      avatar: 'https://i.pravatar.cc/150?img=11',
      date: '05/10/2023',
      rating: 4.5,
      comment:
        'Dịch vụ tốt, nhân viên nhiệt tình. Tuy nhiên mình đợi hơi lâu một chút so với giờ đặt hẹn.',
    },
  ],
};

export default function ServiceDetailScreen() {
  const { detail } = useServiceDetail();

  const { editService, deleteService } = useSetService();

  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      {/* --- HEADER --- */}
      <HeaderBack title={'ktv.services.detail_title'} />

      {/* --- SCROLL VIEW --- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- IMAGE & INFO --- */}
        <View className="my-4 px-4">
          {/* Image Card */}
          <View className="relative h-48 w-full overflow-hidden rounded-2xl bg-gray-200">
            <Image
              source={{ uri: detail.image_url || '' }}
              style={{
                width: '100%',
                height: '100%',
              }}
              contentFit="cover"
            />
            {/* Status Badge */}
            <View className="absolute right-3 top-3 flex-row items-center rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
              <View
                className={cn(
                  'mr-1.5 h-2 w-2 rounded-full',
                  detail.is_active ? 'bg-green-500' : 'bg-gray-400'
                )}
              />
              <Text className="font-inter-bold text-xs text-gray-800">
                {detail.is_active ? t('common.active') : t('common.inactive')}
              </Text>
            </View>
          </View>

          <View className="mt-4 self-start rounded-md bg-blue-100 px-2 py-1">
            <Text className="ml-1 font-inter-semibold text-sm text-primary-color-2">
              {detail.category.name}
            </Text>
          </View>

          {/* Title */}
          <Text className="mt-2 font-inter-bold text-xl leading-7 text-gray-900">
            {detail.name}
          </Text>

          {/* Stats Row */}
          <View className="mt-2 flex-row items-center gap-4">
            {/* Bookings Count */}
            <View className="flex-row items-center rounded-md bg-blue-50 px-2 py-1">
              <User size={14} color={DefaultColor.base['primary-color-2']} />
              <Text className="ml-1 font-inter-semibold text-xs text-primary-color-2">
                {detail.bookings_count} {t('common.booking')}
              </Text>
            </View>
            {/* Rating */}
            <View className="flex-row items-center">
              <Star size={14} color={DefaultColor.yellow[500]} />
              <Text className="ml-1 font-inter-bold text-sm text-gray-900">
                {detail.avg_rating}
              </Text>
              {/*Xem tất cả đánh giá*/}
              <TouchableOpacity>
                <Text className={'ml-2 font-inter-semibold text-sm text-primary-color-2'}>
                  ({t('ktv.services.see_reviews')})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- BUTTONS --- */}
          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              onPress={() => editService(detail.id)}
              className="flex-1 flex-row items-center justify-center rounded-xl bg-primary-color-2 py-3 shadow-md shadow-blue-200"
            >
              <Pencil size={18} color="white" />
              <Text className="ml-2 font-inter-bold text-sm text-white">
                {t('ktv.services.edit_service')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteService(detail.id, true)}
              className="flex-1 flex-row items-center justify-center rounded-xl border border-red-100 bg-red-50 py-3"
            >
              <Trash2 size={18} color={DefaultColor.red[500]} />
              <Text className="ml-2 font-inter-bold text-sm text-red-500">
                {t('ktv.services.delete_service')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- DIVIDER --- */}
        <View className="h-2 bg-gray-50" />

        {/* --- SECTION 2: DESCRIPTION --- */}
        <View className="px-4 py-5">
          <Text className="mb-2 font-inter-bold text-base text-gray-900">
            {t('common.description')}
          </Text>
          <Text className="text-sm leading-6 text-gray-600">
            {detail.description || t('common.no_description')}
          </Text>
        </View>

        {/* --- DIVIDER --- */}
        <View className="h-2 bg-gray-50" />

        {/* --- SECTION 3: OPTIONS & ACTIONS --- */}
        <View className="px-4 py-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900">{t('ktv.services.options')}</Text>
          </View>

          {/* Options List */}
          {detail.options.map((opt) => (
            <View
              key={opt.id}
              className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="flex-row items-center">
                <Clock size={14} color={DefaultColor.gray[700]} />
                <Text className="ml-1.5 text-sm font-inter-bold text-gray-700">
                  {opt.duration} {t('common.minute')}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Banknote size={14} color={DefaultColor.base['primary-color-2']} />
                <Text className="ml-1.5 text-sm font-inter-bold text-primary-color-2">
                  {formatBalance(opt.price)} {t('common.currency')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
