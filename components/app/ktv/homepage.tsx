import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  User,
  ArrowRight,
  MapPinHouse,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock, Star,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import DefaultColor from '@/components/styles/color';
import dayjs from 'dayjs';
import { BookingItem } from '@/features/booking/types';
import { useTranslation } from 'react-i18next';
import { formatBalance } from '@/lib/utils';
import { DashboardKtvResponse } from '@/features/ktv/types';
import { ReviewItem } from '@/features/service/types';
import { TFunction } from 'i18next';
import { Image } from 'expo-image';

// Component: Thẻ lịch hẹn
interface AppointmentCardProps {
 item: BookingItem
}
export const AppointmentCard = ({ item }: AppointmentCardProps) => {
  const {t} = useTranslation();
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-row overflow-hidden">

      {/* 1. DẢI MÀU XANH BÊN TRÁI (THEO DESIGN) */}
      <View className="w-1.5 bg-[#2B7BBE]" />

      <View className="flex-1 p-4">
        {/* --- PHẦN TRÊN: THÔNG TIN CHÍNH --- */}
        <View className="flex-row">

          {/* Box Thời gian (Màu xanh nhạt) */}
          <View className="bg-blue-50 rounded-xl w-[72px] h-[72px] items-center justify-center mr-3">
            <Text className="text-[#2B7BBE] text-xl font-inter-bold">
              {dayjs(item.booking_time).format('HH:mm')}
            </Text>
          </View>

          {/* Thông tin chi tiết */}
          <View className="flex-1 justify-between py-0.5">
            <View className="flex-row justify-between items-start">
              <Text className="text-slate-900 text-lg font-inter-bold flex-1 mr-2" numberOfLines={1}>
                {item.service.name}
              </Text>
            </View>

            {/* Dòng thông tin Khách & Địa chỉ */}
            <View className="mt-1">
              <View className="flex-row items-center mb-1">
                <User size={14} color={DefaultColor.slate['500']} />
                <Text className="text-slate-500 text-sm ml-1.5 font-inter-medium">
                  {item.user.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MapPinHouse size={14} color={DefaultColor.slate['500']} />
                <Text className="text-slate-500 text-sm ml-1.5 font-inter-medium" numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- ĐƯỜNG KẺ NGANG MỜ --- */}
        <View className="h-[1px] bg-slate-100 my-3" />

        {/* --- PHẦN DƯỚI: THỜI LƯỢNG & NÚT BẤM --- */}
        <View className="flex-row justify-between items-center">
          <Text className="text-slate-400 text-sm font-inter-medium">
            {item.duration} {t('common.minute')}
          </Text>

          <View className="bg-primary-color-2 flex-row items-center px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-inter-bold mr-1.5">
              {t('common.view_detail')}
            </Text>
            <ArrowRight size={16} color="white" />
          </View>
        </View>
      </View>
    </View>
  );
};

