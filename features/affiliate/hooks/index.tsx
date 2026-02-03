import {
  useQueryGetConfigAffiliate,
  useQueryMatchAffiliate,
} from '@/features/affiliate/hooks/use-query';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { getMessageError, goBack } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/features/auth/store';
import { router } from 'expo-router';
import useToast from '@/features/app/hooks/use-toast';
import { useReferralStore } from '@/features/affiliate/store';

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
        goBack();
      }
    }
  }, [queryConfig.error]);

  return {
    config: queryConfig.data,
    loading: queryConfig.isLoading || queryConfig.isRefetching,
    affiliate_link: user?.affiliate_link || '',
  };
};

export const useCheckMatchAffiliate = () => {
  const { data } = useQueryMatchAffiliate();
  const setUserReferral = useReferralStore((state) => state.setUserReferral);
  const { success } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!data) return;

    const handleSaveReferral = () => {
      // 1. Kiểm tra status là true và need_register là true
      if (data?.status && !!data?.user_referral) {
        if (data?.need_register) {
          setUserReferral(data.user_referral);
          router.push({ pathname: '/(auth)' });
        } else {
          success({
            message: t('affiliate.referred_by', {
              name: data.user_referral.name,
            }),
          });
        }
      }
    };

    handleSaveReferral();
  }, [data]);
};
