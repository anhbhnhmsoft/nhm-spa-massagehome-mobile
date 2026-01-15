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
import { Briefcase, Camera, Key, Lock, Plus, Save, User as UserIcon, X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/icon';
import { editProfileKTV, useEditImage } from '@/features/ktv/hooks';
import { Controller } from 'react-hook-form';
import { BottomEditImage } from '@/components/app/ktv/profile-tab';
import { LocationSelector } from '@/components/app/ktv/location-selector';
import dayjs from 'dayjs';
import DateTimePickerInput from '@/components/app/ktv/date-time-input';
import { BottomEditAvatar } from '@/components/app/profile-tab';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditInfoScreen() {
  const { form, profileData, onSubmit, user, isLoading } = editProfileKTV();
  const { removeImage } = useEditImage();
  const { control, handleSubmit, setValue } = form;

  const bottomEditAvatar = useRef<BottomSheetModal>(null);
  const bottomShetImagePicker = useRef<BottomSheetModal>(null);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();

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
            {isLoading && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-base text-gray-500">{t('common.loading')}...</Text>
              </View>
            )}
            {profileData && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                className="flex-1">
                {/* 1. AVATAR SECTION */}

                <View className="mb-6 mt-6 items-center">
                  <View className="relative">
                    {user?.profile.avatar_url !== null && !imageError ? (
                      <Image
                        source={{ uri: user?.profile.avatar_url }}
                        className="h-28 w-28 rounded-full border-4 border-white"
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      // Fallback UI khi không có ảnh hoặc ảnh lỗi
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

                {/* 2. GALLERY SECTION */}
                <View className="mb-6 px-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold text-gray-800">
                      {t('ktv.edit_profile.image.display_images', {
                        count: profileData?.list_images?.length ?? 0,
                      })}{' '}
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap gap-3 pt-4">
                    {/* Nút Thêm ảnh */}
                    {(profileData?.list_images?.length ?? 0) < 5 && (
                      <TouchableOpacity
                        className="h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[#2B7BBE] bg-blue-50"
                        onPress={() => bottomShetImagePicker.current?.present()}>
                        <View className="mb-1 rounded-full bg-[#2B7BBE] p-1">
                          <Plus size={16} color="white" />
                        </View>
                        <Text className="text-[10px] font-medium text-[#2B7BBE]">
                          {t('ktv.edit_profile.image.add_image')}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Danh sách ảnh */}
                    {Array.isArray(profileData?.list_images) &&
                      profileData.list_images.map((img, index) => (
                        <View key={`${img.id}-${index}`} className="relative h-20 w-20">
                          {/* Ảnh */}
                          <View className="h-full w-full overflow-hidden rounded-xl bg-gray-100">
                            <Image
                              source={{ uri: img.image_url || '' }}
                              className="h-full w-full"
                              resizeMode="cover"
                            />
                          </View>

                          {/* Nút xoá */}
                          <TouchableOpacity
                            onPress={() => removeImage(img.id)}
                            activeOpacity={0.8}
                            className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-600">
                            <X size={18} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                </View>

                {/* 3. FORM FIELDS */}
                <View className="space-y-4 px-4">
                  <FormInput
                    label={t('common.full_name')}
                    value={profileData?.name}
                    editable={false}
                    icon={<Lock size={16} color="#9CA3AF" />}
                  />
                  <FormInput
                    label={t('common.phone')}
                    value={profileData?.phone}
                    editable={false}
                    icon={<Lock size={16} color="#9CA3AF" />}
                  />

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
                  <Controller
                    control={control}
                    name="experience"
                    render={({ field, fieldState }) => (
                      <FormInput
                        label={t('common.years_of_experience')}
                        value={field.value !== undefined ? String(field.value) : ''}
                        keyboardType="numeric"
                        error={fieldState.error?.message}
                        onChangeText={(text: string) => {
                          const value = text === '' ? undefined : Number(text);
                          field.onChange(value);
                        }}
                        icon={<Briefcase size={16} color="#9CA3AF" />}
                      />
                    )}
                  />

                  <LocationSelector
                    control={control}
                    name="address"
                    setValue={setValue as any}
                    error={form.formState.errors.address?.message as string | undefined}
                  />

                  {/* Số năm kinh nghiệm (Disabled) */}

                  <Text className="my-4 mt-2 text-base font-bold text-gray-800">
                    {t('common.bio')}
                  </Text>

                  {/* Giới thiệu (Tiếng Việt) */}

                  <Controller
                    control={control}
                    name="bio.vi"
                    render={({ field, fieldState }) => (
                      <LanguageTextArea
                        lang="VI"
                        placeholder="Mô tả kinh nghiệm, kỹ năng chuyên môn (Tiếng Việt)..."
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
                        placeholder="Describe your experience and skills (English)..."
                        value={field.value}
                        onChangeText={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  {/* Giới thiệu (Trung) */}
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
                </View>

                {/* 4. SECURITY SECTION */}
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
                  {/* (No extra bio field here) */}
                </View>
              </ScrollView>
            )}
          </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>

        {/* FOOTER BUTTON */}
        <View className="border-t border-gray-100 bg-white p-4 shadow-lg">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="flex-row items-center justify-center rounded-xl bg-[#2B7BBE] py-4">
            <Save size={20} color="white" />
            <Text className="ml-4 text-lg font-bold text-white">{t('ktv.services.form.save')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <BottomEditAvatar ref={bottomEditAvatar} canDelete={profileData?.avatar_url !== null} />
      <BottomEditImage ref={bottomShetImagePicker} imageLength={profileData?.list_images?.length} />
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
