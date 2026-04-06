import { useWatch, Control, Controller, FieldArrayWithId, FieldErrors } from 'react-hook-form';
import { memo } from 'react';
import { EditConfigScheduleRequest } from '@/features/ktv/types';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Switch, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { cn, parseTime } from '@/lib/utils';
import DefaultColor from '@/components/styles/color';
import { _KTVConfigSchedulesLabel } from '@/features/ktv/consts';
import { FormTimePicker } from '@/components/ui/form-time-picker';
import { formatTime } from '@/lib/utils';
import {Text} from "@/components/ui/text";

// Định nghĩa props cho Component con
interface DayScheduleCardProps {
  control: Control<EditConfigScheduleRequest>;
  index: number;
  fieldItem:  FieldArrayWithId<EditConfigScheduleRequest, 'working_schedule', 'id'>; // Thay bằng type của field item từ useFieldArray
  errors:  FieldErrors<EditConfigScheduleRequest>;
}

export const DayScheduleCard = memo(({ control, index, fieldItem, errors }: DayScheduleCardProps) => {
  const { t } = useTranslation();

  // useWatch CHỈ re-render đúng component con này khi dữ liệu của nó thay đổi
  const currentDay = useWatch({
    control,
    name: `working_schedule.${index}`,
  });

  const isActive = currentDay?.active;
  const startTimeStr = currentDay?.start_time || '08:00';
  const endTimeStr = currentDay?.end_time || '16:00';

  // Logic chỉ chạy cho component này
  const isCrossDay = dayjs(endTimeStr, 'HH:mm').isBefore(dayjs(startTimeStr, 'HH:mm'));

  return (
    <View
      className={cn(
        'mb-4 rounded-2xl border bg-white p-4 shadow-sm',
        isActive ? 'border-primary-color-2/20' : 'border-gray-100',
      )}>

      {/* Row 1: Day + Switch */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className={cn('rounded-full p-2', isActive ? 'bg-blue-50' : 'bg-gray-50')}>
            <Calendar size={18} color={isActive ? DefaultColor.blue[500] : '#9ca3af'} />
          </View>
          <Text className={cn('font-inter-semibold text-base', isActive ? 'text-gray-800' : 'text-gray-400')}>
            {t(_KTVConfigSchedulesLabel[fieldItem.day_key])}
          </Text>
        </View>

        <Controller
          control={control}
          name={`working_schedule.${index}.active`}
          render={({ field: { onChange, value } }) => (
            <Switch
              trackColor={{ false: DefaultColor.gray[200], true: DefaultColor.base['primary-color-2'] }}
              thumbColor={DefaultColor.white}
              onValueChange={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Row 2: Khung chọn giờ */}
      {isActive ? (
        <>
          {isCrossDay && (
            <View className="items-end">
              <Text className="text-[11px] font-inter-semibold text-orange-500">
                {t('config_schedule.is_cross_day')}
              </Text>
            </View>
          )}
          <View className="mt-4 flex-row items-center gap-3">
            <View className="flex-1">
              <Controller
                control={control}
                name={`working_schedule.${index}.start_time`}
                render={({ field: { onChange, value } }) => (
                  <FormTimePicker
                    label={t('config_schedule.start_time')}
                    required={true}
                    value={parseTime(value || '08:00')}
                    onChange={(date) => onChange(formatTime(date))}
                    error={errors.working_schedule?.[index]?.start_time?.message}
                  />
                )}
              />
            </View>

            <View className="justify-center pt-5">
              <Text className="font-bold text-gray-300">→</Text>
            </View>

            <View className="flex-1 relative">
              <Controller
                control={control}
                name={`working_schedule.${index}.end_time`}
                render={({ field: { onChange, value } }) => (
                  <FormTimePicker
                    label={t('config_schedule.end_time')}
                    required={true}
                    value={parseTime(value || '16:00')}
                    onChange={(date) => onChange(formatTime(date))}
                    error={errors.working_schedule?.[index]?.end_time?.message}
                  />
                )}
              />
            </View>
          </View>
        </>
      ) : (
        <View className="mt-4 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-3">
          <Text className="font-inter-medium text-sm text-gray-400">
            {t('config_schedule.off_day')}
          </Text>
        </View>
      )}
    </View>
  );
});

