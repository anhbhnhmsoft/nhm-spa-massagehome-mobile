import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Building2, HandCoins } from 'lucide-react-native';
import {Text} from '@/components/ui/text';
import { Card } from '@/components/ui/card';

// Đănt ký đối tác hoặc affilate
export const RegisterIndividualProfile = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-row flex-wrap justify-between">
      {/* Đăng ký làm đối tác */}
      <TouchableOpacity
        className="w-[48%]"
        onPress={() => {
          router.push('/(app)/(customer)/(profile)/partner-register-type');
        }}>
        <Card className="flex-row items-center">
          <View className="mr-3">
            <Icon as={Building2} size={24} className="text-primary-color-1" />
          </View>
          <View className="flex-1">
            <Text className="font-inter-bold text-sm text-gray-800" numberOfLines={2}>
              {t('profile.join_partner')}
            </Text>
            <Text className="text-[10px] text-gray-400" numberOfLines={1}>
              {t('profile.join_partner_desc')}
            </Text>
          </View>
        </Card>

      </TouchableOpacity>

      {/* Affiliate */}
      <TouchableOpacity
        className="w-[48%]"
        onPress={() => router.push('/(app)/(customer)/(profile)/affiliate')}
      >
        <Card className="flex-row items-center">
          <View className="mr-3">
            <Icon as={HandCoins} size={24} className="text-primary-color-1" />
          </View>
          <View className="flex-1">
            <Text className="font-inter-bold text-sm text-gray-800" numberOfLines={2}>
              {t('profile.partner_commission')}
            </Text>
            <Text className="text-[10px] text-gray-400" numberOfLines={1}>
              {t('profile.partner_commission_desc')}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
};