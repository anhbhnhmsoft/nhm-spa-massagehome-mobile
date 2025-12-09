import { Stack } from 'expo-router';
import useApplicationStore from '@/lib/store';
import FullScreenLoading from '@/components/full-screen-loading';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';


export default function ServiceLayout() {
  const loading = useApplicationStore((s) => s.loading);

  return (
    <>
      <FullScreenLoading loading={loading} />
      <FocusAwareStatusBar />
      <Stack>
        <Stack.Screen name="masseurs-detail" options={{ headerShown: false }} />
        <Stack.Screen name="service-detail" options={{ headerShown: false }} />
        <Stack.Screen name="service-booking" options={{ headerShown: false , animation:"slide_from_bottom"}} />
      </Stack>
    </>
  );
}
