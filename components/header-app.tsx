import React from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { MapPin, Bell, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientBackground from '@/components/styles/gradient-background';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { Icon } from '@/components/ui/icon';
import { ListLocationModal } from '@/components/app/location';
import { useLocationUser } from '@/features/app/hooks/use-get-user-location';



type HeaderAppProps = {
  showSearch?: boolean;
  forSearch?: "service" | "massage";
  setTextSearch?: (text: string) => void;
  textSearch?: string;
}

export function HeaderApp({ showSearch = false, forSearch, setTextSearch, textSearch }: HeaderAppProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const redirectAuth = useCheckAuthToRedirect();
  const locationUser = useLocationUser();

  return (
    <>
      <GradientBackground
        style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 10, zIndex: 10 }}
      >
        {/* Top Bar: Location & Noti */}
        <View className="mb-4 mt-2 flex-row items-center justify-between gap-8">
          {/* Location Button */}
          <TouchableOpacity
            onPress={() => {
              redirectAuth(() => setShowLocationModal(true));
            }}
            activeOpacity={0.8}
            className={'flex-1'}>
            <Text className="text-xs font-inter-medium text-blue-200">{t('header_app.location')}</Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Icon as={MapPin} size={16} className="text-white" />
              <Text className="font-inter-bold text-base text-white" numberOfLines={1}>
                {locationUser?.address || t('header_app.need_location')}
              </Text>
            </View>
          </TouchableOpacity>
          {/* Notification Button */}
          <TouchableOpacity className="relative">
            <Icon as={Bell} size={24} className="text-white" />
            {/* Dấu chấm đỏ thông báo */}
            <View className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-[#1d4ed8] bg-red-500" />
          </TouchableOpacity>
        </View>
        {showSearch && (
          <View>
            {/* Search Bar */}
            <View className="h-12 flex-row items-center rounded-xl bg-white px-3 shadow-sm border border-gray-100">
              {/* Icon Search bên trái */}
              <Search size={20} color="#94a3b8" />

              {/* Input nhập liệu */}
              <TextInput
                className="ml-2 flex-1 text-sm text-slate-700 h-full"
                placeholder={
                  forSearch === "service"
                    ? t('header_app.search_placeholder_service')
                    : t('header_app.search_placeholder_massage')
                }
                placeholderTextColor="#94a3b8"
                value={textSearch}
                onChangeText={setTextSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Nút X để xóa nhanh text (chỉ hiện khi có text) */}
              {textSearch && setTextSearch && textSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTextSearch('')} className="p-1">
                  <Icon as={X} size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </GradientBackground>
      <ListLocationModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}

