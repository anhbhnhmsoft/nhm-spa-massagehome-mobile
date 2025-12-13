import React, { FC, useState, ReactNode, JSX, forwardRef, useCallback } from 'react';
import { User } from '@/features/auth/types';
import { Image, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Gift, Star, User as UserIcon, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { _UserRole } from '@/features/auth/const';
import { cn } from '@/lib/utils';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { useChangeAvatar } from '@/features/auth/hooks';
import { Icon } from '@/components/ui/icon';

// USER PROFILE CARD
type UserProfileCardProps = {
  user: User;
};
export const UserProfileCard: FC<UserProfileCardProps> = ({ user }) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  return (
    <View className="mx-4 mb-6 rounded-2xl bg-white p-4 shadow-sm">
      {/* User Info */}
      <View className="mb-4 flex-row items-center">
        {user.profile.avatar_url && !imageError ? (
          <Image
            source={{ uri: user.profile.avatar_url }}
            className="mr-3 h-14 w-14 rounded-full bg-slate-200"
            resizeMode="cover"
            // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI khi không có ảnh hoặc ảnh lỗi
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-slate-200">
            <Icon as={UserIcon} size={24} className={'text-slate-400'} />
          </View>
        )}
        <View>
          <Text className="font-inter-bold text-lg text-slate-800">{user.phone}</Text>
          <Text className="text-sm text-slate-500">{user.name}</Text>
        </View>
      </View>

      {/* Banner Đăng ký đối tác và Affiliate */}
      <View className="mb-6 flex-row gap-3">
        {/* Card 1: Register Partner */}
        {![_UserRole.KTV, _UserRole.AGENCY].includes(user.role) && (
          <TouchableOpacity className="relative h-32 flex-1 justify-between overflow-hidden rounded-2xl bg-[#FFF4E6] p-4">
            <View>
              <Text className="text-sm font-bold text-gray-900">
                {t('profile.partner_register_1')}
              </Text>
              <Text className="text-sm font-bold text-gray-900">
                {t('profile.partner_register_2')}
              </Text>
            </View>
            <View className="mt-2 h-8 w-8 items-center justify-center rounded-full bg-orange-400">
              <ChevronRight size={18} color="white" />
            </View>
            <View className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-orange-200 opacity-50" />
          </TouchableOpacity>
        )}
        {/* Card 2: Commission */}
        <TouchableOpacity className="relative h-32 flex-1 justify-between overflow-hidden rounded-2xl bg-[#E6F4EA] p-4">
          <View>
            <Text className="text-sm font-bold text-green-800">
              {t('profile.partner_commission_1')}
            </Text>
            <Text className="text-sm font-bold text-green-800">
              {t('profile.partner_commission_2')}
            </Text>
          </View>
          <View className="mt-2 h-8 w-8 items-center justify-center rounded-full bg-green-600">
            <ChevronRight size={18} color="white" />
          </View>
          <View className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-green-200 opacity-50" />
        </TouchableOpacity>
      </View>

      {/* Banner Giới thiệu (Màu Xám Xanh) */}
      <View className="flex-row items-center justify-between rounded-xl bg-slate-100 p-3">
        <View className="mr-2 flex-1 flex-row items-center gap-2">
          <View className="rounded-lg bg-[#1d4ed8] p-1.5">
            <Gift size={14} color="white" />
          </View>
          <Text className="flex-1 text-[11px] font-medium leading-4 text-slate-600">
            {t('profile.partner_commission_3')}
          </Text>
        </View>
      </View>
    </View>
  );
};

// MENU PROFILE ITEM
type MenuProfileItemProps = {
  icon: any;
  title: string;
  rightElement?: ReactNode;
  isLast?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};
export const MenuProfileItem: FC<MenuProfileItemProps> = ({
  icon: Icon,
  title,
  rightElement,
  isLast,
  onPress,
  disabled,
}) => (
  <TouchableOpacity
    className={cn(
      'flex-row items-center py-4',
      !isLast ? 'border-b border-slate-100' : '',
      disabled ? 'opacity-50' : '',
    )}
    onPress={onPress}
    disabled={disabled}>
    {/* Icon bên trái có nền xám tròn */}
    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-slate-100">
      <Icon size={18} color="#475569" />
    </View>

    <Text className="flex-1 text-sm font-semibold text-slate-700">{title}</Text>

    {/* Phần bên phải (cờ, text...) */}
    {rightElement && <View className="mr-2">{rightElement}</View>}

    <ChevronRight size={18} color="#cbd5e1" />
  </TouchableOpacity>
);


// Bottom Edit image
export const BottomEditAvatar = forwardRef<BottomSheetModal,{
  canDelete?: boolean;
}>(({canDelete}, ref) => {
  const { t } = useTranslation();

  const {takePictureCamera, chooseImageFormLib, deleteAvatar} = useChangeAvatar();

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
        <TouchableOpacity className={"flex-row items-center border-b border-gray-100 px-5 py-2 pb-4"} onPress={() => {
          takePictureCamera().finally(() => {
            (ref as any)?.current?.dismiss();
          });
        }}>
            <Text className="text-lg font-inter-medium text-slate-800">{t('profile.take_photo')}</Text>
        </TouchableOpacity>
        <TouchableOpacity className={"flex-row items-center border-b border-gray-100 px-5 py-2 pb-4"} onPress={() => {
          chooseImageFormLib().finally(() => {
            (ref as any)?.current?.dismiss();
          });
        }}>
          <Text className="text-lg font-inter-medium text-slate-800">{t('profile.choose_from_lib')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={"flex-row items-center px-5 py-2 pb-4"}
          onPress={() => {
            deleteAvatar();
            (ref as any)?.current?.dismiss();
          }}
          disabled={!canDelete}
        >
          <Text className={
            cn(
              'text-lg font-inter-medium text-red-500 ',
              !canDelete ? 'opacity-50' : '',
            )
          }>{t('profile.delete_avatar_title')}</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});