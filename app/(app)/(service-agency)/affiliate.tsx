import React from 'react';
import { View, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import QRCode from 'react-native-qrcode-svg';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import DefaultColor from '@/components/styles/color';
import { useAffiliateUser } from '@/features/affiliate/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBalance } from '@/lib/utils';

const ReferralScreen = () => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyClipboard();
  const { config, affiliate_link } = useAffiliateUser();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="affiliate.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Main Content Section */}
        <View className="p-4">
          <View className="mb-6 items-center">
            {/* Placeholder cho hình ảnh minh họa */}
            <View className="mb-4 h-48 w-full items-center justify-center rounded-2xl bg-gray-200">
              <Image
                source={require('@/assets/images/affliate.jpg')}
                style={{ width: '100%', height: '100%', borderRadius: 20 }}
              />
            </View>
            <Text className="mb-1 font-inter-semibold text-lg text-gray-700">
              {t('affiliate.title_1')}
            </Text>
            {config ? (
              <Text className="font-inter-bold text-3xl text-primary-color-2">
                {t('affiliate.title_2', { percent: formatBalance(config.commission_rate) || '0' })}
              </Text>
            ) : (
              <Skeleton className="h-12 w-full" />
            )}
          </View>

          {/* Thẻ "Cách hoạt động" */}
          <View className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <Text className="mb-4 font-inter-bold text-lg text-gray-800">
              {t('affiliate.referral_link')}
            </Text>
            <View className="items-center justify-center p-4">
              <QRCode
                value={affiliate_link}
                size={200}
                color={DefaultColor.base['primary-color-1']}
                backgroundColor="white"
              />
            </View>
            <View className="mb-4 flex-row items-center rounded-xl bg-gray-100 p-3">
              <Text className="flex-1 font-inter-medium text-gray-600" numberOfLines={1}>
                {affiliate_link}
              </Text>
              <TouchableOpacity
                className="ml-2 p-2"
                onPress={() => copyToClipboard(affiliate_link)}>
                <Ionicons name="copy-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="items-center rounded-xl bg-primary-color-2 py-4"
              onPress={async () => {
                try {
                  await Share.share({
                    message: affiliate_link,
                    url: affiliate_link,
                  });
                } catch {
                  Alert.alert(t('affiliate.share_error'));
                }
              }}>
              <Text className="font-inter-bold text-lg text-white">{t('affiliate.share')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferralScreen;
