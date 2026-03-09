import React, { useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { _ConfigKey, _ConfigKeyLabel } from '@/features/config/consts';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import { Image } from "expo-image";
import DefaultColor from '@/components/styles/color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetSupport } from '@/features/config/hooks';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  supportChanel: ReturnType<typeof useGetSupport>['supportChanel'];
};

const SupportModal = ({ isVisible, onClose, supportChanel }: Props) => {
  const { t } = useTranslation();
  const copyClipboard = useCopyClipboard();
  const inset = useSafeAreaInsets();

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
      default:
        return { label: '', icon: null };
    }
  }, [t]);

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
    }
  }, [t, copyClipboard]);

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 1. Vùng nhận diện nhấn ra ngoài để đóng modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end">
          {/* Bọc thêm một TouchableWithoutFeedback con để chặn sự kiện đóng khi nhấn vào trong modal */}
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                { paddingBottom: inset.bottom + 16 }
              ]}
              className="bg-white rounded-t-[32px] p-4"
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-lg font-inter-bold text-slate-800">{t('support.title')}</Text>
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
                {supportChanel?.map((item) => {
                  if (!item.value?.trim()) return null;
                  const info = getInfo(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => handlePress(item.key, item.value)}
                      activeOpacity={0.7}
                      style={styles.itemShadow}
                      className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-50"
                    >
                      <Image
                        source={info.icon}
                        style={styles.iconImage}
                      />
                      <View className="flex-1">
                        <Text className="text-base font-inter-bold text-slate-700">{info.label}</Text>
                        <Text className="text-slate-400 text-xs" numberOfLines={1}>
                          {item.value}
                        </Text>
                      </View>
                      <View className="bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Text className="text-[10px] font-inter-bold text-primary-color-2 uppercase">{t('common.open')}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// 2. Định nghĩa Shadow qua StyleSheet
const styles = StyleSheet.create({
  modalContainer: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  itemShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  }
});

export default SupportModal;