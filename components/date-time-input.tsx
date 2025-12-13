import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';


type DateTimePickerInputProps = {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time';
}

export default function DateTimePickerInput({
                                              value,
                                              onChange,
                                              mode = 'date'
                                            }: DateTimePickerInputProps) {
  const {t} = useTranslation();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  // Định dạng hiển thị mặc định
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
    <View className="mb-4">
      {/* Input Box */}
      <Pressable
        onPress={handlePressInput}
        className="w-full border border-slate-300 rounded-2xl p-4 flex-row justify-between items-center active:bg-slate-100 active:border-blue-500 transition-colors"
      >
        <Text className="text-slate-800 text-base font-medium">
          {dayjs(value).format(displayFormat)}
        </Text>
        <Text className="text-slate-400">{icon}</Text>
      </Pressable>

      {/* --- LOGIC HIỂN THỊ PICKER --- */}

      {/* ANDROID */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={(e, selectedDate) => {
            handleChange(e, selectedDate);
          }}
        />
      )}

      {/* IOS: MODAL BOTTOM SHEET */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={() => setShow(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-2xl pb-6">
              {/* Header Modal */}
              <View className="flex-row justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
                <Pressable onPress={() => setShow(false)} className="p-2">
                  <Text className="text-slate-500 font-medium">{t('common.cancel')}</Text>
                </Pressable>
                <Text className="font-semibold text-slate-700 uppercase">
                  {mode === 'date' ? 'Chọn Ngày' : 'Chọn Giờ'}
                </Text>
                <Pressable onPress={confirmIOSDate} className="p-2">
                  <Text className="text-blue-600 font-bold text-lg">{t('common.select')}</Text>
                </Pressable>
              </View>

              {/* Picker */}
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
        </Modal>
      )}
    </View>
  );
}