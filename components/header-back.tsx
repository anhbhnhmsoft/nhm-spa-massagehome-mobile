import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { FC } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigationState } from '@react-navigation/core';
import { Icon } from '@/components/ui/icon';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

const HeaderBack: FC<{ title?: string; onBack?: () => void }> = ({ title, onBack }) => {
  const { t } = useTranslation();

  const insets = useSafeAreaInsets();
  const state = useNavigationState((s) => s);

  return (
    <View
      style={{ paddingTop: insets.top + 20 }}
      className={'flex flex-row items-center justify-between px-5 pb-4'}>
      <TouchableOpacity
        onPress={() => {
          if (onBack) {
            onBack();
          } else {
            if (state.routeNames.length > 0) {
              router.back();
            } else {
              router.replace('/');
            }
          }
        }}>
        <Icon as={ChevronLeft} size={24} color="black" />
      </TouchableOpacity>
      {title && <Text className={'text-lg font-bold'}>{t(title)}</Text>}
    </View>
  );
};

export default HeaderBack;
