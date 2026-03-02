// Đơn hàng trong profile tab
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { useProfileCustomer } from '@/features/profile/hooks';
import {  ClipboardList, Heart, CalendarOff, Wallet } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';
import { Text } from '@/components/ui/text';
import { DashboardBookingStatus } from '@/features/profile/types';
import { Card } from '@/components/ui/card';

type OrderBoardProfileProps = {
  dashboardData: ReturnType<typeof useProfileCustomer>['dashboardData'];
};
const ORDER_MENU_ITEMS = [
  {
    status: _BookingStatus.PENDING,
    icon: Wallet,
    label: _BookingStatusMap[_BookingStatus.PENDING],
  },
  {
    status: _BookingStatus.CONFIRMED,
    icon: ClipboardList,
    label: _BookingStatusMap[_BookingStatus.CONFIRMED],
  },
  {
    status: _BookingStatus.ONGOING,
    icon: Heart,
    label: _BookingStatusMap[_BookingStatus.ONGOING],
  },
  {
    status: _BookingStatus.WAITING_CANCEL,
    icon: CalendarOff,
    label: _BookingStatusMap[_BookingStatus.WAITING_CANCEL],
  },
];
export const OrderBoardProfile = ({ dashboardData }: OrderBoardProfileProps) => {
  const { t } = useTranslation();
  return (
    <Card
      containerClassName="mb-4"
      title={t('profile.my_order')}
      headerRightText={t('common.see_more')}
      onHeaderRightPress={() => router.push('/(app)/(customer)/(profile)/orders')}
      className={"flex-row justify-between gap-2"}
    >
      {ORDER_MENU_ITEMS.map((item) => {
        const count = dashboardData?.booking_count?.[item.status as DashboardBookingStatus] || 0;
        return (
          <TouchableOpacity
            onPress={useSingleTouch(() =>
              router.push({
                pathname: '/(app)/(customer)/(profile)/orders',
                params: {
                  status: item.status,
                },
              }),
            )}
            key={item.status}
            className="relative flex-1 items-center">
            <View className="mb-2">
              <Icon as={item.icon} size={24} className="text-gray-500" />
            </View>
            <Text className="text-center text-[10px] text-gray-500">
              {t(_BookingStatusMap[item.status])}
            </Text>
            {/* Badge Count */}
            {count > 0 && (
              <View className="absolute -top-2 right-0 items-center justify-center rounded-full bg-orange-500 px-1">
                <Text className="font-inter-bold text-[10px] text-white">
                  {count > 99 ? '99+' : count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </Card>
  );
};