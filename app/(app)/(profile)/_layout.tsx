import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet" />
      <Stack.Screen name="deposit" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
