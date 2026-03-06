import { BookingItem } from '@/features/booking/types';
import {  TouchableOpacity, View } from 'react-native';
import { Calendar, MapPin} from 'lucide-react-native';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn, formatBalance } from '@/lib/utils';
import dayjs from 'dayjs';
import { _BookingStatus,  getBookingStatusStyle } from '@/features/service/const';
import { useGetRoomChat } from '@/features/chat/hooks';
import Avatar from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

type Props = {
  item: BookingItem;
  openDetail: (item: BookingItem) => void;
  handleOpenCancelBooking: (id: string) => void;
  getRoomChat: ReturnType<typeof useGetRoomChat>;
  handleOpenReview: (id: string) => void;
}

export const BookingCard: FC<Props> = ({ item, openDetail, handleOpenCancelBooking, getRoomChat, handleOpenReview }) => {
  const { t } = useTranslation();


  const styleStatus = getBookingStatusStyle(item.status);

  return (
    <Card containerClassName="mb-4">
      {/* --- HÀNG 1: THÔNG TIN VÀ TRẠNG THÁI --- */}
      <View className="mb-4 flex-row justify-between items-start">
        {/* Bên Trái: Avatar + Tên KTV + Tên Dịch vụ */}
        <View className="flex-row flex-1 mr-3">
          <View className="mr-3">
            <Avatar
              source={item.ktv_user.avatar_url}
              size={48}
            />
          </View>
          <View className="flex-1 justify-center">
            <Text className="font-inter-bold text-base text-slate-800">
              {item.ktv_user.name}
            </Text>
            <Text className="text-xs text-slate-500 mt-1" numberOfLines={1}>
              {item.service.name}
            </Text>
          </View>
        </View>

        {/* Bên Phải: Badge Trạng thái + Giá tiền */}
        <View className="items-end">
          {/* Badge (Chuyển sang dùng Flex thay vì Absolute) */}
          <View
            className="rounded-full px-2.5 py-1 mb-1.5"
            style={{ backgroundColor: styleStatus.background }}
          >
            <Text
              className="font-inter-bold text-[10px]"
              style={{ color: styleStatus.text_color }}
            >
              {t(styleStatus.label)}
            </Text>
          </View>

          {/* Price */}
          <Text className="font-inter-bold text-base text-primary-color-1">
            {formatBalance(item.total_price)} {t('common.currency')}
          </Text>
        </View>

      </View>

      {/* --- HÀNG 2: THỜI GIAN & ĐỊA CHỈ --- */}
      <View className="mb-4 gap-2">
        {/* Date line */}
        <View className="flex-row items-center">
          <View className="w-1/2 flex-row items-center">
            <Icon as={Calendar} size={14} className="mr-1.5 text-slate-600" />
            <Text className="text-xs text-slate-600">
              {dayjs(item.booking_time).format('DD/MM/YYYY HH:mm')}
            </Text>
          </View>
        </View>

        {/* Address line */}
        <View className="flex-row items-start">
          <MapPin size={14} color="#64748b" className="mr-1.5 mt-0.5" />
          <Text className="flex-1 text-xs text-slate-600" numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>

      {/* --- HÀNG 3: ACTION BUTTONS --- */}
      <View className="flex-row gap-2">
        {/* Reviews Button */}
        {item.status === _BookingStatus.COMPLETED ? (
          <>
            <TouchableOpacity
              disabled={item.has_reviews}
              onPress={() => handleOpenReview(item.id)}
              className={cn(
                'flex-1 items-center justify-center rounded-lg bg-orange-500 py-2',
                item.has_reviews && 'cursor-not-allowed bg-slate-400'
              )}>
              <Text className="font-inter-bold text-xs text-white">
                {item.has_reviews ? t('booking.has_reviews') : t('booking.reviews')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Inbox Button */}
            <TouchableOpacity
              onPress={() => getRoomChat({ user_id: item.ktv_user.id })}
              className="flex-1 items-center justify-center rounded-lg bg-primary-color-2 py-2">
              <Text className="font-inter-bold text-xs text-white">{t('booking.inbox')}</Text>
            </TouchableOpacity>
          </>
        )}
        {/* Detail Button */}
        <TouchableOpacity
          onPress={() => openDetail(item)}
          className="flex-1 items-center justify-center rounded-lg bg-slate-100 py-2">
          <Text className="font-inter-bold text-xs text-slate-600">{t('booking.detail')}</Text>
        </TouchableOpacity>

        {/* cancel Button */}
        {item.status === _BookingStatus.CONFIRMED && (
          <TouchableOpacity
            onPress={() => handleOpenCancelBooking(item.id)}
            className="flex-1 items-center justify-center rounded-lg bg-slate-100 py-2">
            <Text className="font-inter-bold text-xs text-slate-600">{t('common.cancel')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

