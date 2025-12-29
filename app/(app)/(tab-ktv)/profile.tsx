import { View, ScrollView, RefreshControl } from 'react-native';
import { useProfile } from '@/features/user/hooks';
import DefaultColor from '@/components/styles/color';
import { getTabBarHeight } from '@/components/styles/style';
import { HeaderAppKTV } from '@/components/app/ktv/header-app';
import { FeatureList, RegisterPartnerOrAffiliate } from '@/components/app/ktv/profile-tab';

// Màn hình profile của ktv
const ProfileScreen = () => {
  const { user, dashboardData, refreshProfile, isLoading } = useProfile();

  const bottomPadding = getTabBarHeight() + 20;

  return (
    <View className="flex-1 bg-base-color-3">
      {/* --- HEADER PROFILE --- */}
      <HeaderAppKTV />
      {/* --- MENU --- */}
      <ScrollView
        className="mt-4 flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshProfile}
            colors={[DefaultColor.base['primary-color-1']]}
            tintColor={DefaultColor.base['primary-color-1']}
          />
        }>
        {/* Đăng ký làm đối tác */}
        <RegisterPartnerOrAffiliate />

        {/* List chức năng thường dùng */}
        <FeatureList />

        {/* Padding bottom cho scroll */}
        <View style={{ height: bottomPadding }} />
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
