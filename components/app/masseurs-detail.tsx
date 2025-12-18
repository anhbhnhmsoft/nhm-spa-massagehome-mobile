import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ImageOff, Star, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import DefaultColor from '@/components/styles/color';
import { KTVDetail } from '@/features/user/types';
import Empty from '@/components/empty';
import dayjs from 'dayjs';
import StarRating from '@/components/star-rating';
import { ServiceItem } from '@/features/service/types';
import { useTranslation } from 'react-i18next';
import { useSetService } from '@/features/service/hooks';
import { cn, formatBalance } from '@/lib/utils';

// Hiển thị ảnh của KTV với xử lý lỗi ảnh
export const ImageDisplayCustomer = ({ source, width, height}: {
  source: string;
  width: number;
  height: number;
}) => {
  const [hasError, setHasError] = useState(false);

  // Nếu có lỗi, render ra khung Placeholder (Icon + Text)
  if (hasError || !source) {
    return (
      <View style={{ width, height }} className={`items-center justify-center bg-gray-200`}>
        <Icon as={ImageOff} size={32} className="text-slate-400" />
      </View>
    );
  }

  // Nếu bình thường, render ra ảnh gốc
  return (
    <Image
      source={source}
      style={{ width, height }}
      contentFit={'cover'}
      onError={() => setHasError(true)}
    />
  );
};

// Hiển thị ảnh đại diện của KTV với xử lý lỗi ảnh
export const AvatarKTV = ({ source }: { source: string | null }) => {
  const [imageError, setImageError] = useState(false);
  if (!source || imageError) {
    return (
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: DefaultColor.base['primary-color-1'],
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon as={User} size={24} className="text-slate-400" />
      </View>
    );
  } else {
    return (
      <Image
        source={{ uri: source }}
        style={{
          width: 60,
          height: 60,
          borderRadius: 9999,
          borderWidth: 2,
          borderColor: DefaultColor.base['primary-color-1'],
        }}
        contentFit={'cover'}
        onError={(e) => {
          setImageError(true);
        }}
      />
    );
  }
};

// Hiển thị đánh giá đầu tiên của KTV
export const ReviewFistItem = ({ item }: { item: KTVDetail['first_review'] }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <View className="mt-1 flex-row">
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
          <Empty />
        )}
      </View>
    </>
  );
};

// Hiển thị thông tin dịch vụ (Card) ở màn chi tiết massager
export const ServiceCard = ({ item }: { item: ServiceItem }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  // tính giá thấp nhất trong options
  const minPrice = useMemo(() => {
    const min = item.options.reduce((acc, option) => Math.min(acc, Number(option.price)), Number(item.options[0].price));
    return min.toFixed(2);
  }, [item.options]);

  const setService = useSetService();

  return (
    <TouchableOpacity
      disabled={!item.is_active}
      onPress={() => setService(item.id)}
      className={'flex-row border-b border-gray-100 pb-4'}
    >
      {item.image_url && !imageError ? (
        <Image
          source={{ uri: item.image_url }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            backgroundColor: DefaultColor.gray[200],
          }}
          contentFit="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            backgroundColor: DefaultColor.gray[200],
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon as={ImageOff} size={24} className="text-slate-400" />
        </View>
      )}
      <View className="flex-1 ml-3 justify-between">
        <View>
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-gray-800 flex-1 pr-2" numberOfLines={1}>{item.name}</Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{item.description}</Text>
          <Text className="text-[10px] text-orange-500 mt-1"> {t('masseurs_detail.sales_count_item_service', { count: item.bookings_count })}</Text>
        </View>
        {/* Giá và Nút */}
        <View className="flex-row justify-between items-end mt-2">
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xs text-primary-color-1 font-bold">{t('masseurs_detail.price_service_sub')}</Text>
            <Text className="text-lg text-primary-color-1 font-bold">{formatBalance(minPrice)}</Text>
            <Text className="text-xs text-primary-color-1 font-bold">{t('common.currency')}</Text>
          </View>

          <View className={cn('bg-primary-color-2 px-4 py-1.5 rounded-full', {
            'bg-primary-color-2': item.is_active,
            'bg-red-500': !item.is_active,
          })}>
            <Text className="text-white text-xs font-inter-bold">
              {item.is_active ? t('masseurs_detail.available') : t('masseurs_detail.unavailable')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
