import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { Stack } from 'expo-router';

export default function ServiceAgencyLayout() {
  return (
    <>
      <FocusAwareStatusBar hidden={true} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="deposit" />
        <Stack.Screen name="affiliate" />
        <Stack.Screen name="edit-info" />
      </Stack>
    </>
  );
}
