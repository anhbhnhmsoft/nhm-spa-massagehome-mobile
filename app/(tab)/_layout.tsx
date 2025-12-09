import { View, StyleSheet } from 'react-native';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';
import { router, Tabs } from 'expo-router';
import { Home, Briefcase, Users, ShoppingBag, User } from 'lucide-react-native';
import { useCheckAuth } from '@/features/auth/hooks';
import { useTranslation } from 'react-i18next';
import useApplicationStore from '@/lib/store';
import FullScreenLoading from '@/components/full-screen-loading';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { NotificationPermissionModal } from '@/components/notification-permission-modal';

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

const TabIcon = ({
  focused,
  icon: IconComponent,
  label,
}: {
  focused: boolean;
  icon: any;
  label: string;
}) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        top: 24, // iOS đẩy xuống 12px, Android giữ nguyên
      }}>
      {/* Khối nền của Icon */}
      <View
        className={`mb-1 h-10 w-10 items-center justify-center rounded-2xl ${
          focused ? 'bg-blue-600' : 'bg-transparent'
        }`}>
        <IconComponent
          size={20}
          color={focused ? 'white' : DefaultColor.gray['400']}
          strokeWidth={focused ? 2.5 : 2}
        />
      </View>

      {/* Label */}
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? '#2563eb' : DefaultColor.gray['400'],
          textAlign: 'center',
          width: 70,
        }}>
        {label}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const checkAuth = useCheckAuth();
  const { t } = useTranslation();
  const loading = useApplicationStore((s) => s.loading);

  return (
    <>
      <FullScreenLoading loading={loading} />
      <FocusAwareStatusBar />
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
          name="masseurs"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Users} label={t('tab.masseurs')} />
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
