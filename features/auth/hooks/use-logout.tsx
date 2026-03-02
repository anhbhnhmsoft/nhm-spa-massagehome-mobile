import { useLogoutMutation } from '@/features/auth/hooks/use-mutation';
import { useAuthStore } from '@/features/auth/stores';
import { useApplicationStore } from '@/features/app/stores';
import useErrorToast from '@/features/app/hooks/use-error-toast';

/**
 * Hook để đăng xuất
 */
export const useLogout = () => {
  const mutationLogout = useLogoutMutation();
  const logout = useAuthStore((s) => s.logout);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const handleError = useErrorToast();

  return () => {
    setLoading(true);
    mutationLogout.mutate(undefined, {
      onSuccess: async () => {
        await logout();
      },
      onError: (error) => {
        // Xử lý khi có lỗi xảy ra
        handleError(error);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };
};