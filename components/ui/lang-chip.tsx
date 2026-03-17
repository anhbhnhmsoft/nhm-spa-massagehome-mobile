import { _LanguageCode } from '@/lib/const';
import React, { useCallback } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';

type LangChipProps = {
  code: _LanguageCode;
  label: string;
  icon: any;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: (code: _LanguageCode) => void;
};

export const LangChip = ({ code, label, icon, isSelected, isDisabled, onPress }: LangChipProps) => {
  const handlePress = useCallback(() => onPress(code), [onPress, code]);
  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.8}
      onPress={handlePress}
      className={cn(
        'flex-row items-center gap-2 rounded-full border px-3 py-2',
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white',
        isDisabled && 'opacity-50'
      )}>
      <Image source={icon} style={{ width: 16, height: 16, borderRadius: 8 }} resizeMode="cover" />
      <Text
        className={cn('text-[13px] font-medium', isSelected ? 'text-blue-600' : 'text-gray-700')}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};