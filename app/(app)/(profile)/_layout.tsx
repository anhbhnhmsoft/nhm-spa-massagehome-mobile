import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="wallet" />
      <Stack.Screen name="deposit" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="partner-register-type" />
      <Stack.Screen name="partner-register-individual" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="affiliate" />
      <Stack.Screen name="term-or-use-pdf" options={{ headerShown: false }} />
    </Stack>
  );
}
