import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import DateTimePickerInput from '@/components/date-time-input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfigSchedule } from '@/features/ktv/hooks';
import { useTranslation } from 'react-i18next';
import HeaderBack from '@/components/header-back';
import { Controller, useFieldArray } from 'react-hook-form';
import DefaultColor from '@/components/styles/color';
import { cn } from '@/lib/utils';
import { _KTVConfigSchedulesLabel } from '@/features/ktv/consts';
import { useEffect } from 'react';

// --- Config Dayjs ---
dayjs.extend(customParseFormat);

// Date Object để truyền vào DateTimePicker
const parseTime = (timeStr: string): Date => {
  // Nếu string rỗng hoặc null, trả về giờ hiện tại
  if (!timeStr) return new Date();
  // Parse theo định dạng HH:mm, dayjs tự lấy ngày hiện tại
  return dayjs(timeStr, 'HH:mm').toDate();
};

// Chuyển Date Object -> để lưu vào State
const formatTime = (date: Date): string => {
  return dayjs(date).format('HH:mm');
};

const WorkScheduleScreen = () => {
  const { t } = useTranslation();
  const { query, form, onSubmit, loadingSave } = useConfigSchedule();

  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = form;

  // Setup Field Array (Quản lý danh sách lịch)
  const { fields } = useFieldArray({
    control,
    name: 'working_schedule',
  });

  if (query.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="font-inter-bold text-lg text-gray-500">
          {t('config_schedule.loading')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <HeaderBack title={'config_schedule.title'} />
      <View className="flex-1">
        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          {/* Card Trạng Thái Hôm Nay */}
          <View className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <Controller
              control={control}
              name="is_working"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={cn(
                        'rounded-full p-2',
                        value ? 'bg-primary-color-2' : 'bg-gray-100'
                      )}>
                      <Clock
                        size={24}
                        color={value ? DefaultColor.white : DefaultColor.gray[400]}
                      />
                    </View>
                    <View>
                      <Text className="font-inter-semibold text-base text-gray-800">
                        {t('config_schedule.status_today')}
                      </Text>
                      <Text
                        className={cn(
                          'text-xs font-medium',
                          value ? 'text-primary-color-2' : 'text-gray-400'
                        )}>
                        {value ? t('config_schedule.working') : t('config_schedule.off')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    trackColor={{
                      false: DefaultColor.blue[100],
                      true: DefaultColor.base['primary-color-2'],
                    }}
                    thumbColor={value ? DefaultColor.blue[500] : DefaultColor.blue[200]}
                    onValueChange={onChange}
                    value={value}
                  />
                </View>
              )}
            />
          </View>

          {/* List Lịch Cố Định */}
          <Text className="mb-3 px-1 font-inter-bold text-base text-gray-800">
            {t('config_schedule.working_schedule')}
          </Text>

          <View className="pb-24">
            <View className="pb-24">
              {fields.map((fieldItem, index) => {
                const isActive = watch(`working_schedule.${index}.active`);

                return (
                  <View
                    key={fieldItem.id}
                    className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    {/* Row 1: Day + Switch */}
                    <View className="mb-1 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Calendar size={18} color="#6b7280" />
                        <Text className="font-inter-semibold text-base text-gray-700">
                          {t(_KTVConfigSchedulesLabel[fieldItem.day_key])}
                        </Text>
                      </View>

                      <Controller
                        control={control}
                        name={`working_schedule.${index}.active`}
                        render={({ field: { onChange, value } }) => (
                          <Switch
                            trackColor={{
                              false: DefaultColor.blue[100],
                              true: DefaultColor.base['primary-color-2'],
                            }}
                            thumbColor={value ? DefaultColor.blue[500] : DefaultColor.blue[200]}
                            onValueChange={onChange}
                            value={value}
                          />
                        )}
                      />
                    </View>

                    {/* Row 2: Giờ */}
                    <View className="relative mt-2 flex-row items-center gap-3">
                      {/* Start Time Controller */}
                      <View className={`flex-1 ${!isActive ? 'absolute opacity-0' : ''}`}>
                        <Text className="mb-1 ml-1 text-xs text-gray-400">
                          {t('config_schedule.start_time')}
                        </Text>
                        <Controller
                          control={control}
                          name={`working_schedule.${index}.start_time`}
                          defaultValue="08:00" // mặc định
                          render={({ field: { onChange, value } }) => (
                            <DateTimePickerInput
                              mode="time"
                              value={parseTime(value || '08:00')}
                              onChange={(date) => onChange(formatTime(date))}
                            />
                          )}
                        />
                      </View>

                      <View className="justify-center pb-4">
                        <Text className="font-bold text-gray-400">-</Text>
                      </View>

                      {/* End Time Controller */}
                      <View className={`flex-1 ${!isActive ? 'absolute opacity-0' : ''}`}>
                        <Text className="mb-1 ml-1 text-xs text-gray-400">
                          {t('config_schedule.end_time')}
                        </Text>
                        <Controller
                          control={control}
                          name={`working_schedule.${index}.end_time`}
                          defaultValue="16:00"
                          render={({ field: { onChange, value } }) => (
                            <DateTimePickerInput
                              mode="time"
                              value={parseTime(value || '18:00')}
                              onChange={(date) => onChange(formatTime(date))}
                            />
                          )}
                        />
                      </View>

                      {/* Nếu inactive, hiển thị text "Off" */}
                      {!isActive && (
                        <View className="absolute ml-1 mt-2">
                          <Text className="font-inter-italic text-sm text-gray-400">
                            {t('config_schedule.off')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl bg-primary-color-2 py-4 shadow-md shadow-blue-200"
            disabled={loadingSave}
            onPress={onSubmit}
            activeOpacity={0.8}>
            <Text className="text-base font-bold text-white">
              {t('config_schedule.save_changes')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WorkScheduleScreen;