// Component: Doanh thu hôm nay
export const TodayEarnings = ({ data }: { data: DashboardKtvResponse['data'] | undefined }) => {
  const {t} = useTranslation();
  const revenueChange = useMemo(() => {
    const today = data?.total_revenue_today || 0;
    const yesterday = data?.total_revenue_yesterday || 0;
    // Trường hợp cả 2 ngày đều bằng 0
    if (today === 0 && yesterday === 0) return { percent: 0, trend: 'neutral' };
    // Trường hợp hôm qua bằng 0 nhưng hôm nay có doanh thu (Tăng trưởng 100%)
    if (yesterday === 0) return { percent: 100, trend: 'up' };
    // Công thức: ((Hôm nay - Hôm qua) / Hôm qua) * 100
    const diff = today - yesterday;
    const percent = (diff / yesterday) * 100;
    return {
      // Làm tròn 1 chữ số thập phân
      percent: Math.round(percent * 10) / 10,
      trend: diff >= 0 ? 'up' : 'down'
    };
  }, [data?.total_revenue_today, data?.total_revenue_yesterday]);
  return (
    <>
      {/* Section: Doanh thu hôm nay */}
      <View className="bg-primary-color-2 p-6 rounded-2xl items-center mb-4 shadow-lg shadow-blue-200">
        <View className="gap-1 flex-row items-end">
          <Text className="text-white text-3xl font-inter-bold">
            {data?.total_revenue_today ? formatBalance(data?.total_revenue_today) : '0'}
          </Text>
          <Text className="text-white text-sm font-inter-bold">{t('common.currency')}</Text>
        </View>
        <View className="flex-row items-center bg-primary-color-1 px-3 py-1 rounded-full mt-3">
          {revenueChange.trend === 'up' ? <TrendingUp size={14} color="white" /> : <TrendingDown size={14} color="white" />}
          <Text className="text-white text-[10px] ml-1">{revenueChange.trend === 'up' ? '+' : '-'} {revenueChange.percent}% {t('ktv.index.earnings_change')}</Text>
        </View>
      </View>
      {/* Section: Số lượng đơn hoàn thành & đang chờ */}
      <View className="flex-row gap-x-4">
        <View className="flex-1 bg-white p-4 rounded-2xl items-center border border-slate-100">
          <CheckCircle2 size={24} color="#10b981" />
          <Text className="text-slate-400 text-xs mt-2">{t('ktv.index.completed')}</Text>
          <Text className="text-xl font-inter-bold text-slate-900">{data?.total_booking_completed_today || 0} {t('common.booking')}</Text>
        </View>
        <View className="flex-1 bg-white p-4 rounded-2xl items-center border border-slate-100">
          <Clock size={24} color="#f59e0b" />
          <Text className="text-slate-400 text-xs mt-2">{t('ktv.index.waiting')}</Text>
          <Text className="text-xl font-inter-bold text-slate-900">{data?.total_booking_pending_today || 0} {t('common.booking')}</Text>
        </View>
      </View>
    </>
  );
};

// Component: Đánh giá mới hôm nay
const ReviewItemCard = ({ item, t }: { item: ReviewItem, t: TFunction }) => {
  const [imageError, setImageError] = React.useState(false);
  return (
    <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
      {/* Header đánh giá */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-x-3">
          {(item.reviewer?.avatar && !item.hidden && !imageError) ? (
            <Image
              source={{ uri: item.reviewer.avatar }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 40,
                backgroundColor: DefaultColor.slate[200],
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
              <Text className="text-slate-500 font-inter-bold">
                {item.hidden ? "?" : item.reviewer?.name?.charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text className="text-slate-900 font-inter-bold">
              {item.hidden ? t('review.hidden_user') : item.reviewer?.name}
            </Text>
            <Text className="text-slate-400 text-[10px]">
              {dayjs(item.review_at).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>

        {/* Điểm số */}
        <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg">
          <Star size={12} color={DefaultColor.yellow[500]} fill={DefaultColor.yellow[500]} />
          <Text className="ml-1 text-amber-700 text-xs font-inter-bold">{item.rating}</Text>
        </View>
      </View>

      {/* Nội dung đánh giá */}
      <View className="bg-slate-50 p-4 rounded-2xl">
        {item.comment ? (
          <Text className="text-gray-600 text-sm leading-5">{item.comment}</Text>
        ) : (
          <Text className="text-gray-400 font-inter-italic text-sm">{t('review.no_comment')}</Text>
        )}
      </View>
    </View>
  );
}
export const ReviewNewToday = ({ data }: { data?: ReviewItem[] }) => {
  const {t} = useTranslation();
  return (
    <View>
      {(data && Array.isArray(data) && data.length > 0) ? (
        data.map((item, index) => (
          <ReviewItemCard key={item.id + index} item={item} t={t} />
        ))
      ) : (
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-row overflow-hidden">
          <Text className="text-center text-slate-400 text-sm">{t('ktv.index.no_review_new_today')}</Text>
        </View>
      )}
    </View>
  );
}
