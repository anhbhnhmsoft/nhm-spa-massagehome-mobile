import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { Tabs } from 'expo-router';
import { getTabBarHeight, tabBarStyle } from '@/components/styles/style';
import { TabIcon } from '@/components/app/tab-icon';
import { Home, MessageCircle, ChartColumnBigIcon, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function TabsAgencyLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets(); // Lấy thông tin vùng an toàn
  const TAB_BAR_HEIGHT = getTabBarHeight();

  return (
    <>
      <FocusAwareStatusBar />
      <Tabs
        screenOptions={{
          tabBarStyle: [
            tabBarStyle.tabBar,
            {
              height: TAB_BAR_HEIGHT,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
            },
          ],
          headerShown: false,
          tabBarShowLabel: false,
        }}>
        {/* 1. Trang Chủ */}
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Home} label={t('tab_ktv.home')} />
            ),
          }}
        />

        {/* 4. Chat */}
        <Tabs.Screen
          name="wallet"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={Wallet} label={t('profile.wallet')} />
            ),
          }}
        />

        {/* 5. Của tôi */}
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={ChartColumnBigIcon} label={t('tab_ktv.dashboard')} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
