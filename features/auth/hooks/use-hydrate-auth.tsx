import { useAuthStore } from '@/features/auth/stores';
import { useEffect } from 'react';
import { _AuthStatus } from '@/features/auth/utils';
import { meApi } from '@/features/auth/services';
import { useMutation } from '@tanstack/react-query';
import useToast from '@/features/app/hooks/use-toast';
import { useTranslation } from 'react-i18next';

/**
 * Hook để hydrate auth khi mount component
 */
export const useHydrateAuth = () => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const status = useAuthStore((state) => state.status);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const {t} = useTranslation();
  const { error } = useToast();

  // Call Api check token hợp lệ hay không đồng thời cập nhật thông tin user
  const { mutate } = useMutation({
    mutationFn: async () => await meApi.call(),
  });


  useEffect(() => {
    if (status === _AuthStatus.INIT){
      hydrate();
    }

    if (status === _AuthStatus.HYDRATED){
      mutate(undefined, {
        onSuccess: async (res) => {
          // Cập nhật thông tin user mới nhất
          await setUser(res.data.user);
          // Cập nhật trạng thái thành AUTHORIZED
          setStatus(_AuthStatus.AUTHORIZED);
        },
        onError: async () => {
          // Token hết hạn hoặc không hợp lệ
          error({
            message: t('common_error.invalid_or_expired_token'),
          });
          await logout();
        },
      });
    }
  }, [status]);

};
