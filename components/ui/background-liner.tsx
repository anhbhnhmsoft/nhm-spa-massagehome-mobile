import React, { ReactNode } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DefaultColor from '@/components/styles/color';
import { cn } from '@/lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BackgroundLinerProps extends ScrollViewProps {
  children: ReactNode;
}

export const BackgroundLiner = React.forwardRef<ScrollView, BackgroundLinerProps>(
  ({ children, className, contentContainerStyle, ...props }, ref) => {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* BACKGROUND MÀU XANH */}
        <LinearGradient
          colors={[DefaultColor.base['primary-color-2'], DefaultColor.blue[400]]}
          style={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: 260,
            borderBottomLeftRadius: 32, // Tăng bo góc lên một chút cho giống thiết kế mẫu hơn (tuỳ bạn chọn)
            borderBottomRightRadius: 32,
          }}
        />

        <ScrollView
          ref={ref}
          className={cn('flex-1', className)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentContainerStyle}
          style={[
            {
              zIndex: 999,
            },
            props.style,
          ]}
          {...props}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
);

BackgroundLiner.displayName = 'BackgroundLiner';