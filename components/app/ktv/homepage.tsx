import React, { useEffect, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Hourglass,
  MapPinHouse,
  Star,
  TrendingDown,
  TrendingUp,
  User,
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
import { router } from 'expo-router';
import { useSetBookingStart } from '@/features/ktv/hooks/use-booking';
import { _BookingStatus } from '@/features/service/const';
import { useBookingStore } from '@/lib/ktv/useBookingStore';

// Component: Thẻ lịch hẹn
interface AppointmentCardProps {
  item: BookingItem;
}
export const AppointmentCard = ({ item }: AppointmentCardProps) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/(app)/(service-ktv)/booking-details',
          params: { id: item.id },
        });
      }}
      className="flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* 1. DẢI MÀU XANH BÊN TRÁI (THEO DESIGN) */}
      <View className="w-1.5 bg-[#2B7BBE]" />

      <View className="flex-1 p-4">
        {/* --- PHẦN TRÊN: THÔNG TIN CHÍNH --- */}
        <View className="flex-row">
          {/* Box Thời gian (Màu xanh nhạt) */}
          <View className="mr-3 h-[72px] w-[72px] items-center justify-center rounded-xl bg-blue-50">
            <Text className="font-inter-bold text-xl text-[#2B7BBE]">
              {dayjs(item.booking_time).format('HH:mm')}
            </Text>
          </View>

          {/* Thông tin chi tiết */}
          <View className="flex-1 justify-between py-0.5">
            <View className="flex-row items-start justify-between">
              <Text
                className="mr-2 flex-1 font-inter-bold text-lg text-slate-900"
                numberOfLines={1}>
                {item.service.name}
              </Text>
            </View>

            {/* Dòng thông tin Khách & Địa chỉ */}
            <View className="mt-1">
              <View className="mb-1 flex-row items-center">
                <User size={14} color={DefaultColor.slate['500']} />
                <Text className="ml-1.5 font-inter-medium text-sm text-slate-500">
                  {item.user.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MapPinHouse size={14} color={DefaultColor.slate['500']} />
                <Text className="ml-1.5 font-inter-medium text-sm text-slate-500" numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- ĐƯỜNG KẺ NGANG MỜ --- */}
        <View className="my-3 h-[1px] bg-slate-100" />

        {/* --- PHẦN DƯỚI: THỜI LƯỢNG & NÚT BẤM --- */}
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-medium text-sm text-slate-400">
            {item.duration} {t('common.minute')}
          </Text>

          <View className="flex-row items-center rounded-full bg-primary-color-2 px-4 py-2">
            <Text className="mr-1.5 font-inter-bold text-sm text-white">
              {t('common.view_detail')}
            </Text>
            <ArrowRight size={16} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Component: Doanh thu hôm nay
export const TodayEarnings = ({ data }: { data: DashboardKtvResponse['data'] | undefined }) => {
  const { t } = useTranslation();
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
      trend: diff >= 0 ? 'up' : 'down',
    };
  }, [data?.total_revenue_today, data?.total_revenue_yesterday]);
  return (
    <>
      {/* Section: Doanh thu hôm nay */}
      <View className="mb-4 items-center rounded-2xl bg-primary-color-2 p-6 shadow-lg shadow-blue-200">
        <View className="flex-row items-end gap-1">
          <Text className="font-inter-bold text-3xl text-white">
            {data?.total_revenue_today ? formatBalance(data?.total_revenue_today) : '0'}
          </Text>
          <Text className="font-inter-bold text-sm text-white">{t('common.currency')}</Text>
        </View>
        <View className="mt-3 flex-row items-center rounded-full bg-primary-color-1 px-3 py-1">
          {revenueChange.trend === 'up' ? (
            <TrendingUp size={14} color="white" />
          ) : (
            <TrendingDown size={14} color="white" />
          )}
          <Text className="ml-1 text-[10px] text-white">
            {revenueChange.trend === 'up' ? '+' : '-'} {revenueChange.percent}%{' '}
            {t('ktv.index.earnings_change')}
          </Text>
        </View>
      </View>
      {/* Section: Số lượng đơn hoàn thành & đang chờ */}
      <View className="flex-row gap-x-4">
        <View className="flex-1 items-center rounded-2xl border border-slate-100 bg-white p-4">
          <CheckCircle2 size={24} color="#10b981" />
          <Text className="mt-2 text-xs text-slate-400">{t('ktv.index.completed')}</Text>
          <Text className="font-inter-bold text-xl text-slate-900">
            {data?.total_booking_completed_today || 0} {t('common.booking')}
          </Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-slate-100 bg-white p-4">
          <Clock size={24} color="#f59e0b" />
          <Text className="mt-2 text-xs text-slate-400">{t('ktv.index.waiting')}</Text>
          <Text className="font-inter-bold text-xl text-slate-900">
            {data?.total_booking_pending_today || 0} {t('common.booking')}
          </Text>
        </View>
      </View>
    </>
  );
};

