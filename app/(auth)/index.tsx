import React, { useMemo, useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import useApplicationStore from '@/lib/store';
import { _APP_NAME, _LanguagesMap } from '@/lib/const';
import SelectLanguage from '@/components/select-language';
import { router } from 'expo-router';


export default function Index() {
  const { t } = useTranslation();

  const selectedLang = useApplicationStore((state) => state.language);

  const [modalLangVisible, setModalLangVisible] = useState<boolean>(false);

  const langConfig = useMemo(
    () => _LanguagesMap.find((lang) => lang.code === selectedLang),
    [selectedLang]
  );

  return (
    <>
      <View className="flex-1 bg-[#4A3B32]">
        {/* 1. BACKGROUND LAYER */}
        <Image
          source={require('@/assets/images/bg-index.png')}
          className="absolute inset-0 h-full w-full opacity-60"
          resizeMode="cover"
        />
        {/* 2. MAIN CONTENT LAYER */}
        <SafeAreaView className="flex-1">
          {/* Header: Close & Language */}
          <View className="flex-row items-center justify-between px-5 pt-4">
            {/* Close Button */}
            <TouchableOpacity className="p-2" onPress={() => router.back()}>
              <X color="white" size={28} />
            </TouchableOpacity>

            {/* Language Button */}
            <TouchableOpacity
              className="flex-row items-center rounded-full border border-white/30 bg-white/20 px-3 py-1.5 backdrop-blur-md"
              onPress={() => setModalLangVisible(true)}
            >
              <Image source={langConfig?.icon} className="mr-2 h-6 w-6" />
              <Text className="mr-1 font-inter-medium text-white">{langConfig?.label}</Text>
              <ChevronDown color="white" size={16} />
            </TouchableOpacity>
          </View>

          {/* Center: Logo & Slogan */}
          <View className="mt-10 items-center px-4">
            <Text className="text-4xl font-inter-bold tracking-wider text-white mb-4">
              {_APP_NAME}
            </Text>

            <Text className="text-center text-lg font-inter-medium leading-7 text-white">
              {t('auth.index_label')}
            </Text>
          </View>
        </SafeAreaView>

        {/* 3. BOTTOM SHEET ACTION AREA */}
        <View className="z-10 items-center rounded-t-[32px] bg-white px-6 pb-10 pt-8 shadow-2xl">
          {/* Nút Login / Register (Primary Button) */}
          <TouchableOpacity
            className="w-full items-center rounded-full bg-primary-color-2 py-4 shadow-sm active:opacity-90"
            onPress={() => router.push('/(auth)/auth')}
          >
            <Text className="text-lg font-inter-bold text-white">{t('auth.btn_login_register')}</Text>
          </TouchableOpacity>

          {/* Nút Skip (Ghost Button) */}
          <TouchableOpacity className="mt-5 py-2" onPress={() => router.back()}>
            <Text className="text-lg font-inter-medium text-primary-color-2">{t('common.skip')}</Text>
          </TouchableOpacity>

          {/* Legal Text */}
          <Text className="mt-8 px-4 text-center text-xs leading-5 text-gray-400">
            {t('auth.index_label_2')}
          </Text>
        </View>
      </View>
      <SelectLanguage
        visible={modalLangVisible}
        onClose={() => setModalLangVisible(false)}
      />
    </>
  );
}
