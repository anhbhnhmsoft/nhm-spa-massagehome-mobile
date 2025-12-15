import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import QueryProvider from '@/lib/provider/query-provider';
import ThemeProvider from '@/lib/provider/theme-provider';
import useFontInter from '@/lib/provider/font-inter';
import { useEffect, useState } from 'react';
import initI18n from '@/lib/provider/i18n';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'nativewind';
import ToastManager from 'toastify-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useHydrateAuth } from '@/features/auth/hooks';
import { _AuthStatus } from '@/features/auth/const';
import { useLocation } from '@/features/app/hooks/use-location';
import useAuthStore from '@/features/auth/store';



export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  // Khởi tạo font Inter
  const [loaded, error] = useFontInter();
  // Set màu scheme
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    async function initial() {
      try {
        // Mặc định là light theme
        setColorScheme('light');
        // Khởi tạo i18n
        await initI18n();
      } finally {
        setReady(true);
      }
    }

    initial();
  }, []);

  useEffect(() => {
    if (ready && loaded && !error) {
      SplashScreen.hideAsync();
    }
  }, [ready, loaded, error]);

  if (!ready) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          <GestureHandlerRootView className="flex-1">
            <BottomSheetModalProvider>
              {/* Stack Navigator */}
              <AppContainer />
              {/* Toast Manager */}
              <ToastManager />
              {/* Portal Host */}
              <PortalHost />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

const AppContainer = () => {
  const complete = useHydrateAuth();
  const status = useAuthStore((state) => state.status);
  const { locationPermission, completeCheck } = useLocation();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Protected guard={!complete}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={complete}>
          {/* Hiển thị màn hình request location nếu chưa có quyền location, và không nhấn bỏ qua */}
          <Stack.Protected
            guard={
              locationPermission !== 'skipped' &&
              locationPermission !== 'granted' &&
              locationPermission === null &&
              completeCheck // Đảm bảo đã check xong permission
            }>
            <Stack.Screen name="request-location" />
          </Stack.Protected>
          <Stack.Screen name="(app)" />
          <Stack.Protected guard={status === _AuthStatus.UNAUTHORIZED}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </>
  );
};
