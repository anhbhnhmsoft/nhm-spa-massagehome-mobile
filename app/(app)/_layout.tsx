import { Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus, _UserRole } from '@/features/auth/const';
import { useApplicationStore } from '@/features/app/stores';
import FullScreenLoading from '@/components/full-screen-loading';
import { NotificationPermissionModal } from '@/components/app/notification-permission-modal';
import { useCheckMatchAffiliate } from '@/features/affiliate/hooks';
import { useLocation } from '@/features/app/hooks/use-location';
import { useCheckConfigApplicationUpdate } from '@/features/config/hooks';

export default function AppLayout() {
  const loading = useApplicationStore((s) => s.loading);


  const status = useAuthStore((state) => state.status);

  const user = useAuthStore((state) => state.user);

  // Lấy vị trí người dùng khi ứng dụng được mở
  useLocation();

  // kiểm tra affiliate link khi user login
  useCheckMatchAffiliate();

  // Kiểm tra config application update
  const {isMaintained} = useCheckConfigApplicationUpdate();

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
        <Stack.Protected guard={isMaintained}>
          <Stack.Screen name="maintaince" />
        </Stack.Protected>

        <Stack.Protected guard={!isMaintained}>
          {/* --- TAB KTV SCREEN --- */}
          <Stack.Protected guard={status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.KTV}>
            <Stack.Screen name="(ktv)" />
          </Stack.Protected>

          {/* --- TAB AGENCY SCREEN --- */}
          <Stack.Protected guard={status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.AGENCY}>
            <Stack.Screen name="(tab-agency)" />
            <Stack.Screen name="(service-agency)" />
          </Stack.Protected>

          {/* --- TAB CUSTOMER SCREEN --- */}
          <Stack.Protected guard={status === _AuthStatus.UNAUTHORIZED || (
                status === _AuthStatus.AUTHORIZED && user?.role === _UserRole.CUSTOMER
          )}>
            <Stack.Screen name="(customer)" />
          </Stack.Protected>

          <Stack.Protected guard={status === _AuthStatus.AUTHORIZED}>
            <Stack.Screen name="take-picture-avatar" />
          </Stack.Protected>

          {/* --- PDF SCREEN --- */}
          <Stack.Screen name="term-or-use-pdf" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
