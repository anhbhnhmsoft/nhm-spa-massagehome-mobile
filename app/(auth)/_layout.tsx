import { Stack } from 'expo-router';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import FullScreenLoading from '@/components/full-screen-loading';
import useApplicationStore from '@/lib/store';

export default function AuthLayout() {
  const loading = useApplicationStore((s) => s.loading);
  return (
    <>
      <FocusAwareStatusBar hidden />
      <FullScreenLoading loading={loading} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ header: () => <HeaderBack /> }} />
        <Stack.Screen name="login" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="verify-otp" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="register" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </>
  );
}
