import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react-native';
// hoặc gộp className kiểu cn helper

type DateTimePickerInputProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
  error?: string;
};

export default function DateTimePickerInput({
  label,
  value,
  onChange,
  mode = 'date',
  error,
}: DateTimePickerInputProps) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const displayFormat = mode === 'date' ? 'DD/MM/YYYY' : 'HH:mm';
  const icon = mode === 'date' ? '📅' : '⏰';

  const handlePressInput = () => {
    setTempDate(value);
    setShow(true);
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selectedDate) onChange(selectedDate);
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmIOSDate = () => {
    onChange(tempDate);
    setShow(false);
  };

  return (
    <View className="mb-3">
      <Text className="mb-1.5 ml-1 text-sm font-medium text-gray-500">{label}</Text>

      <Pressable
        onPress={handlePressInput}
        className={cn(
          'flex-row items-center rounded-xl border px-4 py-3',
          error ? 'border-red-500' : 'border-gray-200 bg-white'
        )}>
        <Text className="flex-1 text-base text-gray-900">{dayjs(value).format(displayFormat)}</Text>
        <Calendar size={16} color={'#9CA3AF'} />
      </Pressable>

      {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}

      {/* ANDROID */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}

      {/* IOS */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={() => setShow(false)}>
          <View className="flex-1 justify-end bg-black/10">
            <View className="rounded-t-2xl bg-white pb-6">
              {/* Header Modal */}
              <View className="flex-row items-center justify-between rounded-t-2xl border-b border-slate-200 bg-slate-50 p-4">
                <Pressable onPress={() => setShow(false)} className="p-2">
                  <Text className="font-medium text-slate-500">{t('common.cancel')}</Text>
                </Pressable>
                <Text className="font-semibold uppercase text-slate-700">
                  {mode === 'date' ? t('common.select_date') : t('common.select_time')}
                </Text>
                <Pressable onPress={confirmIOSDate} className="p-2">
                  <Text className="text-lg font-bold text-primary-color-1">
                    {t('common.select')}
                  </Text>
                </Pressable>
              </View>

              <View className="items-center">
                <DateTimePicker
                  value={tempDate}
                  mode={mode}
                  is24Hour={true}
                  display="spinner"
                  onChange={handleChange}
                  textColor="black"
                  themeVariant="light"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
