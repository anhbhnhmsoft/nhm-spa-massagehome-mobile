import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '@/components/styles/gradient-background';
import useAuthStore from '@/features/auth/store';
import { TouchableOpacity, View } from 'react-native';
import {Text} from '@/components/ui/text';
import { Image } from 'expo-image';
import DefaultColor from '@/components/styles/color';
import { Bell, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';


export function HeaderAppKTV() {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [imageError, setImageError] = useState(false);


  return (
    <>
      <GradientBackground
        style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 10, zIndex: 10 }}
      >
        <View className="mb-4 mt-2 flex-row items-center justify-between gap-8">
          <View className="flex-row items-center gap-x-3">
            {/* Hiển thị ảnh đại diện */}
            {user && user.profile.avatar_url && !imageError ? (
              <Image
                source={{ uri: user?.profile.avatar_url }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 40,
                  backgroundColor: DefaultColor.slate[200]
                }}
                contentFit={"cover"}
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
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <User size={24} color={DefaultColor.slate[400]} />
              </View>
            )}
            <View>
              <Text className="text-white text-xs">{t('header_app.hello')}</Text>
              <Text className="text-lg font-inter-bold text-white">{user?.name || 'Stranger'}</Text>
            </View>
          </View>
          {/* Hiển thị biểu tượng thông báo */}
          <TouchableOpacity className="relative">
            <Icon as={Bell} size={24} className="text-white" />
            {/* Dấu chấm đỏ thông báo */}
            <View className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#1d4ed8] bg-red-500" />
          </TouchableOpacity>
        </View>
      </GradientBackground>
    </>
  );
}

