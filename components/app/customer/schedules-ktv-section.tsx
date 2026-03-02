import React, { FC, useMemo } from 'react';
import { cn, getCurrentDayKey } from '@/lib/utils';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Clock } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { _KTVConfigSchedulesLabel } from '@/features/ktv/consts';
import dayjs from 'dayjs';
import { KTVDetail, KTVWorkSchedule } from '@/features/user/types';
import { TFunction } from 'i18next';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);


type Props = {
  t: TFunction;
  schedule?: KTVWorkSchedule;
}

export const SchedulesKtvSection:FC<Props> = ({ t, schedule }) => {

  const currentDayKey = getCurrentDayKey();
  // Sắp xếp lịch để hiển thị từ Thứ 2 -> CN (nếu data trả về lộn xộn)
  const sortedSchedule = useMemo(() => {
    return [...(schedule?.schedule_time || [])].sort((a, b) => a.day_key - b.day_key);
  }, [schedule]);

  const isOnlineRealtime = useMemo(() => {
    // Check 1: Nút tổng (Manual Switch)
    if (!schedule?.is_working) return false;

    // Tìm cấu hình của ngày hôm nay
    const todayConfig = schedule?.schedule_time?.find(
      (item: any) => item.day_key === currentDayKey
    );
    // Check 2: Hôm nay có lịch không?
    if (!todayConfig || !todayConfig.active) return false;

    // Check 3: So sánh giờ hiện tại
    const now = dayjs();
    const start = dayjs(todayConfig.start_time, 'HH:mm'); // Tạo object giờ hôm nay
    const end = dayjs(todayConfig.end_time, 'HH:mm');

    // Nếu giờ hiện tại nằm giữa Start và End
    // Lưu ý: '[]' nghĩa là bao gồm cả phút bắt đầu và kết thúc
    return now.isBetween(start, end, null, '[]');
  }, [schedule, currentDayKey]);

  if (!schedule) return null;

  return (
    <View className="mt-2 bg-white px-4 py-4">
      {/* Header Section */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          {/* Icon Đồng hồ */}
          <Icon as={Clock} size={20} className="text-primary-color-2" />
          <Text className="font-inter-bold text-base text-gray-800">
            {t('masseurs_detail.working_hours')}
          </Text>
        </View>

        {/* Badge Trạng thái hiện tại */}
        <View
          className={cn(
            'rounded-md px-2 py-1',
            isOnlineRealtime ? 'bg-green-100' : 'bg-gray-100',
          )}>
          <Text
            className={cn(
              'text-xs',
              isOnlineRealtime ? 'font-inter-bold text-green-700' : 'text-gray-500',
            )}>
            {isOnlineRealtime ? t('common.online') : t('common.offline')}
          </Text>
        </View>
      </View>

      {/* List Lịch */}
      <View className="rounded-xl bg-gray-50 p-3">
        {sortedSchedule.map((item, index) => {
          const isToday = item.day_key === currentDayKey;

          return (
            <View
              key={item.day_key}
              className={`flex-row items-center justify-between py-2 ${
                index !== sortedSchedule.length - 1 ? 'border-b border-dashed border-gray-200' : ''
              }`}>
              {/* Cột Thứ */}
              <View className="flex-row items-center gap-2">
                {isToday && <View className="h-1.5 w-1.5 rounded-full bg-primary-color-2" />}
                <Text
                  className={cn(
                    'text-sm',
                    isToday ? 'font-inter-bold text-primary-color-2' : 'text-gray-700',
                  )}>
                  {t(_KTVConfigSchedulesLabel[item.day_key])}
                </Text>
              </View>

              {/* Cột Giờ */}
              <View>
                {item.active ? (
                  <Text
                    className={cn(
                      'text-sm',
                      isToday ? 'font-inter-bold text-primary-color-2' : 'text-gray-700',
                    )}>
                    {item.start_time} - {item.end_time}
                  </Text>
                ) : (
                  <Text className="font-inter-italic text-sm text-gray-400">
                    {t('common.day_off')}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}