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
import { _TIME_OUT_LOADING_SCREEN_LAYOUT } from '@/lib/const';
import { useCheckMatchAffiliate } from '@/features/affiliate/hooks';

export default function AppLayout() {
  const loading = useApplicationStore((s) => s.loading);
  const [notReady, setNotReady] = useState(true);

  const checkAuth = useCheckAuth();
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    // Chờ _TIME_OUT_LOADING_SCREEN_LAYOUT để đảm bảo rằng checkAuth đã có giá trị
    const timeout = setTimeout(() => {
      setNotReady(false);
    }, _TIME_OUT_LOADING_SCREEN_LAYOUT);
    return () => clearTimeout(timeout);
  }, []);

  // Kiểm tra heartbeat khi user có đang được xác thực hay không
  useHeartbeat();

  // Tự động sync device token lên server khi user login
  useNotification();

  // kiểm tra affiliate link khi user login
  useCheckMatchAffiliate();

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
        }}>
        {/* --- TAB KTV SCREEN --- */}
        <Stack.Protected guard={checkAuth && user?.role === _UserRole.KTV}>
          <Stack.Screen name="(tab-ktv)" />
          <Stack.Screen name="(service-ktv)" />
        </Stack.Protected>

        {/* --- TAB KTV SCREEN --- */}
        <Stack.Protected guard={checkAuth && user?.role === _UserRole.AGENCY}>
          <Stack.Screen name="(tab-agency)" />
          <Stack.Screen name="(service-agency)" />
        </Stack.Protected>

        {/* --- TAB CUSTOMER SCREEN --- */}
        <Stack.Protected guard={user?.role !== _UserRole.KTV && user?.role !== _UserRole.AGENCY}>
          <Stack.Screen name="(tab)" />
          <Stack.Protected guard={checkAuth}>
            <Stack.Screen name="(service)" />
            <Stack.Screen name="(profile)" />
          </Stack.Protected>
        </Stack.Protected>
        <Stack.Protected guard={checkAuth}>
          <Stack.Screen name="take-picture-avatar" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
