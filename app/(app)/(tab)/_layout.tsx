import { Platform, StyleSheet } from 'react-native';
import { router, Tabs } from 'expo-router';
import { Home, Briefcase, Users, User } from 'lucide-react-native';
import { useCheckAuth } from '@/features/auth/hooks';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { NotificationPermissionModal } from '@/components/notification-permission-modal';
import { TabIcon } from '@/components/app/tab-icon';
import PromoModal from '@/components/app/promo-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0', // Thêm màu viền nhẹ cho đẹp
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24, // Tăng bo góc một chút cho hiện đại
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export const getTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  return useMemo(() => 90 + insets.bottom, [insets.bottom]);
}


export default function TabsLayout() {
  const checkAuth = useCheckAuth();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets(); // Lấy thông tin vùng an toàn

  const TAB_BAR_HEIGHT = getTabBarHeight();

  return (
    <>
      <FocusAwareStatusBar />
      {/*Modal promo */}
      <PromoModal />
      <Tabs
        screenOptions={{
          tabBarStyle: [
            styles.tabBar,
            {
              height: TAB_BAR_HEIGHT,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10
            }
          ],
          headerShown: false,
          tabBarShowLabel: false,
        }}>
        {/* 1. Trang Chủ */}
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Home} label={t('tab.home')} />
            ),
          }}
        />

        {/* 2. Dịch vụ */}
        <Tabs.Screen
          name="services"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Briefcase} label={t('tab.services')} />
            ),
          }}
        />

        {/* 3. Thợ Massage */}
        <Tabs.Screen
          name="masseurs"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Users} label={t('tab.masseurs')} />
            ),
          }}
        />


        {/* 5. Của tôi */}
        <Tabs.Screen
          name="profile"
          listeners={{
            tabPress: (e) => {
              if (!checkAuth) {
                e.preventDefault();
                router.push('/(auth)');
              }
            },
          }}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={User} label={t('tab.profile')} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