// Component: Đánh giá mới hôm nay
const ReviewItemCard = ({ item, t }: { item: ReviewItem; t: TFunction }) => {
  const [imageError, setImageError] = React.useState(false);
  return (
    <View className="mb-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Header đánh giá */}
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-row items-center gap-x-3">
          {item.reviewer?.avatar && !item.hidden && !imageError ? (
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
            <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Text className="font-inter-bold text-slate-500">
                {item.hidden ? '?' : item.reviewer?.name?.charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text className="font-inter-bold text-slate-900">
              {item.hidden ? t('review.hidden_user') : item.reviewer?.name}
            </Text>
            <Text className="text-[10px] text-slate-400">
              {dayjs(item.review_at).format('DD/MM/YYYY')}
            </Text>
          </View>
        </View>

        {/* Điểm số */}
        <View className="flex-row items-center rounded-lg bg-amber-50 px-2 py-1">
          <Star size={12} color={DefaultColor.yellow[500]} fill={DefaultColor.yellow[500]} />
          <Text className="ml-1 font-inter-bold text-xs text-amber-700">{item.rating}</Text>
        </View>
      </View>

      {/* Nội dung đánh giá */}
      <View className="rounded-2xl bg-slate-50 p-4">
        {item.comment ? (
          <Text className="text-sm leading-5 text-gray-600">{item.comment}</Text>
        ) : (
          <Text className="font-inter-italic text-sm text-gray-400">{t('review.no_comment')}</Text>
        )}
      </View>
    </View>
  );
};

export const ReviewNewToday = ({ data }: { data?: ReviewItem[] }) => {
  const { t } = useTranslation();
  return (
    <View>
      {data && Array.isArray(data) && data.length > 0 ? (
        data.map((item, index) => <ReviewItemCard key={item.id + index} item={item} t={t} />)
      ) : (
        <View className="flex-row overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <Text className="text-center text-sm text-slate-400">
            {t('ktv.index.no_review_new_today')}
          </Text>
        </View>
      )}
    </View>
  );
};

// Component : dịch vụ đang thực hiện
interface ServiceOngoingItemCard {
  item: BookingItem;
}
const PRIMARY_BLUE = '#2B7BBE';
export const ServiceOngoingItemCard = ({ item }: ServiceOngoingItemCard) => {
  const { t } = useTranslation();

  const setBookingStart = useSetBookingStart();

  const timeLeft = useBookingStore((state) => state.time_left);
  useEffect(() => {
    if (item.status === _BookingStatus.ONGOING && item.start_time) {
      setBookingStart({
        booking_id: item.id,
        start_time: item.start_time,
        duration: item.duration,
      });
    }
  }, [item]);

  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: '/(app)/(service-ktv)/booking-details',
          params: { id: item.id },
        });
      }}
      className="flex-row overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
      {/* 1. DẢI MÀU XANH BÊN TRÁI */}
      <View className="w-1.5 bg-primary-color-2" />

      <View className="flex-1 p-5">
        {/* --- PHẦN TRÊN: TÊN DỊCH VỤ & BADGE TỔNG THỜI GIAN --- */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-inter-bold text-xl text-primary-color-2" numberOfLines={1}>
              {item.service.name}
            </Text>
            {/* Dòng Khách hàng */}
            <View className="mt-2 flex-row items-center">
              <User
                size={18}
                color={DefaultColor.base['primary-color-2']}
                fill={DefaultColor.base['primary-color-2']}
                fillOpacity={0.2}
              />
              <Text className="ml-2 font-inter-medium text-base text-slate-500">
                <Text className="font-inter-bold text-slate-900">{item.user.name}</Text>
              </Text>
            </View>
          </View>

          {/* Badge TỔNG (Góc trên bên phải) */}
          <View className="items-center rounded-2xl bg-blue-50 px-3 py-2">
            <Text className="font-inter-bold text-[10px] text-[#2B7BBE] opacity-60">
              {t('common.total')}
            </Text>
            <Text className="font-inter-bold text-xs text-[#2B7BBE]">
              {item.duration} {t('common.minute')}
            </Text>
          </View>
        </View>

        {/* --- PHẦN DƯỚI: 2 BOX THỜI GIAN --- */}
        <View className="mt-5 flex-row gap-3">
          {/* Box Bắt đầu */}
          <View className="flex-1 flex-row items-center rounded-2xl bg-slate-50 p-3">
            <Clock size={20} color={PRIMARY_BLUE} />
            <View className="ml-3">
              <Text className="font-inter-bold text-[10px] text-slate-400">
                {t('booking.start')}
                {' :'}
              </Text>
              <Text className="font-inter-bold text-lg text-slate-900">
                {dayjs(item.start_time).format('HH:mm')}
              </Text>
            </View>
          </View>

          {/* Box Còn lại */}
          <View className="flex-1 flex-row items-center rounded-2xl bg-blue-50/50 p-3">
            <Hourglass size={20} color={PRIMARY_BLUE} />

            <View className="ml-3 items-baseline">
              <Text className="font-inter-bold text-[10px] text-slate-400">
                {t('common.remaining_usage')}
                {' :'}
              </Text>
              <Text className="font-inter-bold text-base text-slate-900">
                {timeLeft?.hours}:{timeLeft?.minutes}:{timeLeft?.seconds}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
