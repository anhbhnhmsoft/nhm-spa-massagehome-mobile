import { useUserServiceStore } from '@/features/user/stores';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { useApplicationStore } from '@/features/app/stores';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useMutationKtvDetail } from '@/features/user/hooks/use-mutation';
import { router } from 'expo-router';

/**
 * Lưu thông tin massager vào store và chuyển hướng đến màn hình chi tiết massager
 */
export const useGoDetailKtv = () => {
  const setKtv = useUserServiceStore((s) => s.setKtv);

  const redirect = useCheckAuthToRedirect();

  const setLoading = useApplicationStore((s) => s.setLoading);

  const handleError = useErrorToast();

  const { mutate } = useMutationKtvDetail();

  return (id: string) => {
    redirect(() => {
      setLoading(true);
      mutate(id, {
        onSuccess: (res) => {
          setKtv(res.data);
          router.push('/(app)/(customer)/(service)/masseurs-detail');
        },
        onError: (error) => {
          handleError(error);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    });
  };
};