import React, { ReactNode } from 'react';
import { View, TouchableOpacity, ViewProps, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';

interface BaseCardProps extends ViewProps {
  title?: string;
  headerRightText?: string;
  onHeaderRightPress?: () => void;
  children: ReactNode;
  containerClassName?: string;
}

export const Card = ({
                           title,
                           headerRightText,
                           onHeaderRightPress,
                           children,
                           containerClassName,
                           className,
                           ...props
                         }: BaseCardProps) => {
  return (
    <View
      className={cn(
        "bg-white rounded-xl p-4 border border-slate-100",
        containerClassName
      )}
      style={{
        ...Platform.select({
          ios: {
            shadowColor: DefaultColor.slate['200'],
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
          },
          android: {
            elevation: 3,
          },
        }),
      }}
      {...props}
    >
      {/* HEADER CỦA CARD */}
      {(title || headerRightText) && (
        <View className="flex-row justify-between items-center mb-4 px-1">
          {title && (
            <Text className="text-[16px] font-inter-bold text-slate-900">
              {title}
            </Text>
          )}

          {headerRightText && (
            <TouchableOpacity
              onPress={onHeaderRightPress}
              className="flex-row items-center"
            >
              <Text className="text-[12px] text-slate-400 font-inter-medium mr-1">
                {headerRightText}
              </Text>
              <ChevronRight size={14} color={DefaultColor.slate[400]} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* NỘI DUNG BÊN TRONG CARD */}
      <View className={cn("w-full", className)}>
        {children}
      </View>
    </View>
  );
};