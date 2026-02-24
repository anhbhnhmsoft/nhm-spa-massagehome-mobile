import { ReactNode, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFontInter, useI18n } from '@/features/app/hooks';
import { QueryProvider } from '@/features/app/providers/query-provider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeAppProvider } from '@/features/app/providers/theme-app-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalHost } from '@rn-primitives/portal';
import ToastManager from 'toastify-react-native';
import { useColorScheme } from 'nativewind';

// Ngăn chặn SplashScreen tự ẩn khi render xong
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode
}

export function AppProvider({ children }: Props) {
  // Load i18n
  const i18nReady = useI18n();

  // Load Inter font
  const [fontsLoaded, fontsError] = useFontInter();

  const { setColorScheme } = useColorScheme();

  // Xử lý khi root view layout xong
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && i18nReady && !fontsError) {
      // Set màu scheme mặc định là light
      setColorScheme('light');
      // Ẩn SplashScreen sau khi font và i18n đã load xong
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, i18nReady, fontsError]);

  if (!i18nReady || !fontsLoaded || fontsError) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeAppProvider>
          <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <BottomSheetModalProvider>
              {/* Stack Navigator */}
              {children}
              {/* Portal Host */}
              <PortalHost />
              {/* Toast Manager */}
              <ToastManager />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </ThemeAppProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
