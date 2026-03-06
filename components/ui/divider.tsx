import React from 'react';
import { View, ViewProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface DividerProps extends ViewProps {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  /** Khoảng cách lề (margin). Nếu là ngang thì là marginVertical, dọc là marginHorizontal */
  space?: number;
  colorClassName?: string;
  dashed?: boolean;
  containerClassName?: string;
}

export const Divider = ({
                          label,
                          orientation = 'horizontal',
                          thickness = 1,
                          space = 16, // Mặc định là 16 (tương đương my-4)
                          colorClassName = 'bg-slate-100',
                          dashed = false,
                          containerClassName,
                          className,
                          ...props
                        }: DividerProps) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      className={cn(
        'items-center justify-center',
        isHorizontal ? 'w-full flex-row' : 'h-full',
        containerClassName
      )}
      style={[
        isHorizontal
          ? { marginVertical: space }
          : { marginHorizontal: space },
        props.style
      ]}
      {...props}
    >
      {/* Đường kẻ chính / Đường kẻ trước label */}
      <View
        style={{
          height: isHorizontal ? thickness : undefined,
          width: isHorizontal ? undefined : thickness,
          borderStyle: dashed ? 'dashed' : 'solid',
          // Với nét đứt, React Native yêu cầu borderWidth > 0
          borderWidth: dashed ? (isHorizontal ? thickness : thickness) : 0,
          borderColor: dashed ? '#cbd5e1' : undefined, // slate-300
        }}
        className={cn(
          'flex-1',
          !dashed && colorClassName,
          dashed && 'bg-transparent'
        )}
      />

      {/* Nhãn văn bản ở giữa */}
      {label && isHorizontal && (
        <View className="px-3">
          <Text className="text-[12px] font-inter-medium text-slate-400 uppercase tracking-widest">
            {label}
          </Text>
        </View>
      )}

      {/* Đường kẻ sau label */}
      {label && isHorizontal && (
        <View
          style={{ height: thickness }}
          className={cn('flex-1', colorClassName)}
        />
      )}
    </View>
  );
};