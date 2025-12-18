import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import useResetNav from '@/features/app/hooks/use-reset-nav';

const HeaderBack: FC<{ title?: string; onBack?: () => void }> = ({ title, onBack }) => {
  const { t } = useTranslation();
  const resetNav = useResetNav();

  return (
    <View
      className={'flex-row items-center justify-between border-b border-gray-200 px-4 py-3 bg-white'}>
      <TouchableOpacity
        className="p-1"
        onPress={() => {
          if (onBack) {
            onBack();
          } else {
            if (router.canGoBack()) {
              router.back();
            } else {
              resetNav('/');
            }
          }
        }}>
        <Icon as={ChevronLeft} size={28} className="text-slate-800" />
      </TouchableOpacity>
      {title && <Text className={'text-lg font-inter-bold text-slate-800'}>{t(title)}</Text>}
      <View className="w-8" />
    </View>
  );
};

export default HeaderBack;
