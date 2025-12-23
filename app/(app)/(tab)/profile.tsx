import { View, ScrollView, RefreshControl } from 'react-native';
import { useProfile } from '@/features/user/hooks';
import {
  FeatureList,
  OrderBoardProfile,
  RegisterPartnerOrAffiliate,
  UserProfileCard,
} from '@/components/app/profile-tab';
import DefaultColor from '@/components/styles/color';
import { getTabBarHeight } from '@/app/(app)/(tab)/_layout';

const ProfileScreen = () => {
  const { user, dashboardData, refreshProfile, isLoading } = useProfile();


  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER PROFILE --- */}
      <UserProfileCard user={user} dashboardData={dashboardData} refreshProfile={refreshProfile} />
      {/* --- MENU --- */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshProfile}
            colors={[DefaultColor.base['primary-color-1']]}
            tintColor={DefaultColor.base['primary-color-1']}
          />
        }
      >

        {/* --- ĐƠN HÀNG CỦA TÔI --- */}
        <OrderBoardProfile dashboardData={dashboardData} />

        {/* Đăng ký làm đối tác */}
        <RegisterPartnerOrAffiliate />

        {/* List chức năng thường dùng */}
        <FeatureList />

        {/* Padding bottom cho scroll */}
        <View style={{ height: getTabBarHeight() + 20 }} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
