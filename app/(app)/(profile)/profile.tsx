import {
  ChevronLeft,
  Camera,
  User as UserIcon,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomEditAvatar } from '@/components/app/profile-tab';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { Icon } from '@/components/ui/icon';
import { router } from 'expo-router';
import useAuthStore from '@/features/auth/store';
import { _Gender, _GenderMap } from '@/features/auth/const';
import dayjs from 'dayjs';

export default function UserProfile() {
  const { t } = useTranslation();
  const bottomEditAvatar = useRef<BottomSheetModal>(null);
  const user = useAuthStore((state) => state.user);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        {/* Header */}
        <View className="z-10 flex-row items-center justify-between  px-4 py-3">
          <TouchableOpacity className="p-1" onPress={() => router.back()}>
            <Icon as={ChevronLeft} size={24} className={'text-slate-800'} />
          </TouchableOpacity>
          <Text className="mr-8 flex-1 text-center text-lg font-bold text-slate-800">
            {t('profile.user_info_title')}
          </Text>
        </View>

        {/* Scrollable Content */}
        {user && (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}>
            {/* Avatar Section */}
            <View className="items-center justify-center py-8">
              <View className="relative">
                {user.profile.avatar_url && !imageError ? (
                  <Image
                    source={{ uri: user.profile.avatar_url }}
                    className="h-28 w-28 rounded-full border-4 border-white"
                    resizeMode="cover"
                    // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
                    onError={() => setImageError(true)}
                  />
                ) : (
                  // Fallback UI khi không có ảnh hoặc ảnh lỗi
                  <View className="h-28 w-28 rounded-full border-4 border-white bg-slate-200 items-center justify-center">
                    <Icon as={UserIcon} size={32} className={'text-slate-400'} />
                  </View>
                )}
                <TouchableOpacity
                  className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary-color-2 p-2"
                  onPress={() => bottomEditAvatar.current?.present()}>
                  <Camera size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form List */}
            <View className="px-4">
              <InfoItem label={t('common.full_name')} value={user.name || t('common.unknown')} />
              <InfoItem label={t('common.phone')} value={user.phone || t('common.unknown')} />
              <InfoItem
                label={t('common.gender')}
                value={t(_GenderMap[user.profile.gender || _Gender.MALE]) || t('common.unknown')}
              />
              <InfoItem
                label={t('common.date_of_birth')}
                value={
                  user.profile.date_of_birth
                    ? dayjs(user.profile.date_of_birth).format('DD/MM/YYYY')
                    : t('common.unknown')
                }
              />
              <View className={'flex-col items-start gap-2 py-4'}>
                <Text className="text-primary-color-3">{t('common.bio')}</Text>
                <Text className={`text-gray-600`}>{user.profile.bio || t('common.unknown')}</Text>
              </View>
            </View>

            {/* Footer Actions */}
            <View className="mt-6 items-center gap-4 space-y-4 px-4">
              <TouchableOpacity
                className="w-full items-center rounded-lg bg-primary-color-2/20 py-3"
                onPress={() => router.push('/(app)/(profile)/edit-profile')}
              >
                <Text className="font-bold text-primary-color-2">{t('profile.edit_info')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
      <BottomEditAvatar ref={bottomEditAvatar} canDelete={user?.profile.avatar_url !== null} />
    </>
  );
}

// Components phụ
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View className={'flex-row items-center justify-between border-b border-gray-400/40 py-4'}>
      <Text className="text-primary-color-3">{label}</Text>
      <Text className={`text-gray-600`}>{value}</Text>
    </View>
  );
}
