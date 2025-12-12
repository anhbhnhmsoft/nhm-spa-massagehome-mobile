import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import authApi from '@/features/auth/api';
import { getInfoDevice } from '@/lib/utils';
import useAuthStore from '@/features/auth/store';
import { User } from '@/features/auth/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowAlert: true,
  }),
});

// Đăng ký cấp quyền thông báo
export const useGetExpoPushToken = async () => {
  // Cấu hình Channel cho Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF', // màu primary_color
    });
  }
  // 1. Chỉ kiểm tra, KHÔNG xin
  const { status } = await Notifications.getPermissionsAsync();
  // 2. Nếu chưa có quyền -> skip
  if (status !== 'granted') {
    return null;
  }
  // 3. Nếu đã có quyền -> Lấy Token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  try {
    const deviceInfo = await getInfoDevice();
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return {
      deviceInfo,
      token: tokenData.data,
    };
  } catch (e) {
    return null;
  }
};

// Đồng bộ token lên server khi user login hoặc app mở
export const useSyncTokenToServer =  () => {
  const user = useAuthStore((state) => state.user);
  return useCallback(async () => {
    if (!user) return; // Chưa login thì không gửi
    const data = await useGetExpoPushToken();
    if (data) {
      await authApi.setDeviceInfo({
        platform: data.deviceInfo.platform,
        device_id: data.deviceInfo.deviceId,
        device_name: data.deviceInfo.deviceName,
        token: data.token,
      });
    }
  }, [user])
};

// Quản lý thông báo
export const useNotification = () => {
  const user = useAuthStore((state) => state.user);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const syncTokenToServer = useSyncTokenToServer();

  useEffect(() => {
    // 1. Tự động chạy khi User Login hoặc App mở
    syncTokenToServer();

    // 2. Setup Listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("Nhận thông báo khi mở app:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("User bấm vào thông báo:", response);
      // Điều hướng (router.push) tại đây
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]); // Chạy lại khi user thay đổi (login/logout)
};

// Kiểm tra quyền thông báo
export const useCheckNotificationPermission =  () => {
  const user = useAuthStore((state) => state.user);
  return useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }, [user])
};
