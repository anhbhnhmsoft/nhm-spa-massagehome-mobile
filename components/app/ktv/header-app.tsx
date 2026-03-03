import React, { useEffect, useMemo, useState } from 'react';
import {  TouchableOpacity, View } from 'react-native';
import { MapPinIcon, Bolt, CalendarDays,  User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/stores';
import {Image} from "expo-image";
import dayjs from 'dayjs';

import 'dayjs/locale/vi';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import { useTranslation } from 'react-i18next';
import { useApplicationStore } from '@/features/app/stores';
import { _LanguageCode } from '@/lib/const';
import DefaultColor from '@/components/styles/color';
import { ModalInfo } from '@/components/app/ktv/modal-info';
import {Text} from "@/components/ui/text";

// Thiết lập ngôn ngữ mặc định là tiếng Việt
dayjs.locale('vi');

export function HeaderAppKTV() {
  const insets = useSafeAreaInsets();
  const userLocation = useApplicationStore((state) => state.location);
  const user = useAuthStore((state) => state.user);
  const language = useApplicationStore((state) => state.language);
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [modalInfoVisible, setModalInfoVisible] = useState<boolean>(false);

  useEffect(() => {
    const dayjsLocale = language === _LanguageCode.CN ? 'zh-cn' : language;
    dayjs.locale(dayjsLocale);
  },[language])

  const displayDate = useMemo(() => {
    const formatString = language === _LanguageCode.CN ? 'dddd, MM/DD' : 'dddd, DD/MM';
    const rawDate = dayjs().format(formatString);
    return rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  }, [language]);

  return (
    <>
      <View className="bg-white px-4 pb-4" style={{
        paddingTop: insets.top + 12,
      }}>
        {/* --- PHẦN TRÊN: AVATAR & THÔNG BÁO --- */}
        <View className="flex-row justify-between items-center mb-4">
          {/* Nhóm Avatar + Tên */}
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="relative">
              {user && user.profile.avatar_url && !imageError ? (
                <Image
                  source={{ uri: user?.profile.avatar_url }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    backgroundColor: DefaultColor.slate[200]
                  }}
                  contentFit={"cover"}
                  onError={() => setImageError(true)}
                />
              ) : (
                // Fallback UI khi không có ảnh hoặc ảnh lỗi
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    backgroundColor: DefaultColor.slate[200],
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <User size={24} color={DefaultColor.slate[400]} />
                </View>
              )}
            </View>

            {/* Lời chào & Tên */}
            <View className="ml-3">
              <Text className="text-[10px] font-inter-medium text-slate-400 uppercase tracking-wider mb-0.5">
                {t('header_app.hello')}
              </Text>
              <Text className="text-lg font-inter-bold">
                {user?.name || 'Stranger'}
              </Text>
            </View>
          </View>

          {/* Nút Cài đặt */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalInfoVisible(true)}
            className="relative w-11 h-11 rounded-full bg-white border border-slate-100 items-center justify-center shadow-sm"
          >
            <Bolt size={22} color={DefaultColor.base['primary-color-2']} />
          </TouchableOpacity>

        </View>

        {/* --- PHẦN DƯỚI: BADGE NGÀY & location --- */}
        <View className="flex-row gap-2 items-center">
          {/* Badge Ngày tháng */}
          <View className="flex-row items-center bg-[#F0F5F9] px-3.5 py-1.5 rounded-full">
            <CalendarDays size={16} color={DefaultColor.base['primary-color-2']} />
            <Text className="ml-1.5 text-primary-color-2 text-sm font-inter-medium">
              {displayDate}
            </Text>
          </View>

          {/* Location hiện tại */}
          <View className="flex-1 flex-row items-center bg-slate-100 px-3.5 py-1.5 rounded-full">
            <MapPinIcon size={16} color={DefaultColor.slate[600]} />
            <Text
              className="text-sm font-inter-medium text-slate-600"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userLocation?.address || t('header_app.need_location')}
            </Text>
          </View>
        </View>
      </View>
      <ModalInfo
        isVisible={modalInfoVisible}
        onClose={() => setModalInfoVisible(false)}
      />
    </>
  );
}

