import React, { FC, useState,  forwardRef, useCallback, useRef, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  ChevronRight,
  ClipboardList,
  Heart,
  RefreshCcw,
  Settings,
  Ticket,
  User as UserIcon,
  Wallet,
  Building2,
  HandCoins,
  MapPin,
  Headphones,
  Info,
  LogOut,
  Bell
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn, formatBalance } from '@/lib/utils';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useChangeAvatar } from '@/features/auth/hooks';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';
import GradientBackground from '@/components/styles/gradient-background';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/features/user/hooks';
import { router } from 'expo-router';
import { _BookingStatus, _BookingStatusMap } from '@/features/service/const';
import { ListLocationModal } from '@/components/app/location';
import useApplicationStore from '@/lib/store';
import { _LanguagesMap } from '@/lib/const';
import SelectLanguage from '@/components/select-language';
import { useLogout } from '@/features/auth/hooks';
import Dialog from '@/components/dialog';
import SupportModal from '@/components/app/support-modal';
import { useGetSupport } from '@/features/config/hooks';
import { useSingleTouch } from '@/features/app/hooks/use-single-touch';

// Header Profile Card
type UserProfileCardProps = {
  user: ReturnType<typeof useProfile>['user'];
  dashboardData: ReturnType<typeof useProfile>['dashboardData'];
  refreshProfile: ReturnType<typeof useProfile>['refreshProfile'];
};
export const UserProfileCard: FC<UserProfileCardProps> = ({
  user,
  dashboardData,
  refreshProfile,
}) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  const inset = useSafeAreaInsets();
  return (
    <GradientBackground
      style={{
        paddingTop: inset.top + 20,
        paddingHorizontal: 16,
        borderBottomEndRadius: 30,
        borderBottomStartRadius: 30,
        position: 'relative',
        paddingBottom: 20,
      }}>
      {/* User Info */}
      <View className="flex-row items-start justify-between">
        {/* User Info */}
        <View className="flex-row items-center">
          {user && user.profile.avatar_url && !imageError ? (
            <Image
              source={{ uri: user.profile.avatar_url }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                borderWidth: 2,
                borderColor: 'white',
              }}
              contentFit="cover"
              // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback UI khi không có ảnh hoặc ảnh lỗi
            <View className="h-14 w-14 rounded-full border-2 border-white bg-slate-200 justify-center items-center">
              <Icon as={UserIcon} size={24} className={'text-slate-400'} />
            </View>
          )}
          <View className="ml-3 gap-2">
            <Text className="font-inter-bold text-lg text-white">{user?.name || '-'} </Text>
            <Text className="text-xs text-blue-50">ID: {user?.id || '-'} </Text>
          </View>
        </View>
        {/* Action Icon */}
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={refreshProfile}>
            <Icon as={RefreshCcw} size={22} className={'text-white'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(app)/(profile)/profile')}>
            <Icon as={Settings} size={22} className={'text-white'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View className="mt-6 flex-row gap-4 px-2">
        <View className="flex-1 flex-row items-center justify-between">
          <View className="items-center">
            <Text className="text-base font-inter-bold text-white">
              {dashboardData?.wallet_balance ? formatBalance(dashboardData?.wallet_balance) : '-'}{' '}
              {t('common.currency')}{' '}
            </Text>
            <Text className="text-xs text-teal-100">{t('profile.balance')}</Text>
          </View>
          <View className="items-center">
            <Text className="text-base font-inter-bold text-white">
              {dashboardData?.coupon_user_count ? dashboardData?.coupon_user_count : '0'}{' '}
            </Text>
            <Text className="text-xs text-teal-100">{t('profile.coupon')}</Text>
          </View>
        </View>
        <View className={'rounded- h-full w-[1px] bg-white/20'} />
        <TouchableOpacity
          className="flex-row items-center justify-center"
          onPress={() => router.push('/(app)/(profile)/wallet')}>
          <Icon as={Wallet} size={22} className={'text-white'} />
          <Text className="ml-2 text-xs text-white">{t('profile.wallet')}</Text>
        </TouchableOpacity>
      </View>
    </GradientBackground>
  );
};

