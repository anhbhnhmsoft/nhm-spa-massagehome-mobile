import { Stack } from 'expo-router';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

export default function ServiceLayout() {
  return (
    <>
      <FocusAwareStatusBar />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="masseurs-detail" options={{ headerShown: false }} />
        <Stack.Screen name="service-detail" options={{ headerShown: false }} />
        <Stack.Screen
          name="service-booking"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="chat" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
