import { TextInput, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import React from 'react';

export const LanguageTextArea = ({ lang, placeholder, value, onChangeText, error, editable }: any) => (
  <View className="relative mb-4">
    <View
      className={cn(
        'min-h-[100px] rounded-xl border bg-white px-4 py-3',
        error ? 'border-red-500' : 'border-gray-200',
      )}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        className={'flex-1 pr-8 pt-1 text-base text-gray-900'}
        editable={editable}
      />
    </View>

    {/* Badge ngôn ngữ */}
    <View className="absolute right-3 top-3 rounded-md bg-gray-100 px-2 py-1">
      <Text className="text-[10px] font-bold text-gray-500">{lang}</Text>
    </View>

    {/* ERROR TEXT */}
    {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);
