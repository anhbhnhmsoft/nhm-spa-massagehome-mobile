// Hook cho chỉnh sửa dịch vụ
import { useSetServiceMutation } from '@/features/ktv/hooks/use-mutation';
import { useTranslation } from 'react-i18next';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useApplicationStore } from '@/features/app/stores';
import useToast from '@/features/app/hooks/use-toast';
import { useCallback } from 'react';
import { useKtvStore } from '@/features/ktv/stores';

// Tạm thời ko dùng
export const useSetService = () => {
  const setLoading = useApplicationStore((state) => state.setLoading);
  const errorHandle = useErrorToast();
  const { t } = useTranslation();
  const { success: successToast } = useToast();
  const setReloadListService = useKtvStore((state) => state.setReloadListService);

  // mutate function lấy chi tiết dịch vụ để hiển thị chi tiết
  const { mutateAsync: mutateSetService } = useSetServiceMutation();

  const setService = useCallback(async (serviceId: string) => {
    setLoading(true);
    try {
      await mutateSetService(serviceId);
      setReloadListService(true);
      successToast({
        message: t('ktv.services.set_service_success'),
      });
    }catch (error) {
      setLoading(false);
      errorHandle(error);
    }finally {
      setLoading(false);
    }
  }, [t]);

  return {
    setService,
  };
};