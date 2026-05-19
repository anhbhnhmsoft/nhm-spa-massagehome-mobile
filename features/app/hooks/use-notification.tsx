import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import authApi from '@/features/auth/api';
import { getInfoDevice } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus } from '@/features/auth/const';
import { NotificationType } from '@/features/notification/const';
import useConfigStore from '@/features/config/stores';
import { queryClient } from '@/lib/provider/query-provider';

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
  const statusAuth = useAuthStore((state) => state.status);

  return useCallback(async () => {
    try {
      const data = await useGetExpoPushToken();

      // Chỉ đồng bộ khi user đã login
      if (data && statusAuth === _AuthStatus.AUTHORIZED) {
        await authApi.setDeviceInfo({
          platform: data.deviceInfo.platform,
          device_id: data.deviceInfo.deviceId,
          device_name: data.deviceInfo.deviceName,
          token: data.token,
        });
      }
    } catch {
      // do nothing
    }
  }, [statusAuth])
};

// Quản lý thông báo
export const useNotification = () => {
  const statusAuth = useAuthStore((state) => state.status);
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const handledSupportNotificationIdsRef = useRef<Set<string>>(new Set());
  const syncTokenToServer = useSyncTokenToServer();

  const updateSupportBadgeFromNotification = useCallback((data: Record<string, any> | null | undefined) => {
    const type = Number(data?.type);
    const ticketId = data?.support_ticket_id;
    if (type !== NotificationType.SUPPORT_CHAT_MESSAGE || !ticketId) return;

    const notificationId = data?.notification_id ? String(data.notification_id) : null;
    if (notificationId) {
      if (handledSupportNotificationIdsRef.current.has(notificationId)) return;
      handledSupportNotificationIdsRef.current.add(notificationId);
    }

    const roomId = `support-ticket:${ticketId}`;
    const store = useConfigStore.getState();
    if (store.active_support_room_id === roomId) return;

    store.incrementSupportUnreadCount(1);
    queryClient.invalidateQueries({ queryKey: ['supportApi-tickets'] });
  }, []);

  useEffect(() => {
    // 1. Tự động chạy khi User Login hoặc App mở
    syncTokenToServer();

    // 2. Setup Listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
       // Xử lý khi nhận thông báo trong lúc app đang mở (Foreground)
       // console.log('Notification Received:', notification);
       updateSupportBadgeFromNotification(notification.request.content.data);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
       // Xử lý khi người dùng nhấn vào thông báo
       const data = response.notification.request.content.data;
       updateSupportBadgeFromNotification(data);
       
       if (data?.support_ticket_id) {
         // Nếu có support_ticket_id, điều hướng thẳng vào phòng chat
         router.push({
           pathname: '/(app)/(customer)/(service)/support-chat',
           params: { ticketId: data.support_ticket_id }
         });
       }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [statusAuth, syncTokenToServer, updateSupportBadgeFromNotification]); // Chạy lại khi user thay đổi (login/logout)
};

// Kiểm tra quyền thông báo
export const useCheckNotificationPermission =  () => {
  const user = useAuthStore((state) => state.user);

  return useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }, [user])
};
