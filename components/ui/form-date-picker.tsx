import React, { useState } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar} from 'lucide-react-native';
import {Text} from "@/components/ui/text"
import {FormInput} from "@/components/ui/form-input"


interface FormDatePickerProps {
  label?: string;
  error?: string;
  required?: boolean;
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  containerClassName?: string;
  maximumDate?: Date; // Dùng để giới hạn ngày sinh (vd: không được chọn ngày tương lai)
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({
                                                                label,
                                                                error,
                                                                required,
                                                                value,
                                                                onChange,
                                                                placeholder = 'DD/MM/YYYY',
                                                                containerClassName,
                                                                maximumDate = new Date(), // Mặc định không cho chọn ngày tương lai
                                                              }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Hàm format ngày hiển thị ra UI (DD/MM/YYYY)
  const formatDate = (date?: Date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Android tự động đóng picker sau khi chọn, iOS thì không
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    // Nếu người dùng bấm Cancel, selectedDate sẽ undefined
    if (selectedDate && onChange) {
      onChange(selectedDate);
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
            value={formatDate(value)}
            placeholder={placeholder}
            editable={false}
            rightIcon={<Calendar size={20} color="#64748b" />}
          />
        </View>
      </TouchableOpacity>

      {/* Render Native DatePicker */}
      {showPicker && (
        <DateTimePicker
          value={value || new Date()} // Nếu chưa có value thì hiển thị ngày hiện tại
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // UX tốt nhất cho từng HĐH
          maximumDate={maximumDate} // Chặn chọn ngày sinh ở tương lai
          onChange={handleDateChange}
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