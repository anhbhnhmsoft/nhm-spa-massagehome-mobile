import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigationState } from '@react-navigation/core';
import { Icon } from '@/components/ui/icon';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

const HeaderBack: FC<{ title?: string; onBack?: () => void }> = ({ title, onBack }) => {
  const { t } = useTranslation();
  const state = useNavigationState((s) => s);

  return (
    <View
      className={'flex-row items-center justify-between border-b border-gray-200 px-4 py-3 bg-white'}>
      <TouchableOpacity
        className="p-1"
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
        <Icon as={ChevronLeft} size={28} className="text-slate-800" />
      </TouchableOpacity>
      {title && <Text className={'text-lg font-inter-bold text-slate-800'}>{t(title)}</Text>}
      <View className="w-8" />
    </View>
  );
};

export default HeaderBack;
