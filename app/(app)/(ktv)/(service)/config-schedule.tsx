import { View,  ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfigSchedule } from '@/features/ktv/hooks';
import { useTranslation } from 'react-i18next';
import HeaderBack from '@/components/header-back';
import { Controller, useFieldArray } from 'react-hook-form';
import DefaultColor from '@/components/styles/color';
import { cn } from '@/lib/utils';
import {Text} from "@/components/ui/text";
import { DayScheduleCard } from '@/components/app/ktv';

// --- Config Dayjs ---
dayjs.extend(customParseFormat);

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
                        value ? 'bg-primary-color-2' : 'bg-gray-100',
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
                          value ? 'text-primary-color-2' : 'text-gray-400',
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
            {fields.map((fieldItem, index) => {
              return (
                <DayScheduleCard
                  key={fieldItem.id}
                  control={control}
                  index={index}
                  fieldItem={fieldItem}
                  errors={errors}
                />
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-xl bg-primary-color-2 py-4 shadow-md shadow-blue-200"
            disabled={loadingSave}
            onPress={onSubmit}
            activeOpacity={0.8}>
            <Text className="text-base font-inter-bold text-white">
              {t('config_schedule.save_changes')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WorkScheduleScreen;
