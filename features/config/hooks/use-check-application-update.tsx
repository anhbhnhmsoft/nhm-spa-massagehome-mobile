import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useConfigApplicationQuery } from '@/features/config/hooks/use-query';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Alert, Linking, Platform } from 'react-native';
import { compareVersion } from '@/lib/utils';

/**
 * Hook để kiểm tra xem ứng dụng có được bảo trì hay không
 */
export const useCheckConfigApplicationUpdate = () => {
  const {t} = useTranslation();
  const [isMaintained, setMaintained] = useState<boolean>(false);

  const {data: dataConfig} = useConfigApplicationQuery(!__DEV__);

  const { isUpdatePending } = Updates.useUpdates();

  // Update OTA
  useEffect(() => {
    // Nếu đang Dev thì bỏ qua
    if (__DEV__) return;

    if (isUpdatePending) {
      Alert.alert(
        t('update.update_available.title'),
        t('update.update_available.message'),
        [
          {
            text: t('common.yes'),
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [isUpdatePending, t]);

  // Kiểm tra xem ứng dụng có được bảo trì hay không
  useEffect(() => {
    if (dataConfig){
      if (__DEV__) return;

      setMaintained(Boolean(dataConfig.maintenance ?? false));

      const currentVersion = Constants.expoConfig?.version || '1.0.0';

      let serverVersion = Platform.OS === 'ios' ? dataConfig.ios_version : dataConfig.android_version;
      let storeUrl = Platform.OS === 'ios' ? dataConfig.appstore_url : dataConfig.chplay_url;

      if (serverVersion && compareVersion(currentVersion, serverVersion) === -1) {
        Alert.alert(
          t('update.update_available.title'),
          t('update.update_available.message_update_version'),
          [
            {
              text: t('update.update_available.button_update'),
              onPress: () => {
                Linking.openURL(storeUrl)
              },
            },
          ],
          { cancelable: false }
        );
      }
    }
  }, [dataConfig, t]);

  return {
    isMaintained,
  }
}