import React, { useEffect, useMemo, useState } from 'react';
import {  TouchableOpacity, View } from 'react-native';
import { MapPinIcon, Bolt, CalendarDays,  User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/stores';
import {Image} from "expo-image";
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useApplicationStore } from '@/features/app/stores';
import { _LanguageCode } from '@/lib/const';
import DefaultColor from '@/components/styles/color';
import { ModalInfo } from '@/components/app/ktv/modal-info';
import {Text} from "@/components/ui/text";


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
    const rawDate = dayjs().format("DD/MM/YYYY");
    return rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  }, [language]);

  return (
    <>
      <View
        className="bg-white px-4 pb-4 border-b border-slate-100"
        style={{
          paddingTop: insets.top + 10,
        }}>
        {/* --- PHẦN TRÊN: AVATAR & THÔNG BÁO --- */}
        <View className="flex-row justify-between items-center mb-3">
          {/* Nhóm Avatar + Tên */}
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="relative">
              {user && user.profile?.avatar_url && !imageError ? (
                <Image
                  source={{ uri: user?.profile.avatar_url }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 44,
                    backgroundColor: DefaultColor.slate[200],
                  }}
                  contentFit={'cover'}
                  onError={() => setImageError(true)}
                />
              ) : (
                // Fallback UI khi không có ảnh hoặc ảnh lỗi
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 44,
                    backgroundColor: DefaultColor.slate[100],
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <User size={22} color={DefaultColor.slate[400]} />
                </View>
              )}
            </View>

            {/* Lời chào & Tên */}
            <View className="ml-3">
              <Text className="text-[10px] font-inter-bold text-slate-400 uppercase tracking-widest">
                {t('header_app.hello')}
              </Text>
              <Text className="text-lg font-inter-bold text-slate-900">
                {user?.name || 'Kỹ thuật viên'}
              </Text>
            </View>
          </View>

          {/* Nút Cài đặt */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setModalInfoVisible(true)}
            className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200/70 items-center justify-center active:bg-slate-100">
            <Bolt size={20} color={DefaultColor.base['primary-color-2']} />
          </TouchableOpacity>
        </View>

        {/* --- PHẦN DƯỚI: BADGE NGÀY & location --- */}
        <View className="flex-row gap-2 items-center">
          {/* Badge Ngày tháng */}
          <View className="flex-row items-center bg-blue-50/80 border border-blue-100 px-3.5 py-1.5 rounded-full">
            <CalendarDays size={14} color={DefaultColor.base['primary-color-2']} />
            <Text className="ml-1.5 text-primary-color-2 text-xs font-inter-bold">
              {displayDate}
            </Text>
          </View>

          {/* Location hiện tại */}
          <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200/70 px-3.5 py-1.5 rounded-full">
            <MapPinIcon size={14} color={DefaultColor.slate[500]} />
            <Text
              className="ml-1.5 text-xs font-inter-medium text-slate-600 flex-1"
              numberOfLines={1}
              ellipsizeMode="tail">
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

