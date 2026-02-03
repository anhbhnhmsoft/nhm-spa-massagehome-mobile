import { useTranslation } from 'react-i18next';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import { useAffiliateUser } from '@/features/affiliate/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { Alert, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/components/ui/text';
import QRCode from 'react-native-qrcode-svg';
import DefaultColor from '@/components/styles/color';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';

const BANNER_DEFAULT = require('@/assets/images/affliate.jpg');

const AffiliateComponent = () => {
  const { t } = useTranslation();

  const [useBanner, setUseBanner] = useState(false);

  const copyToClipboard = useCopyClipboard();

  const { config, affiliate_link, loading } = useAffiliateUser();


  useEffect(() => {
    if (config && config?.banner?.image_url) {
      setUseBanner(true);
    }else{
      setUseBanner(false);
    }
  }, [config]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="affiliate.title" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Main Content Section*/}
        <View className="p-4">
          <View className="items-center mb-2">
            {/* Placeholder cho hình ảnh minh họa */}
            <View className="w-full h-48 bg-gray-200 rounded-2xl mb-4 items-center justify-center">
              <Image
                source={
                  useBanner ? {
                    uri: config?.banner?.image_url,
                  } : BANNER_DEFAULT
                }
                style={{ width: '100%', height: '100%', borderRadius: 20 }}
                onError={() => setUseBanner(false)}
              />
            </View>
          </View>

          {/* Thẻ "Cách hoạt động" */}
          <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
            <Text className="text-lg font-inter-bold text-gray-800 mb-4">
              {t('affiliate.referral_link')}
            </Text>
            <View className="justify-center items-center p-4">
              <QRCode
                value={affiliate_link}
                size={200}
                color={DefaultColor.base['primary-color-1']}
                backgroundColor="white"
              />
            </View>
            <View className="flex-row items-center bg-gray-100 p-3 rounded-xl mb-4">
              <Text className="text-gray-600 font-inter-medium flex-1" numberOfLines={1}>{affiliate_link}</Text>
              <TouchableOpacity className="ml-2 p-2" onPress={() => copyToClipboard(affiliate_link)}>
                <Ionicons name="copy-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-primary-color-2 py-4 rounded-xl items-center"
              onPress={async () => {
                try {
                  await Share.share({
                    message: affiliate_link,
                    url: affiliate_link,
                  });
                } catch {
                  Alert.alert(t('affiliate.share_error'));
                }
              }}
            >
              <Text className="text-white text-lg font-inter-bold">{t('affiliate.share')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AffiliateComponent;
