import { useAuthStore } from '@/features/auth/stores';
import { useCallback } from 'react';
import { _AuthStatus } from '@/features/auth/const';
import { Href, router } from 'expo-router';

/**
 * Hook để kiểm tra xem user có đang được xác thực hay không, nếu không thì push về màn hình auth
 */
export const useCheckAuthToRedirect = () => {
  const status = useAuthStore((state) => state.status);

  // Kiểu dữ liệu nhận vào: Href (URL) HOẶC một hàm callback
  return useCallback(
    (redirectTo: Href | (() => void)) => {
      if (status === _AuthStatus.UNAUTHORIZED) {
        router.push('/(auth)');
      } else {
        if (typeof redirectTo === 'function') {
          redirectTo();
        } else {
          router.push(redirectTo);
        }
      }
    },
    [status]
  );
};