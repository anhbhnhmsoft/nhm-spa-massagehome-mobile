import {
  ChevronLeft,
  Camera,
  Home,
  Briefcase,
  User,
  ShoppingBag,
  Users,
} from 'lucide-react-native';
import React, { useRef } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomEditAvatar } from '@/components/app/profile-tab';

export default function UserProfile() {
  const { t } = useTranslation();

  const bottomEditAvatar = useRef<BottomSheetModal>(null);

  return (
    <>
      <SafeAreaView className="flex-1 bg-base-color-3">
        {/* Header */}
        <View className="z-10 flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
          <TouchableOpacity className="p-1">
            <ChevronLeft size={24} color="#334155" />
          </TouchableOpacity>
          <Text className="mr-8 flex-1 text-center text-lg font-bold text-slate-800">
            Thông tin tài khoản
          </Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }} // Padding để không bị che bởi bottom tab
          showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View className="items-center justify-center py-8">
            <View className="relative">
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                }}
                className="h-28 w-28 rounded-full border-4 border-white"
                resizeMode="cover"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary-color-2 p-2"

              onPress={() => bottomEditAvatar.current?.present()}>
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form List */}
          <View className="bg-white px-4">
            <InfoItem label="Họ và tên" value="Thêm thông tin" isLink />
            <InfoItem label="Số điện thoại" value="123 456 7899" isBold />
            <InfoItem label="Giới tính" value="Nam" isBold />
            <InfoItem label="Quốc tịch" value="Việt Nam" isBold />
            <InfoItem label="Đăng ký trở thành KTV" value="Đăng ký miễn phí" isLink />
            <InfoItem label="Xác minh hồ sơ" value="Chưa xác minh" valueColor="text-blue-400" />
            <InfoItem label="Mật khẩu" value="Đổi mật khẩu" valueColor="text-blue-400" noBorder />
          </View>

          {/* Footer Actions */}
          <View className="mt-6 items-center gap-4 space-y-4 px-4">

            <TouchableOpacity className="w-full items-center rounded-lg bg-primary-color-2/20 py-3">
              <Text className="font-bold text-primary-color-2">Sửa thông tin</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomEditAvatar ref={bottomEditAvatar} />
    </>
  );
}

// Components phụ
function InfoItem({ label, value, isLink, isBold, valueColor, noBorder }) {
  return (
    <View
      className={`flex-row items-center justify-between py-4 ${!noBorder ? 'border-b border-gray-100' : ''}`}>
      <Text className="text-[15px] text-gray-500">{label}</Text>
      <TouchableOpacity>
        <Text
          className={`text-[15px] ${isLink ? 'text-[#2D88CF]' : ''} ${isBold ? 'font-bold text-slate-800' : 'text-gray-600'} ${valueColor || ''}`}>
          {value}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
