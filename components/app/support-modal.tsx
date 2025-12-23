import React, { useCallback } from 'react';
import { View, Modal, TouchableOpacity, Linking, Alert } from 'react-native';
import { X} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {Text} from '@/components/ui/text';
import { useGetSupport } from '@/features/config/hooks';
import { _ConfigKey, _ConfigKeyLabel } from '@/features/config/consts';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import {Image} from "expo-image";
import DefaultColor from '@/components/styles/color';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  supportChanel: ReturnType<typeof useGetSupport>['supportChanel'];
};

// Modal hiển thị các kênh hỗ trợ
const SupportModal = ({ isVisible, onClose, supportChanel }: Props) => {
  const {t} = useTranslation();
  const copyClipboard = useCopyClipboard();

  // Hàm lấy Icon và Tên hiển thị dựa trên Key
  const getInfo = useCallback((key: _ConfigKey) => {
    switch (key) {
      case _ConfigKey.SP_ZALO:
        return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/zalo.png') };
      case _ConfigKey.SP_FACEBOOK:
        return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/facebook.png') };
      case _ConfigKey.SP_WECHAT:
        return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/wechat.png') };
      case _ConfigKey.SP_PHONE:
        return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/phone.png') };
    }
  },[t]);

  const handlePress = useCallback(async (key: _ConfigKey, value: string) => {
    switch (key) {
      case _ConfigKey.SP_PHONE:
        await Linking.openURL(`tel:${value}`);
        break;
      case _ConfigKey.SP_ZALO:
      case _ConfigKey.SP_FACEBOOK:
        const supported = await Linking.canOpenURL(value);
        if (supported) {
          await Linking.openURL(value);
        } else {
          Alert.alert(t('common_error.error_alert_linking_message'));
        }
        break;
      case _ConfigKey.SP_WECHAT:
        await copyClipboard(value);
        break;
      default:
        break;
    }
  },[t]);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-[32px] p-6 pb-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-inter-bold text-slate-800">{t('support.title')}</Text>
              <Text className="text-slate-400 text-sm">{t('support.description')}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* List Items */}
          <View className="gap-4">
            {supportChanel && Array.isArray(supportChanel) && supportChanel.map((item) => {
              if (item.value.trim() === ''){
                return null;
              }
              const info = getInfo(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => handlePress(item.key, item.value)}
                  activeOpacity={0.7}
                  className="flex-row items-center bg-blue-50 p-4 rounded-2xl border border-slate-100"
                >
                  <Image
                    source={info.icon}
                    className="w-12 h-12 rounded-full"
                    style={{
                      borderWidth:1,
                      borderColor: DefaultColor.white,
                      backgroundColor: DefaultColor.white,
                      width: 48,
                      height: 48,
                      borderRadius: 9999,
                      marginRight: 16
                    }}
                  />

                  <View className="flex-1">
                    <Text className="text-base font-inter-bold text-slate-700">{info.label}</Text>
                    <Text className="text-slate-400 text-xs" numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>

                  <View className="bg-white p-2 rounded-lg shadow-sm">
                    <Text className="text-[10px] font-inter-bold text-primary-color-2 uppercase">{t('common.open')}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SupportModal;
