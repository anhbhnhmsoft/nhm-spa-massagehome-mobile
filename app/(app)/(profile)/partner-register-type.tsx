import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Building2, User as UserIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import HeaderBack from '@/components/header-back';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

export default function PartnerRegisterTypeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="profile.join_partner" />

      <View className="flex-1 px-4 pt-4">
        <Text className="mb-6 font-inter-bold text-2xl text-slate-900">
          {t('profile.partner_register.title')}
        </Text>

        {/* Trưởng nhóm Kỹ thuật viên */}
        <TouchableOpacity
          className="mb-4 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          onPress={() => {
            router.push({
              pathname: '/(app)/(profile)/partner-register-individual',
              params: {
                is_leader: 'true',
              },
            });
          }}>
          <View className="flex-1 pr-3">
            <Text className="mb-1 font-inter-bold text-base text-slate-900">
              {t('profile.partner_register.individual_title')}
            </Text>
            <Text className="text-sm text-gray-600">
              {t('profile.partner_register.individual_desc')}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-color-2/10">
            <Icon as={UserIcon} size={26} className="text-primary-color-2" />
          </View>
        </TouchableOpacity>

        {/* Đại lý khu vực */}
        <TouchableOpacity
          className="mb-4 flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          onPress={() => {
            router.push('/(app)/(profile)/partner-register-agency');
          }}>
          <View className="flex-1 pr-3">
            <Text className="mb-1 font-inter-bold text-base text-slate-900">
              {t('profile.partner_register.agency_title')}
            </Text>
            <Text className="text-sm text-gray-600">
              {t('profile.partner_register.agency_desc')}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-color-2/10">
            <Icon as={Building2} size={26} className="text-primary-color-2" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


