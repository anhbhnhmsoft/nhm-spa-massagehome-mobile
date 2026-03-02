import React from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { MotiView, AnimatePresence } from 'moti';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  cancelText?: string;
  confirmText?: string;
}

const Dialog = ({
                                isOpen,
                                onClose,
                                title,
                                description,
                                onConfirm,
                                isLoading = false,
                                cancelText = '',
                                confirmText = '',
                              }: ConfirmDialogProps) => {
  const {t} = useTranslation();
  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={onClose}
      // QUAN TRỌNG: Giúp Modal tràn lên cả thanh pin/sóng trên Android
      statusBarTranslucent
    >
      <AnimatePresence>
        {isOpen && (
          // View này phải là View thường, không dùng SafeAreaView ở đây
          <View style={styles.fullScreenOverlay}>

            {/* BACKDROP - Phủ kín toàn bộ */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onTouchStart={!isLoading ? onClose : undefined}
            />

            {/* DIALOG CONTENT */}
            <View
              className="w-[85%] max-w-[340px] rounded-[32px] bg-white p-6 shadow-2xl"
            >
              <View className="mb-6 items-center">
                <Text className="text-center font-inter-bold text-[20px] text-slate-900">
                  {title}
                </Text>
                {description && (
                  <Text className="mt-3 text-center font-inter-medium text-[15px] leading-6 text-slate-500">
                    {description}
                  </Text>
                )}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  disabled={isLoading}
                  onPress={onClose}
                  className="h-14 flex-1 items-center justify-center rounded-2xl bg-slate-100"
                >
                  <Text className="font-inter-bold text-[16px] text-slate-600">
                    {cancelText || t('common.no')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isLoading}
                  onPress={onConfirm}
                  className="h-14 flex-1 items-center justify-center rounded-2xl bg-primary-color-2"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="font-inter-bold text-[16px] text-white">
                      {confirmText || t('common.yes')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </AnimatePresence>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});

export default Dialog;