import React, { useState } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { Text } from "@/components/ui/text";
import { FormInput } from "@/components/ui/form-input";

interface FormTimePickerProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  containerClassName?: string;
  is24Hour?: boolean; // Tùy chọn hiển thị định dạng 24h
}

export const FormTimePicker: React.FC<FormTimePickerProps> = ({
                                                                label,
                                                                error,
                                                                required,
                                                                value,
                                                                onChange,
                                                                placeholder = 'HH:mm',
                                                                containerClassName,
                                                                is24Hour = true, // Mặc định dùng định dạng 24 giờ
                                                              }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Hàm format giờ hiển thị ra UI (HH:mm)
  const formatTime = (date?: Date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    // Android tự động đóng picker sau khi chọn, iOS thì không
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    // Nếu người dùng bấm Cancel, selectedTime sẽ undefined
    if (selectedTime && onChange) {
      onChange(selectedTime);
    }
  };

  return (
    <View className={containerClassName}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowPicker(true)}
      >
        <View pointerEvents="none">
          <FormInput
            label={label}
            required={required}
            error={error}
            value={formatTime(value)}
            placeholder={placeholder}
            editable={false}
            rightIcon={<Clock size={20} color="#64748b" />}
          />
        </View>
      </TouchableOpacity>

      {/* Render Native TimePicker */}
      {showPicker && (
        <DateTimePicker
          value={value || new Date()} // Nếu chưa có value thì hiển thị giờ hiện tại
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // UX tốt nhất cho từng HĐH
          is24Hour={is24Hour}
          onChange={handleTimeChange}
        />
      )}

      {/* Nút Done trên iOS (Vì iOS spinner không tự đóng) */}
      {Platform.OS === 'ios' && showPicker && (
        <TouchableOpacity
          className="bg-slate-100 py-2 items-center rounded-b-2xl mt-[-8px] border border-t-0 border-slate-200"
          onPress={() => setShowPicker(false)}
        >
          <Text className="text-blue-500 font-inter-bold">Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};