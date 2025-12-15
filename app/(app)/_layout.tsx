import { Stack } from 'expo-router';
import useAuthStore from '@/features/auth/store';
import { _AuthStatus, _UserRole } from '@/features/auth/const';
import { useHeartbeat } from '@/features/auth/hooks';
import useApplicationStore from '@/lib/store';
import FullScreenLoading from '@/components/full-screen-loading';

export default function AppLayout() {
  const status = useAuthStore((state) => state.status);
  const loading = useApplicationStore((s) => s.loading);

  const user = useAuthStore((state) => state.user);
  // Kiểm tra heartbeat khi user có đang được xác thực hay không
  useHeartbeat();
  console.log(user);
  return (
    <>
      <FullScreenLoading loading={loading} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Protected guard={user?.role === _UserRole.KTV}>
          <Stack.Screen name="(tab-ktv)" />
        </Stack.Protected>

        <Stack.Protected guard={user?.role !== _UserRole.KTV}>
          <Stack.Screen name="(tab)" />
        </Stack.Protected>
        <Stack.Protected guard={status === _AuthStatus.AUTHORIZED}>
          <Stack.Screen name="(service)" />
          <Stack.Screen name="(profile)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
