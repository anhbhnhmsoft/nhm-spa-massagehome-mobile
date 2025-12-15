import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet" />
      <Stack.Screen name="deposit" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="take-picture-avatar" />

      {/* Location */}
      <Stack.Screen name="location/list" />
      <Stack.Screen name="location/save" />
    </Stack>
  );
}
