import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';

export const tabBarStyle = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0', // Thêm màu viền nhẹ cho đẹp
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24, // Tăng bo góc một chút cho hiện đại
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export const getTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  return useMemo(() => 90 + insets.bottom, [insets.bottom]);
}
