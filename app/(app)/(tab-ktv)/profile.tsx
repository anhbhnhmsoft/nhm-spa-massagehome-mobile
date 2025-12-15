import React, { useMemo, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  Gift,
  Headset,
  Wallet,
  Globe,
  User,
  Info,
  LogOut,
} from 'lucide-react-native';
import GradientBackground from '@/components/styles/gradient-background';
import { useProfile } from '@/features/user/hooks';
import { MenuProfileItem, UserProfileCard } from '@/components/app/profile-tab'; // Hàm format tiền
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import useApplicationStore from '@/lib/store';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { _LanguagesMap } from '@/lib/const';
import SelectLanguage from '@/components/select-language';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { t } = useTranslation();

  const { user } = useProfile();
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const selectedLang = useApplicationStore((state) => state.language);

  const languageSheetRef = useRef<BottomSheetModal>(null);

  const langConfig = useMemo(
    () => _LanguagesMap.find((lang) => lang.code === selectedLang),
    [selectedLang]
  );

  return (
    <View className="flex-1 bg-base-color-3">
      {/* 1. Header Background Màu Xanh */}
      <GradientBackground
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 0,
          height: 192,
          width: '100%',
        }}
        direction="horizontal"
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Spacer để đẩy nội dung xuống dưới Statusbar */}
        <View className="h-16" />

        {/* PROFILE CARD  */}
        {user && <UserProfileCard user={user} />}

        {/* 4. MENU LIST */}
        <View className="mx-4 mb-6 rounded-2xl bg-white px-4 py-2 shadow-sm">
          <MenuProfileItem
            icon={Wallet}
            onPress={() => router.push('/(app)/(profile)/wallet')}
            title={t('profile.wallet')}
          />
          <MenuProfileItem
            icon={User}
            title={t('profile.user_info')}
            onPress={() => router.push('/(app)/(profile)/profile')}
          />
          <MenuProfileItem
            icon={Globe}
            title={t('profile.language')}
            onPress={() => languageSheetRef.current?.present()}
            rightElement={
              <View className="flex-row items-center gap-1">
                <Image source={langConfig?.icon} className="h-4 w-4" />
                <Text className="text-xs text-slate-500">{langConfig?.label}</Text>
              </View>
            }
          />

          <MenuProfileItem icon={Info} title={t('profile.app_info')} />
          <MenuProfileItem icon={Headset} title={t('profile.support')} />
          <MenuProfileItem icon={LogOut} title={t('profile.log_out')} isLast />
        </View>

        {/* Footer Version */}
        <Text className="mb-6 text-center text-xs text-slate-400">
          {t('common.version')} {appVersion}
        </Text>
      </ScrollView>
      <SelectLanguage ref={languageSheetRef} />
    </View>
  );
}
