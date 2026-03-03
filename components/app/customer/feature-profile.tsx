import { useTranslation } from 'react-i18next';
import { useGetSupport } from '@/features/config/hooks';
import { useMemo, useState } from 'react';
import { useApplicationStore } from '@/features/app/stores';
import { _LanguagesMap } from '@/lib/const';
import { useLogout } from '@/features/auth/hooks';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Bell, Headphones, Info, LogOut, MapPin } from 'lucide-react-native';
import { openAboutPage } from '@/lib/utils';
import { router } from 'expo-router';
import { ListLocationModal } from '@/components/app/location';
import SelectLanguage from '@/components/app/select-language';
import SupportModal from '@/components/app/support-modal';
import Dialog from '@/components/ui/dialog';
import {Image} from "expo-image";
import {Text} from "@/components/ui/text";
import { Card } from '@/components/ui/card';


export const FeatureProfile = () => {
  const { t } = useTranslation();

  // Quản lý địa chỉ
  const [visibleLocation, setVisibleLocation] = useState(false);

  // Hỗ trợ
  const {
    visible: visibleSupport,
    openSupportModal,
    closeSupportModal,
    supportChanel,
  } = useGetSupport();

  // Xử lý ngôn ngữ
  const selectedLang = useApplicationStore((state) => state.language);
  const langConfig = useMemo(
    () => _LanguagesMap.find((lang) => lang.code === selectedLang),
    [selectedLang]
  );

  // Xử lý đăng xuất
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  // modal lang
  const [modalLangVisible, setModalLangVisible] = useState(false);

  const logout = useLogout();

  return (
    <>
      <Card
        containerClassName="mt-3"
        className="flex-row flex-wrap justify-start"
        title={t('profile.common_features')}
      >
        {/* Quản lý địa chỉ */}
        <TouchableOpacity
          className="mb-3 w-[33%] items-center"
          onPress={() => setVisibleLocation(true)}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={MapPin} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.manage_address')}</Text>
        </TouchableOpacity>

        {/* Ngôn ngữ */}
        <TouchableOpacity
          className="mb-3 w-[33%] items-center"
          onPress={() => setModalLangVisible(true)}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Image
              source={langConfig?.icon}
              style={{
                width: 24,
                height: 24,
              }}
            />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.language')}</Text>
        </TouchableOpacity>

        {/* Thông tin ứng dụng */}
        <TouchableOpacity className="mb-3 w-[33%] items-center" onPress={() => openAboutPage()}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Info} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.app_info')}</Text>
        </TouchableOpacity>

        {/* Hỗ trợ khách hàng */}
        <TouchableOpacity className="mb-3 w-[33%] items-center" onPress={() => openSupportModal()}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Headphones} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.support')}</Text>
        </TouchableOpacity>

        {/* Thông báo */}
        <TouchableOpacity
          className="mb-3 w-[33%] items-center"
          onPress={() => router.push('/(app)/(notification)/notification')}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Bell} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.notification')}</Text>
        </TouchableOpacity>

        {/* Đăng xuất */}
        <TouchableOpacity
          className="mb-3 w-[33%] items-center"
          onPress={() => setLogoutModalOpen(true)}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={LogOut} size={24} className="text-red-500" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.log_out')}</Text>
        </TouchableOpacity>
      </Card>

      {/* Quản lý địa chỉ */}
      <ListLocationModal visible={visibleLocation} onClose={() => setVisibleLocation(false)} />

      {/* Ngôn ngữ */}
      <SelectLanguage visible={modalLangVisible} onClose={() => setModalLangVisible(false)} />

      {/* Hỗ trợ khách hàng */}
      <SupportModal
        isVisible={visibleSupport}
        onClose={closeSupportModal}
        supportChanel={supportChanel}
      />

      {/* Đăng xuất */}
      <Dialog
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title={t('profile.log_out_title')}
        description={t('profile.log_out_desc')}
        onConfirm={() => {
          setLogoutModalOpen(false)
          logout();
        }}
      />
    </>
  );
};