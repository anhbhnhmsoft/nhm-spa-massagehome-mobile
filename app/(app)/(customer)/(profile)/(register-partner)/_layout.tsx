import { Stack } from 'expo-router';

export default function RegisterPartnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="choose-type" />
      <Stack.Screen name="register-technical" />
      <Stack.Screen name="register-agency" />
    </Stack>
  );
}
