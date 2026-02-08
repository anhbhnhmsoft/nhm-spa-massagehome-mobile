import React from 'react';
import { View} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {Text} from "@/components/ui/text";
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export default function MaintenanceScreen() {

  const {t} = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-6">
        {/* --- ICON MINH HỌA --- */}
        <View className="bg-orange-50 p-8 rounded-full mb-8 shadow-sm">
          <MaterialCommunityIcons name="tools" size={80} color="#f97316" />
        </View>

        {/* --- TIÊU ĐỀ --- */}
        <Text className="text-2xl font-inter-bold text-gray-800 text-center mb-3">
          {t('update.maintenance.title')}
        </Text>

        {/* --- NỘI DUNG --- */}
        <Text className="text-base text-gray-500 text-center mb-8 leading-6">
          {t('update.maintenance.message')}
        </Text>
      </View>

      {/* --- FOOTER (Optional) --- */}
      <View className="pb-8">
        <Text className="text-center text-gray-400 text-xs">
          Version {Constants.expoConfig?.version || '1.0.0'} • Build {dayjs().format('YYYY')}
        </Text>
      </View>
    </SafeAreaView>
  );
}