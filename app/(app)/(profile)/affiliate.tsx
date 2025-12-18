import React from 'react';
import { View,  ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import useAuthStore from '@/features/auth/store';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import QRCode from 'react-native-qrcode-svg';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import DefaultColor from '@/components/styles/color';

// Giả lập dữ liệu danh sách giới thiệu từ image_2.png
const referralList = [
  { id: 1, phone: '*******858', date: '17/12/2025' },
];

const ReferralScreen = () => {
  const {t} = useTranslation();
  const copyToClipboard = useCopyClipboard();
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Main Content Section - lấy cảm hứng từ image_2.png */}
        <View className="p-4">
          <View className="items-center mb-6">
            {/* Placeholder cho hình ảnh minh họa */}
            <View className="w-full h-48 bg-gray-200 rounded-2xl mb-4 items-center justify-center">
              <Image
                source={require('@/assets/images/affliate.jpg')}
                style={{ width: '100%', height: '100%', borderRadius: 20 }}
              />
            </View>
            <Text className="text-gray-700 text-lg font-inter-semibold mb-1">
              {t('affiliate.title_1')}
            </Text>
            <Text className="text-primary-color-2 text-3xl font-inter-bold">
              {t('affiliate.title_2', { percent: '30' })}
            </Text>
          </View>

          {/* Thẻ "Cách hoạt động" */}
          <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
            <Text className="text-lg font-inter-bold text-gray-800 mb-4">
              {t('affiliate.referral_link')}
            </Text>
            <View className="justify-center items-center p-4">
              <QRCode
                value={user?.affiliate_link ?? ''}
                size={200}
                color={DefaultColor.base['primary-color-1']}
                backgroundColor="white"
              />
            </View>
            <View className="flex-row items-center bg-gray-100 p-3 rounded-xl mb-4">
              <Text className="text-gray-600 font-inter-medium flex-1" numberOfLines={1}>{user?.affiliate_link ?? ''}</Text>
              <TouchableOpacity className="ml-2 p-2" onPress={() => copyToClipboard(user?.affiliate_link ?? '')}>
                <Ionicons name="copy-outline" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="bg-primary-color-2 py-4 rounded-xl items-center"
              onPress={async () => {
                try {
                  await Share.share({
                    message: user?.affiliate_link ?? '',
                    url: user?.affiliate_link ?? '',
                  });
                }catch {
                  // do nothing
                }
              }}

            >
              <Text className="text-white text-lg font-bold">Mời ngay</Text>
            </TouchableOpacity>
          </View>
          {/* Thẻ "Danh sách giới thiệu" */}
          <View className="bg-white p-4 rounded-2xl shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-4">Danh sách giới thiệu</Text>
            <View className="flex-row justify-between mb-2 border-b border-gray-100 pb-2">
              <Text className="text-gray-500 font-medium">Số điện thoại</Text>
              <Text className="text-gray-500 font-medium">Ngày</Text>
            </View>
            {referralList.map((item) => (
              <View key={item.id} className="flex-row justify-between py-3 border-b border-gray-100">
                <Text className="text-gray-800 font-bold">{item.phone}</Text>
                <Text className="text-gray-600">{item.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReferralScreen;