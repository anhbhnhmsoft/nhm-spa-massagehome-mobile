import React, { useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Camera, Key, Lock, Save, User as UserIcon } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '@/features/auth/store';
import { useUpdateProfileAgency } from '@/features/agency/hook';
import { Controller } from 'react-hook-form';
import { LocationSelector } from '@/components/app/ktv/location-selector'; // Dùng lại component của KTV
import DateTimePickerInput from '@/components/app/ktv/date-time-input';
import dayjs from 'dayjs';
import { _Gender } from '@/features/auth/const';
import { BottomEditAvatar } from '@/components/app/profile-tab';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditInfoScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [imageError, setImageError] = useState(false);

  const bottomEditAvatar = useRef<BottomSheetModal>(null);

  // Sử dụng Hook đã viết từ trước
  const { form, onSubmit, errors, isSubmitting, isLoading } = useUpdateProfileAgency();
  const { control, setValue } = form;
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <HeaderBack title="profile.edit_info" />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            enableOnAndroid={true}
            scrollEnabled={true}
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              className="flex-1">
              {/* 1. AVATAR SECTION */}
              <View className="mb-6 mt-6 items-center">
                <View className="relative">
                  {user?.profile?.avatar_url && !imageError ? (
                    <Image
                      source={{ uri: user?.profile.avatar_url }}
                      className="h-28 w-28 rounded-full border-4 border-white"
                      resizeMode="cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <View className="h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-slate-200">
                      <Icon as={UserIcon} size={32} className={'text-slate-400'} />
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#2B7BBE] p-1.5"
                    onPress={() => bottomEditAvatar.current?.present()}>
                    <Camera size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2. FORM FIELDS */}
              <View className="space-y-4 px-4">
                {/* Các trường không cho sửa */}
                <FormInput
                  label={t('common.full_name')}
                  value={user?.name}
                  editable={false}
                  icon={<Lock size={16} color="#9CA3AF" />}
                />

                <FormInput
                  label={t('common.phone')}
                  value={user?.phone}
                  editable={false}
                  icon={<Lock size={16} color="#9CA3AF" />}
                />

                {/* Ngày sinh */}
                <Controller
                  control={control}
                  name="date_of_birth"
                  render={({ field: { value, onChange } }) => (
                    <DateTimePickerInput
                      mode="date"
                      label={t('common.date_of_birth')}
                      value={value ? dayjs(value).toDate() : new Date()}
                      onChange={(newDate) => {
                        // 1. Clone lại date hiện tại để không sửa trực tiếp biến state cũ (tránh side-effect)
                        const temp = new Date(value || new Date());
                        // 2. Chỉ update Ngày/Tháng/Năm từ newDate người dùng chọn
                        temp.setFullYear(newDate.getFullYear());
                        temp.setMonth(newDate.getMonth());
                        temp.setDate(newDate.getDate());
                        // 3. Convert sang ISO String để lưu vào form
                        onChange(temp.toISOString());
                      }}
                    />
                  )}
                />
                {/* chọn gioi tính*/}
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { value, onChange }, fieldState }) => (
                    <GenderSelector
                      label={t('common.gender')}
                      value={value}
                      onChange={onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                {/* Component chọn địa chỉ (KTV) bọc trong Controller */}
                <LocationSelector
                  control={control}
                  name="address"
                  setValue={setValue as any}
                  error={errors.address?.message}
                />

                <Text className="my-4 mt-2 text-base font-bold text-gray-800">
                  {t('common.bio')}
                </Text>

                {/* Bio Đa ngôn ngữ */}
                <Controller
                  control={control}
                  name="bio.vi"
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang="VI"
                      placeholder="Mô tả Agency (Tiếng Việt)..."
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bio.cn"
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang="CN"
                      placeholder="描述您的经验和技能 (中文)..."
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="bio.en"
                  render={({ field, fieldState }) => (
                    <LanguageTextArea
                      lang="EN"
                      placeholder="Agency description (English)..."
                      value={field.value}
                      onChangeText={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </View>

              {/* 3. SECURITY SECTION */}
              <View className="mb-8 mt-6 px-4">
                <Text className="mb-3 text-base font-bold text-gray-800">
                  {t('common.security')}
                </Text>

                <Controller
                  control={control}
                  name="old_pass"
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Mật khẩu hiện tại"
                      value={field.value}
                      onChangeText={field.onChange}
                      secureTextEntry
                      error={fieldState.error?.message}
                      icon={<Key size={16} color="#6B7280" />}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="new_pass"
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Mật khẩu mới"
                      value={field.value}
                      onChangeText={field.onChange}
                      secureTextEntry
                      error={fieldState.error?.message}
                      icon={<Key size={16} color="#6B7280" />}
                    />
                  )}
                />
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>

        {/* FOOTER BUTTON */}
        <View className="border-t border-gray-100 bg-white p-4 shadow-lg">
          <TouchableOpacity
            disabled={isSubmitting}
            className={cn(
              'flex-row items-center justify-center rounded-xl py-4',
              isSubmitting ? 'bg-gray-400' : 'bg-[#2B7BBE]'
            )}
            onPress={onSubmit}>
            <Save size={20} color="white" />
            <Text className="ml-4 text-lg font-bold text-white">
              {isSubmitting ? t('common.loading') : t('ktv.services.form.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <BottomEditAvatar ref={bottomEditAvatar} canDelete={user?.profile?.avatar_url !== null} />
    </>
  );
}

// ... Giữ nguyên các component con FormInput và LanguageTextArea như cũ ...
// 1. Input thường (Có hỗ trợ icon và trạng thái disable)
const FormInput = ({
  label,
  value,
  editable = true,
  icon,
  onChangeText,
  keyboardType = 'default',
  error,
  secureTextEntry,
}: any) => (
  <View className="mb-3">
    <Text className="mb-1.5 ml-1 text-sm font-medium text-gray-500">{label}</Text>

    <View
      className={cn(
        'h-14 flex-row items-center rounded-xl border px-4',
        error
          ? 'border-red-500'
          : editable
            ? 'border-gray-200 bg-white'
            : 'border-gray-100 bg-gray-50'
      )}>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        className={cn('flex-1 text-base', editable ? 'text-gray-900' : 'text-gray-500')}
      />
      {icon && <View className="ml-2">{icon}</View>}
    </View>

    {/* ERROR TEXT */}
    {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);

// 2. Text Area đa ngôn ngữ (Có Badge góc phải)
const LanguageTextArea = ({ lang, placeholder, value, onChangeText, error }: any) => (
  <View className="relative mb-4">
    <View
      className={cn(
        'min-h-[100px] rounded-xl border bg-white px-4 py-3',
        error ? 'border-red-500' : 'border-gray-200'
      )}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        className="flex-1 pr-8 pt-1 text-base text-gray-900"
      />
    </View>

    {/* Badge ngôn ngữ */}
    <View className="absolute right-3 top-3 rounded-md bg-gray-100 px-2 py-1">
      <Text className="text-[10px] font-bold text-gray-500">{lang}</Text>
    </View>

    {/* ERROR TEXT */}
    {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);

// Thêm vào phần các Component con ở cuối file
const GenderSelector = ({ label, value, onChange, error }: any) => {
  const { t } = useTranslation();

  const genders = [
    { id: _Gender.MALE, label: t('enum.gender.MALE') },
    { id: _Gender.FEMALE, label: t('enum.gender.FEMALE') },
  ];

  return (
    <View className="mb-3">
      <Text className="mb-1.5 ml-1 text-sm font-medium text-gray-500">{label}</Text>
      <View className="flex-row justify-between space-x-3">
        {genders.map((item) => {
          const isSelected = value === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onChange(item.id)}
              activeOpacity={0.7}
              className={cn(
                'w-[46%] flex-row items-center justify-center rounded-xl border py-2',
                isSelected ? 'border-[#2B7BBE] bg-blue-50' : 'border-gray-200 bg-white'
              )}>
              <View
                className={cn(
                  'mr-2 h-4 w-4 items-center justify-center rounded-full border',
                  isSelected ? 'border-[#2B7BBE]' : 'border-gray-300'
                )}>
                {isSelected && <View className="h-2 w-2 rounded-full bg-[#2B7BBE]" />}
              </View>
              <Text
                className={cn(
                  'text-base font-medium',
                  isSelected ? 'text-[#2B7BBE]' : 'text-gray-600'
                )}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

const ProfileSkeleton = () => (
  <SafeAreaView className="flex-1 bg-white">
    {/* Header Placeholder */}
    <HeaderBack title="profile.edit_info" />

    <ScrollView className="flex-1 px-4">
      {/* 1. Avatar Skeleton */}
      <View className="mb-6 mt-6 items-center">
        <Skeleton className="h-28 w-28 rounded-full" />
      </View>

      {/* 2. Form Fields Skeleton */}
      <View className="space-y-4">
        {[1, 2, 3].map((i) => (
          <View key={i} className="mb-3">
            <Skeleton className="mb-2 h-4 w-24 rounded-sm" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </View>
        ))}

        {/* Gender Selection Skeleton */}
        <View className="mb-3">
          <Skeleton className="mb-2 h-4 w-24 rounded-sm" />
          <View className="flex-row justify-between">
            <Skeleton className="h-14 w-[46%] rounded-xl" />
            <Skeleton className="h-14 w-[46%] rounded-xl" />
          </View>
        </View>

        {/* Bio Skeleton */}
        <Skeleton className="mb-2 mt-4 h-6 w-20" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="mb-4 h-24 w-full rounded-xl" />
        ))}

        {/* Security Skeleton */}
        <Skeleton className="mb-2 mt-4 h-6 w-32" />
        <Skeleton className="mb-3 h-14 w-full rounded-xl" />
        <Skeleton className="mb-10 h-14 w-full rounded-xl" />
      </View>
    </ScrollView>

    {/* Footer Button Skeleton */}
    <View className="border-t border-gray-100 p-4">
      <Skeleton className="h-14 w-full rounded-xl" />
    </View>
  </SafeAreaView>
);
