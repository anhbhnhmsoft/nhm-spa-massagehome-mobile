import { StyleSheet } from 'react-native';
import { router, Tabs } from 'expo-router';
import { Home, Briefcase, Users, ShoppingBag, User, MessageCircle } from 'lucide-react-native';
import { useCheckAuth } from '@/features/auth/hooks';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { NotificationPermissionModal } from '@/components/notification-permission-modal';
import { TabIcon } from '@/components/app/tab-icon';

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white', // Nên để white cho sạch
    borderTopWidth: 1,

    // Tăng chiều cao lên để chứa đủ Icon + Text + Padding đáy
    height: 90,

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
export default function TabsLayoutKTV() {
  const checkAuth = useCheckAuth();
  const { t } = useTranslation();

  return (
    <>
      <FocusAwareStatusBar />
      {/* --- NOTIFICATION PERMISSION MODAL --- */}
      <NotificationPermissionModal />
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
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
          name="chat"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={MessageCircle} label={t('tab.chat')} />
            ),
          }}
        />

        {/* 4. Đơn hàng */}
        <Tabs.Screen
          name="orders"
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
              <TabIcon focused={focused} icon={ShoppingBag} label={t('tab.orders')} />
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
