import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { MotiView } from 'moti';

interface ProgressBarProps {
  /** Chế độ hiển thị: theo phần trăm hoặc lặp vô tận */
  mode?: 'percentage' | 'loop';
  /** Giá trị phần trăm (0 - 100), chỉ dùng cho chế độ 'percentage' */
  progress?: number;
  /** Chiều cao của thanh progress bar */
  height?: number;
  /** Màu của thanh chạy */
  color?: string;
  /** Màu nền của track */
  trackColor?: string;
  /** Thời gian animation (ms). Mặc định: 300ms (percentage), 2000ms (loop) */
  duration?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
                                                   mode = 'percentage',
                                                   progress = 0,
                                                   height = 8,
                                                   color = '#3498db',
                                                   trackColor = '#e0e0e0',
                                                   duration,
                                                 }) => {
  // Giới hạn giá trị progress trong khoảng 0 - 100 để tránh lỗi UI
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { height, backgroundColor: trackColor }]}>
      {mode === 'percentage' ? (
        // --- CHẾ ĐỘ PHẦN TRĂM ---
        <MotiView
          animate={{
            width: `${clampedProgress}%` as DimensionValue,
          }}
          transition={{
            type: 'timing',
            duration: duration || 300,
          }}
          style={[styles.bar, { backgroundColor: color }]}
        />
      ) : (
        // --- CHẾ ĐỘ LOOP (INDETERMINATE) ---
        <MotiView
          from={{ translateX: -150 }}
          animate={{ translateX: 300 }}
          transition={{
            type: 'timing',
            duration: duration || 2000,
            loop: true,
          }}
          style={[styles.loopBar, { backgroundColor: color }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 99,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 99,
  },
  loopBar: {
    height: '100%',
    width: '40%',
    borderRadius: 99,
    position: 'absolute',
  },
});

export default ProgressBar;