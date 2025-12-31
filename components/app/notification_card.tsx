import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NotificationStatus, NotificationType } from '@/features/notification/const';
import { Bell, CalendarDays, CreditCard } from 'lucide-react-native';
import { Notification } from '@/features/notification/type';
import dayjs from 'dayjs';

// Hàm lấy icon và màu sắc dựa trên loại notification
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.PAYMENT_COMPLETE:
      return {
        icon: <CreditCard size={20} color="#044984" />,
        bgColor: 'bg-primary-color-3/10',
      };
    case NotificationType.NEW_BOOKING_REQUEST:
    case NotificationType.BOOKING_SUCCESS:
      return {
        icon: <CalendarDays size={20} color="#2B7BBE" />,
        bgColor: 'bg-primary-color-2/10',
      };
    default:
      return {
        icon: <Bell size={20} color="#45556C" />,
        bgColor: 'bg-muted',
      };
  }
};

export default function NotificatonItem({
  item,
  onRead,
}: {
  item: Notification;
  onRead: (id: string) => void;
}) {
  const config = getNotificationIcon(item.type);
  const isUnread = item.status !== NotificationStatus.READ;

  return (
    <Pressable
      className={`flex-row border-hairline border-b border-border p-4 ${isUnread ? 'bg-primary-color-2/5' : 'bg-white'}`}
      onPress={() => onRead(item.id.toString())}>
      {/* Icon Left */}
      <View className={`h-12 w-12 items-center justify-center rounded-full ${config.bgColor}`}>
        {config.icon}
      </View>

      {/* Content */}
      <View className="ml-3 flex-1 justify-center">
        <View className="flex-row items-start justify-between">
          <Text
            className={`flex-1 pr-2 text-[15px] ${isUnread ? 'font-inter-semibold text-base-color-1' : 'font-inter-medium text-primary-color-3'}`}
            numberOfLines={1}>
            {item.title}
          </Text>
          {isUnread && <View className="mt-2 h-2 w-2 rounded-full bg-primary-color-2" />}
        </View>

        <Text className="mt-1 font-inter-regular text-sm text-primary-color-3" numberOfLines={2}>
          {item.description}
        </Text>

        <Text className="mt-2 font-inter-regular text-[11px] text-primary-color-4">
          {dayjs(item.created_at).locale('vi').format('DD/MM/YYYY • HH:mm')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({});
