
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, Pressable, AppState, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import useAuthStore from '@/features/auth/store';
import { BellRing } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useCheckNotificationPermission, useSyncTokenToServer } from '@/features/app/hooks/use-notification'; // Nếu có icon

export function NotificationPermissionModal() {
  const {t} = useTranslation();
  const user = useAuthStore(state => state.user); // Lấy trạng thái login
  const [visible, setVisible] = useState(false);

  const appState = useRef(AppState.currentState);


  // Hàm kiểm tra quyền
  const checkPermission = async () => {
    const isGranted = await useCheckNotificationPermission(user);
    if (!isGranted) {
      setVisible(true);
    }
  };

  // 2. Chạy kiểm tra khi mount hoặc khi user login xong
  useEffect(() => {
    checkPermission();
    // 3. (Optional) Lắng nghe khi App từ Settings quay trở lại
    // Để nếu người dùng vừa bật quyền trong cài đặt xong thì tự tắt modal
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  // 4. Xử lý khi bấm nút "Bật thông báo"
  const handleRequestPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();

    // Trường hợp 1: Chưa hỏi bao giờ -> Hiện popup hệ thống
    if (status === 'undetermined') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();

      if (newStatus === 'granted') {
        setVisible(false);
        await useSyncTokenToServer(user)
      }
    }
    // Trường hợp 2: Đã từng từ chối (denied) -> Phải mở Settings
    else {
      // Mở cài đặt ứng dụng
      await Linking.openSettings();
      setVisible(false);
    }
  };

  // 5. Xử lý khi bấm "Để sau"
  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      {/* Lớp nền mờ tối */}
      <View className="flex-1 justify-center items-center bg-black/60 px-6">

        {/* Hộp nội dung */}
        <View className="w-full bg-white rounded-3xl p-6 items-center shadow-xl">

          {/* Icon Minh họa (Nếu không có icon thì dùng Text emoji) */}
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <BellRing size={32} color="#007AFF" />
          </View>

          <Text className="text-xl font-bold text-slate-800 text-center mb-2">
            {t('request_notification.title')}
          </Text>

          <Text className="text-slate-500 text-center mb-6 leading-5">
            {t('request_notification.description')}
          </Text>

          {/* Nút Action */}
          <View className="w-full gap-3">
            <Pressable
              onPress={handleRequestPermission}
              className="w-full bg-blue-600 py-4 rounded-xl items-center active:bg-blue-700"
            >
              <Text className="text-white font-bold text-base">
                {t('request_notification.allow')}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDismiss}
              className="w-full py-3 items-center"
            >
              <Text className="text-slate-400 font-medium">
                {t('request_notification.later')}
              </Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}