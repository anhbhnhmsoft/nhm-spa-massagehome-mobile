import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';

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
  const [reason, setReason] = useState('');

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* Lớp nền overlay */}
        <View className="flex-1 justify-end bg-black/50 px-0 md:justify-center md:px-6">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full">
            {/* Nội dung Modal - Dùng Border thay cho Shadow để tránh lỗi Layout */}
            <View className="w-full rounded-t-[32px] border-l border-r border-t border-slate-200 bg-white p-8 md:rounded-[32px] md:border">
              {/* Thanh gạt nhỏ (Indicator) cho mobile */}
              <View className="absolute top-3 h-1.5 w-12 self-center rounded-full bg-slate-200" />

              {/* Header: Icon & Text */}
              <View className="mb-6 mt-4 items-center">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50">
                  <AlertCircle color="#EF4444" size={32} />
                </View>
                <Text className="text-center font-inter-bold text-2xl text-slate-900">
                  {t('booking.cancel_reasons')}
                </Text>
                <Text className="mt-2 px-6 text-center font-inter-regular leading-5 text-slate-500">
                  {t('booking.cancel_pending_note')}
                </Text>
              </View>

              {/* Input Area */}
              <View className="mb-8">
                <TextInput
                  placeholder={t('booking.enter_cancel_reason')}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={reason}
                  onChangeText={setReason}
                  textAlignVertical="top"
                  className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-5 font-inter-medium text-slate-800 focus:border-red-200"
                  style={{ fontSize: 16 }}
                />
              </View>

              {/* Action Buttons */}
              <View className="mb-4 flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  className="flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 py-4">
                  <Text className="font-inter-semibold text-base text-slate-600">
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onConfirm(reason)}
                  disabled={isLoading || reason.trim().length === 0}
                  activeOpacity={0.8}
                  className={`flex-1 items-center justify-center rounded-2xl border py-4 ${
                    reason.trim().length === 0
                      ? 'border-slate-200 bg-slate-200'
                      : 'border-red-600 bg-red-500'
                  }`}>
                  <Text className="font-inter-bold text-base text-white">
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
