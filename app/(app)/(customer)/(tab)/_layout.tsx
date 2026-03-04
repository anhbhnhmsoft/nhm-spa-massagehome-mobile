import { router, Tabs } from 'expo-router';
import { Home, Briefcase, Users, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { TabIcon } from '@/components/app/tab-icon';
import PromoModal from '@/components/app/promo-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabBarHeight, tabBarStyle } from '@/components/styles/style';
import { useAuthStore } from '@/features/auth/stores';
import { _AuthStatus } from '@/features/auth/const';


export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets(); // Lấy thông tin vùng an toàn

  const TAB_BAR_HEIGHT = getTabBarHeight();

  return (
    <>
      <FocusAwareStatusBar />
      {/*Modal promo */}
      <PromoModal />
      {/* Tabs */}
      <Tabs
        screenOptions={{
          tabBarStyle: [
            tabBarStyle.tabBar,
            {
              height: TAB_BAR_HEIGHT,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10
            }
          ],
          headerShown: false,
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Home} label={t('tab.home')} />
            ),
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Briefcase} label={t('tab.services')} />
            ),
          }}
        />

        <Tabs.Screen
          name="masseurs"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Users} label={t('tab.masseurs')} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          listeners={{
            tabPress: (e) => {
              if (status === _AuthStatus.UNAUTHORIZED) {
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
