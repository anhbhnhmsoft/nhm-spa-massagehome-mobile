import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, Plus, Lock, RotateCcw, Save, Briefcase, User as UserIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomEditAvatar } from '@/components/app/profile-tab';
import useAuthStore from '@/features/auth/store';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { DetailInfoKTV } from '@/features/ktv/types';

// Màu chủ đạo (theo banner Spa cũ của bạn)
const PRIMARY_COLOR = '#2B7BBE';

export default function EditInfoScreen() {
  const {t} = useTranslation();

  // Mock data state
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=500',
  ]);

  const [formData, setFormData] = useState({
    name: 'Nguyễn Thúy Chi',
    phone: '0912 345 678',
    experience: '3',
    introVi: '',
    introEn: '',
    introCn: '',
  });

  const handleSave = () => {
    // Logic gọi API lưu thông tin ở đây
    Alert.alert('Thông báo', 'Đã lưu thay đổi thành công!');
  };
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <View className="flex-1 bg-white">
        <HeaderBack title="profile.edit_info" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            className="flex-1">
            {/* 1. AVATAR SECTION */}

            <View className="mb-6 mt-6 items-center">
              <View className="relative">
                <View className="h-24 w-24 overflow-hidden rounded-full border-2 border-[#FFE4C4] bg-gray-200">
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
                    }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#2B7BBE] p-1.5">
                  <Camera size={14} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="mt-2 text-sm font-medium text-[#2B7BBE]">Đổi ảnh đại diện</Text>
            </View>

            {/* 2. GALLERY SECTION */}
            <View className="mb-6 px-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-bold text-gray-800">Ảnh hiển thị (3-5 ảnh)</Text>
                <Text className="text-xs text-gray-400">{images.length}/5 đã chọn</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {/* Nút Thêm ảnh */}
                <TouchableOpacity className="mr-3 h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[#2B7BBE] bg-blue-50">
                  <View className="mb-1 rounded-full bg-[#2B7BBE] p-1">
                    <Plus size={16} color="white" />
                  </View>
                  <Text className="text-[10px] font-medium text-[#2B7BBE]">Thêm</Text>
                </TouchableOpacity>

                {/* Danh sách ảnh */}
                {images.map((img, index) => (
                  <View key={index} className="mr-3 h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                    <Image source={{ uri: img }} className="h-full w-full" resizeMode="cover" />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* 3. FORM FIELDS */}
            <View className="space-y-4 px-4">
              {/* Họ và tên (Disabled) */}
              <FormInput
                label="Họ và tên"
                value={formData.name}
                editable={false}
                icon={<Lock size={16} color="#9CA3AF" />}
              />

              {/* Số điện thoại (Disabled) */}
              <FormInput
                label="Số điện thoại"
                value={formData.phone}
                editable={false}
                icon={<Lock size={16} color="#9CA3AF" />}
              />

              {/* Số năm kinh nghiệm */}
              <FormInput
                label="Số năm kinh nghiệm"
                value={formData.experience}
                onChangeText={(t) => setFormData({ ...formData, experience: t })}
                keyboardType="numeric"
                icon={<Briefcase size={16} color="#6B7280" />}
              />

              <Text className="mt-2 text-base font-bold text-gray-800">Giới thiệu bản thân</Text>

              {/* Giới thiệu (Tiếng Việt) */}
              <LanguageTextArea
                lang="VI"
                placeholder="Mô tả kinh nghiệm, kỹ năng chuyên môn (Tiếng Việt)..."
                value={formData.introVi}
                onChangeText={(t) => setFormData({ ...formData, introVi: t })}
              />

              {/* Giới thiệu (English) */}
              <LanguageTextArea
                lang="EN"
                placeholder="Describe your experience and skills (English)..."
                value={formData.introEn}
                onChangeText={(t) => setFormData({ ...formData, introEn: t })}
              />

              {/* Giới thiệu (Trung) */}
              <LanguageTextArea
                lang="CN"
                placeholder="描述您的经验和技能 (中文)..."
                value={formData.introCn}
                onChangeText={(t) => setFormData({ ...formData, introCn: t })}
              />
            </View>

            {/* 4. SECURITY SECTION */}
            <View className="mb-8 mt-6 px-4">
              <Text className="mb-3 text-base font-bold text-gray-800">Bảo mật</Text>
              <TouchableOpacity
                className="flex-row items-center justify-center rounded-xl bg-[#2B7BBE] py-3.5 shadow-sm"
                onPress={() => Alert.alert('Nav', 'Navigate to Change Password')}>
                <RotateCcw size={18} color="white" className="mr-2" />
                <Text className="text-base font-bold text-white">Đổi mật khẩu</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* FOOTER BUTTON */}
        <View className="border-t border-gray-100 bg-white p-4 shadow-lg">
          <TouchableOpacity
            onPress={handleSave}
            className="flex-row items-center justify-center rounded-xl bg-[#2B7BBE] py-4">
            <Save size={20} color="white" className="mr-2" />
            <Text className="text-lg font-bold text-white">Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomEditAvatar ref={bottomEditAvatar} canDelete={user?.profile.avatar_url !== null} />
    </>
  );
}

// --- COMPONENTS CON CHO GỌN CODE ---

// 1. Input thường (Có hỗ trợ icon và trạng thái disable)
const FormInput = ({
  label,
  value,
  editable = true,
  icon,
  onChangeText,
  keyboardType = 'default',
}: any) => (
  <View className="mb-1">
    <Text className="mb-1.5 ml-1 text-sm font-medium text-gray-500">{label}</Text>
    <View
      className={cn(
        'flex-row items-center rounded-xl border px-4 py-3.5',
        editable ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
      )}>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        className={cn('flex-1 text-base text-gray-900', !editable && 'text-gray-500')}
      />
      {icon && <View className="ml-2">{icon}</View>}
    </View>
  </View>
);

// 2. Text Area đa ngôn ngữ (Có Badge góc phải)
const LanguageTextArea = ({ lang, placeholder, value, onChangeText }: any) => (
  <View className="relative mb-3">
    <View className="min-h-[100px] rounded-xl border border-gray-200 bg-white px-4 py-3">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        className="flex-1 pr-8 pt-1 text-base text-gray-900" // pr-8 để tránh chữ đè lên badge
      />
    </View>
    {/* Badge ngôn ngữ */}
    <View className="absolute right-3 top-3 rounded-md bg-gray-100 px-2 py-1">
      <Text className="text-[10px] font-bold text-gray-500">{lang}</Text>
    </View>
  </View>
);


const EditAvatar = ({item} : {item: DetailInfoKTV}) => {
  const [imageError, setImageError] = useState<boolean>(false);

  const bottomEditAvatar = useRef<BottomSheetModal>(null);

  return (
    <>
      <View className="relative">
        {item.avatar_url && !imageError ? (
          <Image
            source={{ uri: item.avatar_url }}
            className="h-28 w-28 rounded-full border-4 border-white"
            resizeMode="cover"
            // Khi lỗi -> Set state -> React render lại -> Chạy xuống dòng fallback dưới
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback UI khi không có ảnh hoặc ảnh lỗi
          <View className="h-28 w-28 rounded-full border-4 border-white bg-slate-200 items-center justify-center">
            <Icon as={UserIcon} size={32} className={'text-slate-400'} />
          </View>
        )}
        <TouchableOpacity
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-primary-color-2 p-2"
          onPress={() => bottomEditAvatar.current?.present()}>
          <Camera size={16} color="white" />
        </TouchableOpacity>
      </View>
      <BottomEditAvatar ref={bottomEditAvatar} canDelete={item.avatar_url !== null} />
    </>
  )
}
