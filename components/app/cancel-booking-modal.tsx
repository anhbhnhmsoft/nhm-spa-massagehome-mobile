import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface CancelModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export const CancellationModal = ({
  isVisible,
  onClose,
  onConfirm,
  isLoading,
}: CancelModalProps) => {
  const { t } = useTranslation();
  const [reason, setReason] = React.useState('');
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          {/* KeyboardAvoidingView giúp Modal không bị che khi bàn phím hiện lên */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full">
            <View className="w-full rounded-lg border-hairline border-border bg-white p-6 shadow-2xl">
              {/* Tiêu đề */}
              <Text className="mb-2 font-inter-bold text-xl text-base-color-1">
                {t('booking.cancel_reasons')}
              </Text>

              {/* Ô nhập liệu Textarea */}
              <View className="mb-6">
                <TextInput
                  placeholder={t('booking.enter_cancel_reason')}
                  placeholderTextColor="#90A1B9"
                  multiline
                  numberOfLines={5}
                  value={reason}
                  onChangeText={setReason}
                  textAlignVertical="top"
                  autoFocus={true}
                  className="min-h-[120px] rounded-md border-hairline border-primary-color-4 bg-base-color-3/20 p-4 font-inter-regular text-base-color-1"
                />
              </View>

              {/* Nhóm nút bấm */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="flex-1 items-center rounded-md bg-muted py-4">
                  <Text className="font-inter-semibold text-muted-foreground">
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onConfirm(reason)}
                  disabled={isLoading || reason.trim().length === 0}
                  activeOpacity={0.8}
                  className={`flex-1 items-center rounded-md py-4 ${
                    reason.trim().length === 0 ? 'bg-primary-color-4 opacity-50' : 'bg-destructive'
                  }`}>
                  <Text className="font-inter-semibold text-destructive-foreground">
                    {isLoading ? t('common.loading') : t('booking.confirm_cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
