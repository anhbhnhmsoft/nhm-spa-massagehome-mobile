import { useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import {
  QueryClient,
  focusManager,
  QueryClientProvider
} from '@tanstack/react-query';

// Cấu hình Focus Manager (Giữ nguyên logic của bạn)
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

// Tạo Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});

const QueryProvider = ({ children }: { children: ReactNode }) => {
  // Lắng nghe sự kiện AppState thay đổi
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;