import React, { FC } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { Image } from 'expo-image';
import { TFunction } from 'i18next';

export const InviteIndividualHomepage: FC<{ t: TFunction }> = ({ t }) => {
  const redirectAuth = useCheckAuthToRedirect();

  return (
    <View className="mt-4 px-4">
      <View className="overflow-hidden rounded-[24px] bg-white p-1 shadow-sm border border-slate-100">
        <View className="w-full flex-row items-center bg-white py-3 gap-2">
          {/* === BUTTON 1: KỸ THUẬT VIÊN === */}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              redirectAuth({
                pathname: '/(app)/(customer)/(profile)/(register-partner)/register-technical',
                params: { isLeader: '0' },
              });
            }}
            className="flex-1 flex-row items-center px-2 gap-2"
          >
            <Image
              source={require('@/assets/images/image_ktv.png')}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
            />
            {/* Dùng flex-1 ở đây là chìa khóa để Text xuống dòng đúng */}
            <View className="flex-1">
              <Text className="font-inter-bold text-[13px] leading-tight text-base-color-1">
                {t('homepage.invite_ktv.title')}
              </Text>
              <Text className="font-inter-bold text-[13px] leading-tight text-base-color-1">
                {t('homepage.invite_ktv.description')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ĐƯỜNG KẺ CHIA ĐÔI */}
          <View className="h-8 w-[1px] bg-slate-200" />

          {/* === BUTTON 2: ĐỐI TÁC === */}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              redirectAuth("/(app)/(customer)/(profile)/(register-partner)/register-agency");
            }}
            className="flex-1 flex-row items-center px-2 gap-2"
          >
            <Image
              source={require('@/assets/images/image_agency.png')}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="font-inter-bold text-[13px] leading-tight text-base-color-1">
                {t('homepage.invite_partner.title')}
              </Text>
              <Text className="font-inter-bold text-[13px] leading-tight text-base-color-1">
                {t('homepage.invite_partner.description')}
              </Text>
            </View>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};