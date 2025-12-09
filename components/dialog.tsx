import React from 'react';
import { View } from 'react-native';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; // Đường dẫn tới file alert-dialog gốc của RNR
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import GradientBackground from '@/components/styles/gradient-background';

interface ConfirmDialogProps {
  // Trạng thái mở/đóng
  isOpen: boolean;
  onClose: () => void;

  // Nội dung
  title: string;
  description?: string;

  // Hành động
  onConfirm: () => void;
  isLoading?: boolean; // Để hiện loading khi đang xử lý

  // Custom nút
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
                                cancelText = 'common.cancel',
                                confirmText = 'common.accept',
                              }: ConfirmDialogProps) => {
  const {t} = useTranslation();


  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90%] p-0 max-w-[400px] bg-transparent border-0">
        <GradientBackground className="w-full p-6" style={{borderRadius: 16}}>
          {/* --- HEADER --- */}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-inter-bold text-white">
              {t(title)}
            </AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-white mt-2 text-base">
                {t(description)}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {/* --- FOOTER (BUTTONS) --- */}
          <AlertDialogFooter className="mt-6 flex-row gap-3 justify-end">

            {/* Nút Hủy */}
            <AlertDialogCancel
              onPress={onClose}
              disabled={isLoading}
              className="mt-0" // Reset margin top mặc định của mobile nếu có
            >
              <Text className={"font-inter-bold"}>
                {t(cancelText)}
              </Text>
            </AlertDialogCancel>

            {/* Nút Xác nhận */}
            <AlertDialogAction
              onPress={handleConfirm}
              disabled={isLoading}
              className={cn('bg-[#10B981]',
                isLoading ? 'opacity-70' : ''
              )}
            >
              <Text className={"text-white font-inter-bold"}>
                {isLoading ? t('common.loading') : t(confirmText)}
              </Text>
            </AlertDialogAction>

          </AlertDialogFooter>
        </GradientBackground>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Dialog;


