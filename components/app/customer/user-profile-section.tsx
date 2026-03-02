import { useProfileCustomer } from '@/features/profile/hooks';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Settings, User as UserIcon, Wallet } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { formatBalance } from '@/lib/utils';

type Props = {
  user: ReturnType<typeof useProfileCustomer>['user'];
  dashboardData: ReturnType<typeof useProfileCustomer>['dashboardData'];
};
export const UserProfileSection: FC<Props> = ({ user, dashboardData }) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  return (
    <View className="py-4">
      {/* User Info */}
      <View className="flex-row items-center justify-between">
        {/* User Info */}
        <View className="flex-row items-center">
          {user && user.profile.avatar_url && !imageError ? (
            <Image
              source={{ uri: user.profile.avatar_url }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                borderWidth: 2,
                borderColor: 'white',
              }}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback UI khi không có ảnh hoặc ảnh lỗi
            <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-slate-200">
              <Icon as={UserIcon} size={24} className={'text-slate-400'} />
            </View>
          )}
          <View className="ml-3 gap-2">
            <Text className="font-inter-bold text-lg text-white">{user?.name || '-'} </Text>
            <Text className="text-xs text-blue-50">ID: {user?.id || '-'} </Text>
            {user?.referrer && (
              <View className="flex-row items-center">
                <Text className="text-xs text-teal-100">
                  {t('profile.referral_by')}: {user.referrer.name}
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* Action Icon */}
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.push('/(app)/(customer)/(profile)/profile')}>
            <Icon as={Settings} size={22} className={'text-white'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View className="mt-6 flex-row gap-4 px-2">
        <View className="flex-1 flex-row items-center justify-between">
          <View className="items-center">
            <Text className="font-inter-bold text-base text-white">
              {dashboardData?.wallet_balance ? formatBalance(dashboardData?.wallet_balance) : '-'}{' '}
              {t('common.currency')}{' '}
            </Text>
            <Text className="text-xs text-teal-100">{t('profile.balance')}</Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-bold text-base text-white">
              {dashboardData?.coupon_user_count ? dashboardData?.coupon_user_count : '0'}{' '}
            </Text>
            <Text className="text-xs text-teal-100">{t('profile.coupon')}</Text>
          </View>
        </View>
        <View className={'rounded- h-full w-[1px] bg-white/20'} />
        <Pressable
          className="flex-row items-center justify-center"
          onPress={() => router.push('/(app)/(customer)/(profile)/wallet')}>
          <Icon as={Wallet} size={22} className={'text-white'} />
          <Text className="ml-2 text-xs text-white">{t('profile.wallet')}</Text>
        </Pressable>
      </View>
    </View>
  );
};