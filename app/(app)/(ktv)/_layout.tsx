import { Stack } from 'expo-router';
import { useBookingCountdown } from '@/features/ktv/hooks/use-booking';
import { useRequireLocationForKTV } from '@/features/app/hooks/use-location';


export default function KTVLayout() {
  // đếm booking start (chỉ dùng cho KTV)
  useBookingCountdown();
  // Kiểm tra và yêu cầu quyền vị trí cho KTV
  const { isLocationReady } = useRequireLocationForKTV();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!isLocationReady}>
        <Stack.Screen name="required-location" />
      </Stack.Protected>
      <Stack.Protected guard={isLocationReady}>
        <Stack.Screen name="(tab)" />
        <Stack.Screen name="(service)" />
      </Stack.Protected>
    </Stack>
  )
}