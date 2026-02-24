import '@/global.css';
import {  Stack } from 'expo-router';
import useHandleLinking from '@/features/app/hooks/use-handle-linking';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { AppProvider } from '@/features/app/providers';
import { AuthBootstrapProvider } from '@/features/auth/providers';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';


export default function RootLayout() {
  return (
    <AppProvider>
      <AppContainer/>
    </AppProvider>
  );
}

const AppContainer = () => {
  // Xử lý linking
  useHandleLinking(true);

  return (
    <>
      <AuthBootstrapProvider>
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AuthBootstrapProvider>

    </>
  );
};
