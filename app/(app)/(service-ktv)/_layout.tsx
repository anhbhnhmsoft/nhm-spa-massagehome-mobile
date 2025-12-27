import { Stack } from 'expo-router';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

export default function ServiceKtvLayout() {
  return (
    <>
      <FocusAwareStatusBar />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="form" />
        <Stack.Screen name="service-detail" />
      </Stack>
    </>
  );
}
