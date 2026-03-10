import { useTranslation } from 'react-i18next';
import { useApplicationStore } from '@/features/app/stores';
import { useSetLanguageMutation } from '@/features/auth/hooks/use-mutation';
import useToast from '@/features/app/hooks/use-toast';
import { useAuthStore } from '@/features/auth/stores';
import { useCallback } from 'react';
import { _LanguageCode } from '@/lib/const';
import { queryClient } from '@/lib/provider/query-provider';
import { _AuthStatus } from '@/features/auth/const';
import useResetNav from '@/features/app/hooks/use-reset-nav';

/**
 * Hook để set ngôn ngữ user
 */
export const useSetLanguageUser = (onClose?: () => void) => {
  const { t } = useTranslation();
  // Lấy ngôn ngữ hiện tại từ store
  const selectedLang = useApplicationStore((state) => state.language);

  // Lấy hàm set ngôn ngữ từ store
  const setLanguageStore = useApplicationStore((state) => state.setLanguage);

  // Lấy hàm set ngôn ngữ từ API
  const { mutate, isPending } = useSetLanguageMutation();

  const { error: errorToast } = useToast(!!onClose);

  const resetNav = useResetNav();

  // Kiểm tra xem user đăng nhập chưa
  const status = useAuthStore((state) => state.status);

  const syncLanguage = useCallback(async (lang: _LanguageCode) => {
    try {
      // Sau khi set ngôn ngữ thành công thì set ngôn ngữ vào store
      await setLanguageStore(lang);

      // Sau khi set ngôn ngữ thành công thì clear cache
      await queryClient.resetQueries();

      if (onClose) {
        onClose();
      }
      // Sau khi set ngôn ngữ thành công thì reset lại navigation để cập nhật ngôn ngữ mới
      resetNav("/");
    } catch {
    }
  }, [setLanguageStore, queryClient, onClose, resetNav]);

  // Hook để set ngôn ngữ user
  const setLanguage = useCallback(
    async (lang: _LanguageCode) => {
      // Nếu user đã đăng nhập thì gọi API để set ngôn ngữ
      if (status === _AuthStatus.AUTHORIZED) {
        // Gọi API để set ngôn ngữ
        mutate({ lang }, {
            onSuccess: async () => {
              await syncLanguage(lang);
            },
            onError: () => {
              errorToast({
                message: t('common_error.failed_to_set_language'),
              });
            },
          },
        );
      }
      else {
        await syncLanguage(lang);
      }
    },
    [status, syncLanguage]
  );

  return {
    setLanguage,
    selectedLang,
    isPending,
  };
};