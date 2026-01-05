import { useQueryGetConfigAffiliate } from '@/features/affiliate/hooks/use-query';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { getMessageError } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/features/auth/store';
import { router } from 'expo-router';


export const useAffiliateUser = () => {
  const { t } = useTranslation();
  const queryConfig = useQueryGetConfigAffiliate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // handle error
    if (queryConfig.error) {
      const message = getMessageError(queryConfig.error, t);
      if (message) {
        Alert.alert(message);
        router.back();
      }
    }
  }, [queryConfig.error]);

  return {
    config: queryConfig.data,
    affiliate_link: user?.affiliate_link || '',
  }
}