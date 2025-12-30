import { Stack } from 'expo-router';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

export default function ServiceKtvLayout() {
  return (
    <>
      <FocusAwareStatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="form" />
        <Stack.Screen name="service-detail" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="booking-details" />
        <Stack.Screen name="edit-info" />
      </Stack>
    </>
  );
}
