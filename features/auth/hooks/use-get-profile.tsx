import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/features/auth/stores';
import { useProfileMutation } from '@/features/auth/hooks/use-mutation';
import useToast from '@/features/app/hooks/use-toast';
import { useCallback } from 'react';

/**
 * Hook để lấy profile user
 */
export const useGetProfile = () => {
  const { t } = useTranslation();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const { mutate } = useProfileMutation();
  const { error } = useToast();

  return useCallback(() => {
    mutate(undefined, {
      onSuccess: async (res) => {
        await setUser(res.data.user);
      },
      onError: async () => {
        // Token hết hạn hoặc không hợp lệ
        error({
          message: t('common_error.invalid_or_expired_token'),
        });
        await logout();
      },
    });
  }, []);
};