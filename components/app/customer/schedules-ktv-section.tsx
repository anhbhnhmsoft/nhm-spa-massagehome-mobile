import React, { FC, useMemo } from 'react';
import { cn, getCurrentDayKey } from '@/lib/utils';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Clock } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { _KTVConfigSchedulesLabel } from '@/features/ktv/consts';
import dayjs from 'dayjs';
import { KTVWorkSchedule } from '@/features/user/types';
import { TFunction } from 'i18next';

type Props = {
  t: TFunction;
  schedule?: KTVWorkSchedule;
}

export const SchedulesKtvSection: FC<Props> = ({ t, schedule }) => {
  const currentDayKey = getCurrentDayKey();

  // Sắp xếp lịch để hiển thị từ Thứ 2 -> CN
  const sortedSchedule = useMemo(() => {
    return [...(schedule?.schedule_time || [])].sort((a, b) => a.day_key - b.day_key);
  }, [schedule]);

  // Logic kiểm tra Online Realtime (Hỗ trợ ca xuyên đêm)
  const isOnlineRealtime = useMemo(() => {
    // Check 1: Nút tổng (Manual Switch)
    if (!schedule?.is_working || !schedule?.schedule_time) return false;

    // Lấy giờ hiện tại dưới dạng chuỗi HH:mm (VD: "02:30", "15:00")
    const nowTimeStr = dayjs().format('HH:mm');

    // Xác định day_key của ngày hôm qua
    const yesterdayKey = currentDayKey === 2 ? 8 : currentDayKey - 1;

    // Lấy config của hôm nay và hôm qua
    const todayConfig = schedule.schedule_time.find(item => item.day_key === currentDayKey);
    const yesterdayConfig = schedule.schedule_time.find(item => item.day_key === yesterdayKey);

    // --- 1. KIỂM TRA CA CỦA NGÀY HÔM NAY ---
    if (todayConfig && todayConfig.active) {
      const start = todayConfig.start_time;
      const end = todayConfig.end_time;

      if (start <= end) {
        // Ca bình thường (VD: 08:00 - 22:00)
        if (nowTimeStr >= start && nowTimeStr <= end) return true;
      } else {
        // Ca xuyên đêm của hôm nay (VD: 16:00 - 08:00 sáng mai)
        // Nếu hiện tại là buổi tối -> chỉ cần nowTimeStr >= start
        if (nowTimeStr >= start) return true;
      }
    }

    // --- 2. KIỂM TRA CA ĐÊM CỦA HÔM QUA (Vắt sang sáng nay) ---
    if (yesterdayConfig && yesterdayConfig.active) {
      const start = yesterdayConfig.start_time;
      const end = yesterdayConfig.end_time;

      // Nếu hôm qua là ca xuyên đêm (start > end)
      // Và bây giờ đang là buổi sáng sớm (nowTimeStr <= end)
      if (start > end && nowTimeStr <= end) {
        return true;
      }
    }

    return false;
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
          // Xác định xem ca này có phải là ca xuyên đêm không
          const isCrossDay = item.start_time > item.end_time;

          return (
            <View
              key={item.day_key}
              className={cn(`flex-row items-center justify-between py-2`,
                index !== sortedSchedule.length - 1 ? 'border-b border-dashed border-gray-200' : ''
              )}>
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
              <View className="items-end">
                {item.active ? (
                  <>
                    <Text
                      className={cn(
                        'text-sm',
                        isToday ? 'font-inter-bold text-primary-color-2' : 'text-gray-700',
                      )}>
                      {item.start_time} - {item.end_time}
                    </Text>
                    {/* Thêm text chú thích nếu là ca xuyên đêm */}
                    {isCrossDay && (
                      <Text className="text-[10px] text-orange-500 mt-0.5 font-inter-medium">
                        ({t('config_schedule.is_cross_day')})
                      </Text>
                    )}
                  </>
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