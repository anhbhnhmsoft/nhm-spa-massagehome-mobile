import { Stack } from 'expo-router';
import useAuthStore from '@/features/auth/store';
import { _AuthStatus } from '@/features/auth/const';
import { useHeartbeat } from '@/features/auth/hooks';
import useApplicationStore from '@/lib/store';
import FullScreenLoading from '@/components/full-screen-loading';
import { useNotification } from '@/features/app/hooks/use-notification';


export default function AppLayout() {
  const status = useAuthStore((state) => state.status);
  const loading = useApplicationStore((s) => s.loading);

  // Kiểm tra heartbeat khi user có đang được xác thực hay không
  useHeartbeat();
  // Tự động sync device token lên server khi user login
  useNotification();
  return (
    <>
      <FullScreenLoading loading={loading} />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="(tab)" />
        <Stack.Protected guard={status === _AuthStatus.AUTHORIZED}>
          <Stack.Screen name="(service)" />
          <Stack.Screen name="(profile)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
