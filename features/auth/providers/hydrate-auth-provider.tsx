import { ReactNode, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores';
import { useProfileMutation } from '@/features/auth/hooks/use-mutation';
import useToast from '@/features/app/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { _AuthStatus } from '@/features/auth/const';


export const HydrateAuthProvider = ({ children }: { children: ReactNode }) => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const logout = useAuthStore((state) => state.logout);

  const { mutate } = useProfileMutation();
  const { error } = useToast();
  const { t } = useTranslation();

  const validateToken = useCallback((async () => {
    // Nếu chưa hydrate xong từ local storage thì phải load token từ local storage
    if (status === _AuthStatus.INITIAL) {
      await hydrate();
    }
    //  Nếu trạng thái là đã đăng nhập, cần verify token
    if (status === _AuthStatus.HYDRATE) {
      mutate(undefined, {
        onSuccess: async (res) => {
          await setUser(res.data.user);
          setStatus(_AuthStatus.AUTHORIZED);
        },
        onError: async () => {
          // Token hết hạn hoặc không hợp lệ
          error({ message: t('common_error.invalid_or_expired_token')});
          await logout();
        },

      });
    }
  }),[status]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  return children;
}