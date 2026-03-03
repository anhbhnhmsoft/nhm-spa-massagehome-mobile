import { Stack } from 'expo-router';
import { useBookingCountdown } from '@/features/ktv/hooks/use-booking';


export default function KTVLayout() {
// đếm booking start (chỉ dùng cho KTV)
  useBookingCountdown();
  return (
    <Stack
      initialRouteName="(tab)"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="(service)" />
    </Stack>
  )
}