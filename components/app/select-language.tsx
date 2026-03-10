import { FC} from 'react';
import { TouchableOpacity, View, Image, Modal, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useSetLanguageUser } from '@/features/auth/hooks';
import DefaultColor from '@/components/styles/color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseBottomModal from '@/components/ui/base-bottom-modal';

const SelectLanguage:FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { setLanguage, selectedLang, isPending } = useSetLanguageUser(onClose);
  return (
    <SelectLanguageModal
      visible={visible}
      onClose={onClose}
      value={selectedLang}
      loading={isPending}
      onChange={(value) => setLanguage(value)}
    />
  );
};

export const SelectLanguageModal:FC<{
  visible: boolean;
  onClose: () => void;
  value: _LanguageCode;
  loading?: boolean;
  onChange: (lang: _LanguageCode) => void;
  closeOnSelect?: boolean;
}> = ({ value, loading, onChange, closeOnSelect, visible, onClose }) => {
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  return (
    <BaseBottomModal
      visible={visible}
      onClose={onClose}
      title={t('common.select_language')}
    >
      {loading ? (
        <View className={"flex-1 justify-center items-center"}>
          <ActivityIndicator size={"large"} color={DefaultColor.base['primary-color-1']} />
        </View>
      ) : _LanguagesMap.map((lang) => {
        const isSelected = value === lang.code;

        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => {
              onChange(lang.code);
              if (closeOnSelect) {
                onClose();
              }
            }}
            className="flex-row items-center border-b border-gray-50 py-4">
            {/* Cờ + Tên */}
            <View className="flex-1 flex-row items-center">
              <Image source={lang.icon} className="mr-2 h-6 w-6" />
              <Text
                className={cn(
                  'font-inter-medium text-base',
                  isSelected ? 'text-primary-color-1' : 'text-gray-700'
                )}>
                {lang.label}
              </Text>
            </View>

            {/* Radio Button */}
            <View
              className={cn(
                'h-6 w-6 items-center justify-center rounded-full border',
                isSelected
                  ? 'border-primary-color-2 bg-primary-color-2' // Màu xanh Spa khi chọn
                  : 'border-gray-300 bg-white' // Màu xám khi chưa chọn
              )}>
              {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />}
            </View>
          </TouchableOpacity>
        );
      })}
    </BaseBottomModal>
  );
};

export default SelectLanguage;
