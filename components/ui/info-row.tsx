import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  showDivider?: boolean;
  valueClassName?: string;
}

const InfoRow = ({ label, value, showDivider = true, valueClassName }: InfoRowProps) => {
  return (
    <>
      <View className="flex-row flex-wrap justify-between gap-2">
        <Text className="text-slate-600 text-sm">{label}</Text>
        {typeof value === 'string' ? (
          <Text className={cn("font-inter-semibold text-slate-800 text-sm", valueClassName)}>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
      {showDivider && <View className="h-[1px] bg-slate-100 my-1" />}
    </>
  );
};

export default InfoRow;