// Đơn hàng trong profile tab
type OrderBoardProfileProps = {
  dashboardData: ReturnType<typeof useProfile>['dashboardData'];
};
const ORDER_MENU_ITEMS = [
  {
    status: _BookingStatus.PENDING,
    icon: Wallet,
    label: _BookingStatusMap[_BookingStatus.PENDING],
  },
  {
    status: _BookingStatus.CONFIRMED,
    icon: ClipboardList,
    label: _BookingStatusMap[_BookingStatus.CONFIRMED],
  },
  {
    status: _BookingStatus.ONGOING,
    icon: Heart,
    label: _BookingStatusMap[_BookingStatus.ONGOING],
  },
  {
    status: _BookingStatus.COMPLETED,
    icon: Ticket,
    label: _BookingStatusMap[_BookingStatus.COMPLETED],
  },
];
export const OrderBoardProfile = ({ dashboardData }: OrderBoardProfileProps) => {
  const { t } = useTranslation();
  return (
    <View className="mb-3 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-inter-bold text-gray-800">{t('profile.my_order')}</Text>
        <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/(app)/(profile)/orders')}>
          <Text className="mr-1 text-xs text-gray-400">{t('common.see_more')}</Text>
          <Icon as={ChevronRight} size={12} className={'text-gray-400'} />
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between gap-2">
        {ORDER_MENU_ITEMS.map((item) => {
          const count = dashboardData?.booking_count?.[item.status] || 0;
          return (
            <TouchableOpacity
              onPress={useSingleTouch(() => router.push({
                pathname: '/(app)/(profile)/orders',
                params: {
                  status: item.status,
                }
              }))}
              key={item.status}
              className="relative flex-1 items-center"
            >
              <View className="mb-2">
                <Icon as={item.icon} size={24} className="text-gray-500" />
              </View>
              <Text className="text-center text-[10px] text-gray-500">
                {t(_BookingStatusMap[item.status])}
              </Text>
              {/* Badge Count */}
              {count > 0 && (
                <View className="absolute -top-2 right-0 items-center justify-center rounded-full bg-orange-500 px-1">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Đănt ký đối tác hoặc affilate
export const RegisterPartnerOrAffiliate = () => {
  const { t } = useTranslation();
  return (
    <View className="flex-row flex-wrap justify-between">
      {/* Đăng ký làm đối tác */}
      <TouchableOpacity
        className="w-[48%] flex-row items-center rounded-xl bg-white p-4 shadow-sm"
        onPress={() => {
          router.push('/(app)/(profile)/partner-register-type');
        }}>
        <View className="mr-3">
          <Icon as={Building2} size={24} className="text-primary-color-1" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-inter-bold text-gray-800" numberOfLines={1}>
            {t('profile.join_partner')}
          </Text>
          <Text className="text-[10px] text-gray-400" numberOfLines={1}>
            {t('profile.join_partner_desc')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Affiliate */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/(profile)/affiliate')}
        className="w-[48%] flex-row items-center rounded-xl bg-white p-4 shadow-sm"
      >
        <View className="mr-3">
          <Icon as={HandCoins} size={24} className="text-primary-color-1" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-inter-bold text-gray-800" numberOfLines={1}>
            {t('profile.partner_commission')}
          </Text>
          <Text className="text-[10px] text-gray-400" numberOfLines={1}>
            {t('profile.partner_commission_desc')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Hiển thị danh sách các tính năng nổi bật
 */
export const FeatureList = () => {
  const { t } = useTranslation();

  // Quản lý địa chỉ
  const [visibleLocation, setVisibleLocation] = useState(false);

  // Hỗ trợ
  const { visible: visibleSupport, openSupportModal, closeSupportModal, supportChanel } = useGetSupport();

  // Xử lý ngôn ngữ
  const selectedLang = useApplicationStore((state) => state.language);
  const languageSheetRef = useRef<BottomSheetModal>(null);
  const langConfig = useMemo(
    () => _LanguagesMap.find((lang) => lang.code === selectedLang),
    [selectedLang]
  );

  // Xử lý đăng xuất
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const logout = useLogout();


  return (
    <>
      <View className="mt-3 flex-row flex-wrap justify-start rounded-xl bg-white p-4">
        <View className="mb-3 w-full">
          <Text className="font-inter-bold text-gray-800">{t('profile.common_features')}</Text>
        </View>
        {/* Quản lý địa chỉ */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => setVisibleLocation(true)}>
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={MapPin} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.manage_address')}</Text>
        </TouchableOpacity>

        {/* Ngôn ngữ */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => languageSheetRef.current?.present()}>
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
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
        >
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Info} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.app_info')}</Text>
        </TouchableOpacity>

        {/* Hỗ trợ khách hàng */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => openSupportModal()}
        >
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Headphones} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.support')}</Text>
        </TouchableOpacity>

        {/* Thông báo */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
        >
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={Bell} size={24} className="text-primary-color-1" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.notification')}</Text>
        </TouchableOpacity>

        {/* Đăng xuất */}
        <TouchableOpacity
          className="mb-2 w-[25%] items-center"
          onPress={() => setLogoutModalOpen(true)}
        >
          <View className="mb-1 rounded-full bg-gray-50 p-3">
            <Icon as={LogOut} size={24} className="text-red-500" />
          </View>
          <Text className="text-center text-xs text-gray-600">{t('profile.log_out')}</Text>
        </TouchableOpacity>
      </View>

      {/* Quản lý địa chỉ */}
      <ListLocationModal visible={visibleLocation} onClose={() => setVisibleLocation(false)} />

      {/* Ngôn ngữ */}
      <SelectLanguage ref={languageSheetRef} />

      {/* Hỗ trợ khách hàng */}
      <SupportModal
        isVisible={visibleSupport}
        onClose={closeSupportModal}
        supportChanel={supportChanel}
      />

      {/* Đăng xuất */}
      <Dialog
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)} // Đóng khi bấm Hủy hoặc bấm ra ngoài
        title="profile.log_out_title"               // Key trong file ngôn ngữ (hoặc text thường)
        description="profile.log_out_desc"          // Key: "Bạn có chắc muốn đăng xuất không?"
        onConfirm={logout}
      />
    </>
  );
};

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
