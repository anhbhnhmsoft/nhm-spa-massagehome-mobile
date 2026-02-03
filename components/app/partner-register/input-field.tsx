import React from 'react';
import { View, TextInput } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Text } from '@/components/ui/text';

type InputFieldProps<T extends FieldValues = any> = {
  control: Control<T>;
  name: FieldPath<T>;
  placeholder: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean;
};

export const InputField = <T extends FieldValues = any>({
  control,
  name,
  placeholder,
  error,
  multiline = false,
  numberOfLines,
  keyboardType = 'default',
  editable = true,
}: InputFieldProps<T>) => {
  return (
    <View>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`rounded-xl bg-gray-100 px-4 py-3 text-base text-slate-900 ${
              multiline ? 'h-28' : ''
            }`}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onBlur={onBlur}
            onChangeText={keyboardType === 'numeric' ? (value) => {
              onChange(Number(value))
            }: onChange}
            value={value}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlignVertical={multiline ? 'top' : 'center'}
            keyboardType={keyboardType}
            editable={editable}
          />
        )}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};
