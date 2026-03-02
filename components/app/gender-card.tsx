import { TouchableOpacity, View } from 'react-native';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Check, Mars, Venus } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import React from 'react';

export const GenderCard = ({
                      label,
                      isActive,
                      onPress,
                    }: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'aspect-[0.85] flex-1 items-center justify-center rounded-2xl border',
        isActive ? 'border-blue-300 bg-blue-100' : 'border-gray-200 bg-white'
      )}>
      {/* Icon Circle Wrapper */}
      <View
        className={cn(
          'mb-3 h-20 w-20 items-center justify-center rounded-full',
          isActive ? 'bg-blue-200' : 'bg-gray-100'
        )}>
        {label === 'Nam' ? (
          <Icon as={Mars} size={48} className={isActive ? 'text-blue-400' : 'text-[#9CA3AF]'} />
        ) : (
          <Icon as={Venus} size={48} className={isActive ? 'text-blue-400' : 'text-[#9CA3AF]'} />
        )}
      </View>

      <Text
        className={cn('font-inter-medium text-lg', isActive ? 'text-gray-900' : 'text-gray-500')}>
        {label}
      </Text>

      {/* Dấu tích nhỏ (Optional - thêm vào cho xịn nếu muốn) */}
      {isActive && (
        <View className="absolute right-3 top-3 rounded-full bg-blue-400 p-1">
          <Check size={12} color="white" strokeWidth={4} />
        </View>
      )}
    </TouchableOpacity>
  );
};
