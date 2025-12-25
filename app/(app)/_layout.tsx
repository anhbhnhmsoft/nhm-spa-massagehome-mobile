import { Stack } from 'expo-router';
import useAuthStore from '@/features/auth/store';
import { _UserRole } from '@/features/auth/const';
import { useCheckAuth, useHeartbeat } from '@/features/auth/hooks';
import useApplicationStore from '@/lib/store';
import FullScreenLoading from '@/components/full-screen-loading';
import { useNotification } from '@/features/app/hooks/use-notification';
import { NotificationPermissionModal } from '@/components/notification-permission-modal';
import RequestLocationModal from '@/components/app/request-location';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const loading = useApplicationStore((s) => s.loading);
  const [notReady, setNotReady] = useState(true);

  const checkAuth = useCheckAuth();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Chờ 2000ms để đảm bảo rằng checkAuth đã có giá trị
    const timeout = setTimeout(() => {
      setNotReady(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);


  // Kiểm tra heartbeat khi user có đang được xác thực hay không
  useHeartbeat();
  // Tự động sync device token lên server khi user login
  useNotification();
  return (
    <>
      <FullScreenLoading loading={loading || notReady} whiteBg={notReady} />
      {/* --- NOTIFICATION PERMISSION MODAL --- */}
      <NotificationPermissionModal />
      {/* --- REQUEST LOCATION MODAL --- */}
      <RequestLocationModal />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* --- TAB KTV SCREEN --- */}
        <Stack.Protected guard={checkAuth && user?.role === _UserRole.KTV}>
          <Stack.Screen name="(tab-ktv)" />
        </Stack.Protected>

        {/* --- TAB CUSTOMER SCREEN --- */}
        <Stack.Protected guard={user?.role !== _UserRole.KTV}>
          <Stack.Screen name="(tab)" />
          <Stack.Protected guard={checkAuth}>
            <Stack.Screen name="(service)" />
            <Stack.Screen name="(profile)" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </>
  );
}
