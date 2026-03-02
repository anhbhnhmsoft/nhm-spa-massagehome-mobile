import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Star } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { _GenderMap } from '@/features/auth/const';
import dayjs from 'dayjs';
import { calculatePriceDistance, formatBalance } from '@/lib/utils';
import React, { FC, useMemo, useState } from 'react';
import { TFunction } from 'i18next';
import { KTVDetail } from '@/features/user/types';
import useCalculateDistance from '@/features/app/hooks/use-calculate-distance';
import Avatar from '@/components/ui/avatar';

type Props = {
  t: TFunction;
  detail: KTVDetail;
}

export const InfoKtvSection:FC<Props> = ({t, detail}) => {

  // State để theo dõi trạng thái mở rộng/collapse của bio
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const calculateDistance = useCalculateDistance();

  // Tính toán khoảng cách
  const distance = useMemo(() => {
    if (detail && detail.location.longitude && detail.location.latitude) {
      return calculateDistance(
        detail.location.latitude,
        detail.location.longitude
      );
    }
    return null;
  }, [detail]);

  // Tính giá tiền di chuyển tạm thời
  const priceTransportation = useMemo(() => {
    if (detail && distance) {
      return calculatePriceDistance(detail.price_transportation, distance);
    }
    return null;
  }, [detail, distance]);

  return (
    <View
      style={{ marginTop: -24 }}
      className="rounded-t-3xl bg-white px-4 pb-6 pt-4 shadow-lg border border-slate-100">
      {/* Avatar & Name */}
      <View className="mt-2 flex-row items-center gap-4">
        <Avatar source={detail.profile.avatar_url} />
        <View>
          <Text className="font-inter-bold text-2xl text-gray-800">{detail.name}</Text>
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
          <Text className="font-inter-bold text-xs text-orange-500">
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
          {detail.review_application.bio &&
            detail.review_application.bio.length > 100 && (
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

      {/* Stats Grid */}
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
          <Text className="font-inter-medium">
            {t(_GenderMap[detail.profile.gender])}
          </Text>
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
          <Text className="text-xs text-gray-400">{t('masseurs_detail.price_transportation')}</Text>
          <Text className="font-inter-medium">
            {priceTransportation ? formatBalance(priceTransportation) : '-'} {t('common.currency')}
          </Text>
        </View>
      </View>
    </View>
  )
}