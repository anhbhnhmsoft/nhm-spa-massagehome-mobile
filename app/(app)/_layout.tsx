import { Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus, _UserRole } from '@/features/auth/const';
import { useApplicationStore } from '@/features/app/stores';
import FullScreenLoading from '@/components/full-screen-loading';
import { NotificationPermissionModal } from '@/components/app/notification-permission-modal';
import { useCheckMatchAffiliate } from '@/features/affiliate/hooks';
import { useLocation } from '@/features/app/hooks/use-location';
import { useCheckConfigApplicationUpdate } from '@/features/config/hooks';
import { useMemo } from 'react';

export default function AppLayout() {
  const loading = useApplicationStore((s) => s.loading);

  const status = useAuthStore((state) => state.status);

  const user = useAuthStore((state) => state.user);

  // Lấy vị trí người dùng khi ứng dụng được mở

  useLocation({
    enabled: user?.role !== _UserRole.AGENCY,
  });

  // kiểm tra affiliate link khi user login
  useCheckMatchAffiliate();

  // Kiểm tra config application update
  const { isMaintained } = useCheckConfigApplicationUpdate();

  // Tạo guard để kiểm tra quyền truy cập vào từng screen
  const guard = useMemo(() => {
    return {
      maintained: isMaintained,
      ktv_screen: status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.KTV,
      agency_screen: status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.AGENCY,
      customer_screen:
        status === _AuthStatus.UNAUTHORIZED ||
        (status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.CUSTOMER),
      authorized_screen: status === _AuthStatus.AUTHORIZED,
    };
  }, [isMaintained, status, user]);

  return (
    <>
      {/* --- LOADING SCREEN --- */}
      <FullScreenLoading loading={loading} />

      {/* --- NOTIFICATION PERMISSION MODAL --- */}
      <NotificationPermissionModal />

      {/* --- STACK SCREEN --- */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        {/* --- MAINTAINED SCREEN --- */}
        <Stack.Protected guard={guard.maintained}>
          <Stack.Screen name="maintaince" />
        </Stack.Protected>

        <Stack.Protected guard={!guard.maintained}>
          {/* --- TAB KTV SCREEN --- */}
          <Stack.Protected guard={guard.ktv_screen}>
            <Stack.Screen name="(ktv)" />
          </Stack.Protected>

          {/* --- TAB AGENCY SCREEN --- */}
          <Stack.Protected guard={guard.agency_screen}>
            <Stack.Screen name="(agency)" />
          </Stack.Protected>

          {/* --- TAB CUSTOMER SCREEN --- */}
          <Stack.Protected guard={guard.customer_screen}>
            <Stack.Screen name="(customer)" />
          </Stack.Protected>

          <Stack.Protected guard={guard.authorized_screen}>
            <Stack.Screen name="take-picture-avatar" />
          </Stack.Protected>

          {/* --- PDF SCREEN --- */}
          <Stack.Screen name="term-or-use-pdf" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
