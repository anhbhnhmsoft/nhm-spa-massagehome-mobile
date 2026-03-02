import { FC, forwardRef, useCallback, useMemo, useState, ReactNode } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import {
  Bell,
  Building2,
  ChevronRight,
  ClipboardList,
  HandCoins,
  Headphones,
  Heart,
  Info,
  LogOut,
  MapPin,
  RefreshCcw,
  Settings,
  Ticket,
  User as UserIcon,
  Wallet,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn, formatBalance, openAboutPage } from '@/lib/utils';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useChangeAvatar, useLogout } from '@/features/auth/hooks';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { ListLocationModal } from '@/components/app/location';
import { useApplicationStore } from '@/features/app/stores';
import { _LanguagesMap } from '@/lib/const';
import SelectLanguage from '@/components/app/select-language';
import Dialog from '@/components/ui/dialog';
import SupportModal from '@/components/app/support-modal';
import { useGetSupport } from '@/features/config/hooks';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';






// Bottom Edit image
export const BottomEditAvatar = forwardRef<
  BottomSheetModal,
  {
    canDelete?: boolean;
  }
>(({ canDelete }, ref) => {
  const { t } = useTranslation();

  const { takePictureCamera, chooseImageFormLib, deleteAvatar } = useChangeAvatar();

  // Cấu hình Backdrop (Lớp nền mờ đen phía sau)
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0} // Mở ở snap point đầu tiên (50%)
      snapPoints={[]}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#f5f5f5' }}
      handleIndicatorStyle={{ backgroundColor: 'white' }} // Màu cái thanh ngang nhỏ ở trên
    >
      <BottomSheetView className="flex-1 pb-5">
        <TouchableOpacity
          className={'flex-row items-center border-b border-gray-100 px-5 py-2 pb-4'}
          onPress={() => {
            takePictureCamera().finally(() => {
              (ref as any)?.current?.dismiss();
            });
          }}>
          <Text className="font-inter-medium text-lg text-slate-800">
            {t('profile.take_photo')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={'flex-row items-center border-b border-gray-100 px-5 py-2 pb-4'}
          onPress={() => {
            chooseImageFormLib().finally(() => {
              (ref as any)?.current?.dismiss();
            });
          }}>
          <Text className="font-inter-medium text-lg text-slate-800">
            {t('profile.choose_from_lib')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={'flex-row items-center px-5 py-2 pb-4'}
          onPress={() => {
            deleteAvatar();
            (ref as any)?.current?.dismiss();
          }}
          disabled={!canDelete}>
          <Text
            className={cn(
              'font-inter-medium text-lg text-red-500',
              !canDelete ? 'opacity-50' : ''
            )}>
            {t('profile.delete_avatar_title')}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
