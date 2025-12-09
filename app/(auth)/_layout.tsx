import { Stack } from 'expo-router';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';

export default function AuthLayout() {
  return (
    <>
      <FocusAwareStatusBar hidden />
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
