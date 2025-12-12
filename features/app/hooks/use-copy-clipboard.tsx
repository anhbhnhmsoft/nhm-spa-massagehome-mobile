import useToast from '@/features/app/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { useCallback } from 'react';
import { Alert } from 'react-native';

const useCopyClipboard = () => {
  const { t } = useTranslation();

  return useCallback(async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(t('common_success.copied_to_clipboard'))
  },[t]);
};
export default useCopyClipboard;
