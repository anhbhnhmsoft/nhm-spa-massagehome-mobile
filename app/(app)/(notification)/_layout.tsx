import { Stack } from 'expo-router';

export default function NotificatonLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="notificaton" />
    </Stack>
  );
}
