import { Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Text } from '@/components/ui/text';
import React, { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetSupport } from '@/features/config/hooks';
import useApplicationStore from '@/lib/store';
import { _LanguagesMap } from '@/lib/const';
import { useLogout } from '@/features/auth/hooks';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/icon';
import { Bell, Headphones, Info, LogOut, UserPen, Wallet } from 'lucide-react-native';
import { ListLocationModal } from '@/components/app/location';
import SelectLanguage from '@/components/select-language';
import SupportModal from '@/components/app/support-modal';
import Dialog from '@/components/dialog';
import { router } from 'expo-router';

type ModalInfoProps = {
  isVisible: boolean;
  onClose: () => void;
};
export const ModalInfo: FC<ModalInfoProps> = ({ isVisible, onClose }) => {
  // State quản lý Dialog logout
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  // Hàm logout kèm đóng dialog
  const logout = useLogout();
  const handleLogout = () => {
    logout();
    setLogoutModalOpen(false);
  };

  return (
    <>
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback>
              <View className="w-full rounded-t-3xl bg-white">
                <FeatureList onClose={onClose} setLogoutModalOpen={setLogoutModalOpen} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Đưa Dialog ra ngoài Modal để không bị che */}
      <Dialog
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="profile.log_out_title"
        description="profile.log_out_desc"
        onConfirm={handleLogout}
      />
    </>
  );
};

export const FeatureList = ({
  onClose,
  setLogoutModalOpen,
}: {
  onClose: () => void;
  setLogoutModalOpen: (v: boolean) => void;
}) => {
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

  const [modalLangVisible, setModalLangVisible] = useState<boolean>(false);

  return (
    <>
      <View className="mt-3 flex-row flex-wrap justify-start p-4">
        <View className="mb-3 w-full">
          <Text className="font-inter-bold text-gray-800">{t('profile.common_features')}</Text>
        </View>

        {/* Edit info */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => {
            onClose();
            router.push('/(app)/(service-ktv)/edit-info');
          }}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={UserPen} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.edit_info')}</Text>
        </TouchableOpacity>

        {/* Wallet */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => {
            onClose();
            router.push('/(app)/(service-ktv)/wallet');
          }}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Wallet} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.wallet')}</Text>
        </TouchableOpacity>

        {/* Ngôn ngữ */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
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
        <TouchableOpacity className="mb-2 w-[25%] items-center">
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Info} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.app_info')}</Text>
        </TouchableOpacity>

        {/* Hỗ trợ khách hàng */}
        <TouchableOpacity className="mb-2 w-[25%] items-center" onPress={() => openSupportModal()}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Headphones} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.support')}</Text>
        </TouchableOpacity>

        {/* Thông báo */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => {
            onClose();
            router.push('/(app)/(notification)/notificaton');
          }}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Bell} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.notification')}</Text>
        </TouchableOpacity>

        {/* Đăng xuất */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => {
            onClose();
            setLogoutModalOpen(true);
          }}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={LogOut} size={24} className="text-red-500" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.log_out')}</Text>
        </TouchableOpacity>
      </View>

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
    </>
  );
};
