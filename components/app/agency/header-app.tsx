import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/stores';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import DefaultColor from '@/components/styles/color';
import { Bolt, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ModalInfo } from './modal-info';

export function HeaderAppAgency() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [imageError, setImageError] = useState(false);
  const [modalInfoVisible, setModalInfoVisible] = useState<boolean>(false);

  return (
    <>
      <View
        className="flex-row items-center justify-between bg-white px-4 pb-4"
        style={{
          paddingTop: insets.top + 12,
        }}>
        <View className="flex-row items-center gap-x-3">
          {/* Hiển thị ảnh đại diện */}
          {user && user.profile.avatar_url && !imageError ? (
            <Image
              source={{ uri: user?.profile.avatar_url }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 40,
                backgroundColor: DefaultColor.slate[200],
              }}
              contentFit={'cover'}
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback UI khi không có ảnh hoặc ảnh lỗi
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 40,
                backgroundColor: DefaultColor.slate[200],
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <User size={24} color={DefaultColor.slate[400]} />
            </View>
          )}
          <View>
            <Text className="text-xs text-slate-400">{t('header_app.hello')}</Text>
            <Text className="font-inter-bold text-lg text-black">{user?.name || 'Stranger'}</Text>
          </View>
        </View>
        {/* Hiển thị biểu tượng thông báo */}
        <TouchableOpacity
          className="relative h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-white"
          onPress={() => setModalInfoVisible(true)}>
          <Bolt size={22} color={DefaultColor.base['primary-color-2']} />
        </TouchableOpacity>
      </View>
      <ModalInfo isVisible={modalInfoVisible} onClose={() => setModalInfoVisible(false)} t={t} />
    </>
  );
}
