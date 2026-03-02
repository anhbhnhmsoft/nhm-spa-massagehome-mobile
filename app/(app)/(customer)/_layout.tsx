import { Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus } from '@/features/auth/const';


export default function CustomerLayout() {
  const status = useAuthStore((state) => state.status);

  return (
    <Stack
      initialRouteName="(tab)"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tab)" />

      <Stack.Protected guard={status === _AuthStatus.AUTHORIZED}>
        <Stack.Screen name="(service)" />
        <Stack.Screen name="(profile)" />
      </Stack.Protected>
    </Stack>
  )
}