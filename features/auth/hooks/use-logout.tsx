import { useLogoutMutation } from '@/features/auth/hooks/use-mutation';
import { useAuthStore } from '@/features/auth/stores';
import useErrorToast from '@/features/app/hooks/use-error-toast';

/**
 * Hook để đăng xuất
 */
export const useLogout = () => {
  const mutationLogout = useLogoutMutation();
  const logout = useAuthStore((s) => s.logout);
  const handleError = useErrorToast();

  return () => {
    mutationLogout.mutate(undefined, {
      onSuccess: async () => {
        await logout();
      },
      onError: (error) => {
        // Xử lý khi có lỗi xảy ra
        handleError(error);
      },
    });
  };
};