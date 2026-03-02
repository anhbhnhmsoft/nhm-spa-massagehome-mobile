import { View, RefreshControl } from 'react-native';
import DefaultColor from '@/components/styles/color';
import { getTabBarHeight } from '@/components/styles/style';
import { BackgroundLiner } from '@/components/ui/background-liner';
import { useProfileCustomer } from '@/features/profile/hooks';
import {
  FeatureProfile,
  OrderBoardProfile,
  RegisterIndividualProfile,
  UserProfileSection,
} from '@/components/app/customer';

const ProfileScreen = () => {
  const { user, dashboardData, refreshProfile, isLoading } = useProfileCustomer();

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <BackgroundLiner
      className="px-4"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshProfile}
          colors={[DefaultColor.base['primary-color-2']]}
          tintColor={DefaultColor.base['primary-color-2']}
        />
      }
    >
      {/* --- HEADER PROFILE --- */}
      <UserProfileSection user={user} dashboardData={dashboardData} />

      {/* --- ĐƠN HÀNG CỦA TÔI --- */}
      <OrderBoardProfile dashboardData={dashboardData} />

      {/* Đăng ký làm đối tác */}
      <RegisterIndividualProfile />

      {/* List chức năng thường dùng */}
      <FeatureProfile />

      {/* Padding bottom cho scroll */}
      <View style={{ height: bottomPadding }} />
    </BackgroundLiner>
  );
};

export default ProfileScreen;
