import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { MapPin } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';

const LocationRequiredScreen = () => {
  const {t} = useTranslation();

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <View className="w-20 h-20 bg-primary-color-2/10 rounded-full items-center justify-center mb-6">
        <MapPin size={40} color={DefaultColor.base['primary-color-2']} />
      </View>

      <Text className="text-2xl font-inter-bold text-slate-900 text-center">
        {t('permission.location.title')}
      </Text>

      <Text className="text-slate-500 text-center mt-4 mb-10 leading-6">
        {t('permission.location.message_for_ktv')}
      </Text>

      <TouchableOpacity
        onPress={openSettings}
        className="w-full bg-primary-color-2 py-4 rounded-full flex-row items-center justify-center"
      >
        <Text className="text-white font-inter-bold text-lg">
          {t('permission.location.go_to_settings')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationRequiredScreen;