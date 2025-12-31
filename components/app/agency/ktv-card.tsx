import { Image, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { ListKTVItem } from '@/features/user/types';
import { ChevronRight, Phone, User } from 'lucide-react-native';
import { _LanguagesMap } from '@/lib/const';
// Đảm bảo import đúng đường dẫn của _LanguagesMap
const getLanguageName = (lang: string): string => {
  switch (lang) {
    case 'vi':
      return 'Việt Nam';
    case 'cn':
      return 'China';
    case 'en':
      return 'English';
    default:
      return 'Unknown';
  }
};

export default function ItemKtv({ item }: { item: ListKTVItem }) {
  // Tìm thông tin ngôn ngữ từ map dựa trên item.language (ví dụ: 'cn', 'vi', 'en')
  const langInfo = _LanguagesMap.find((l) => l.code === item.language);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="mx-4 mb-4 flex-row items-center rounded-3xl border-hairline border-primary-color-4/20 bg-base-color-2 p-4 shadow-sm">
      {/* Avatar Section */}
      <View className="relative">
        {item.profile?.avatar_url ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            className="h-16 w-16 rounded-2xl bg-primary-color-4/10"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-color-4/20">
            <User size={24} color="#45556C" />
          </View>
        )}
        {/* Status indicator */}
        <View className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
      </View>

      {/* Info Section */}
      <View className="ml-4 flex-1">
        <Text className="mb-1 font-inter-bold text-base text-base-color-1" numberOfLines={1}>
          {item.name || 'N/A'}
        </Text>

        <View className="mb-2 flex-row items-center">
          <Phone size={12} color="#45556C" />
          <Text className="ml-1 font-inter-regular text-sm text-primary-color-3">{item.phone}</Text>
        </View>

        {/* Badges Section (Role & Language) */}
        <View className="flex-row items-center">
          {/* Language Badge động từ _LanguagesMap */}
          {langInfo && (
            <View className="flex-row items-center rounded-lg border-hairline border-primary-color-4/30 bg-base-color-3/50 px-2 py-0.5">
              <Image source={langInfo.icon} className="mr-1 h-3 w-4" resizeMode="contain" />
              <Text className="font-inter-medium text-[11px] text-primary-color-1">
                {getLanguageName(item.language)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Section */}
      <View>
        <ChevronRight size={20} color="#90A1B9" />
      </View>
    </TouchableOpacity>
  );
}
