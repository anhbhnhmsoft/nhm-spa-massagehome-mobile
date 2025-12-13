import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { _Gender } from '@/features/auth/const';
import { router } from 'expo-router';
import { CalendarIcon, ChevronLeft } from 'lucide-react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator, Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity, TouchableWithoutFeedback,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text} from '@/components/ui/text';
import dayjs from 'dayjs';
import { useEditProfile } from '@/features/auth/hooks';
import { ReactNode, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icon } from '@/components/ui/icon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePickerInput from '@/components/date-time-input';
import { cn } from '@/lib/utils';

export default function EditProfileScreen() {
  const { t } = useTranslation();

  // State cho DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    form,
    onSubmit
  } = useEditProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;


  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar  />

      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
        <TouchableOpacity className="p-1" onPress={() => router.back()}>
          <Icon as={ChevronLeft} size={24} className="text-slate-800" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800">{t('profile.edit_info')}</Text>
        <View className="w-8" />
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={{ flex: 1, padding: 16 }}
          contentContainerStyle={{ flexGrow: 1}}
          enableOnAndroid={true}
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Name Field */}
          <FormInput
            label={t('common.full_name')}
            error={errors.name?.message}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={cn(
                    'rounded-lg border border-gray-300 px-4 py-3 text-base text-slate-800',
                    errors.name?.message && 'border-red-500'
                  )}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Nhập họ và tên"
                />
              )}
            />
          </FormInput>

          {/* Gender Field (Custom Select UI) */}
          <FormInput label={t('common.gender')} error={errors.gender?.message}>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-4">
                  {[
                    { label: t('common.male'), value: _Gender.MALE },
                    { label: t('common.female'), value: _Gender.FEMALE },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => onChange(item.value)}
                      className={cn(
                        'flex-1 flex-row items-center justify-center rounded-lg border py-3',
                        value === item.value
                          ? 'border-primary-color-2 bg-primary-color-2/10'
                          : 'border-gray-300 bg-white'
                      )}
                    >
                      <Text
                        className={cn(
                          'font-inter-medium',
                          value === item.value ? 'text-primary-color-2' : 'text-gray-600'
                        )}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </FormInput>

          {/* Date of Birth Field */}
          <FormInput label={t('common.date_of_birth')} error={errors.date_of_birth?.message}>
            <Controller
              control={control}
              name="date_of_birth"
              render={({ field: { value, onChange } }) => (
                <DateTimePickerInput
                  mode="date"
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
          </FormInput>

          {/* Bio Field */}
          <FormInput label={t('common.bio')} error={errors.bio?.message}>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="h-24 rounded-lg border border-gray-300 px-4 py-3 text-base text-slate-800"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  textAlignVertical="top"
                  placeholder="Giới thiệu đôi chút về bản thân..."
                />
              )}
            />
          </FormInput>

          <View className="my-4 h-[1px] bg-gray-200" />
          <Text className="mb-4 text-lg font-bold text-slate-800">Bảo mật</Text>

          {/* Old Password */}
          <FormInput label={t('common.old_password')} error={errors.old_password?.message}>
            <Controller
              control={control}
              name="old_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-base text-slate-800"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  placeholder="Nhập mật khẩu hiện tại"
                />
              )}
            />
          </FormInput>

          {/* New Password */}
          <FormInput label={t('common.new_password')} error={errors.new_password?.message}>
            <Controller
              control={control}
              name="new_password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-lg border border-gray-300 px-4 py-3 text-base text-slate-800"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  placeholder="Nhập mật khẩu mới"
                />
              )}
            />
          </FormInput>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>

      {/* Submit Button */}
      <View className="px-4 py-4 items-center flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={isSubmitting}
          className={`flex-1 flex-row items-center justify-center rounded-lg py-3 bg-base-color-3`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-lg font-inter-bold text-primary-color-2">
            {t('common.back')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`flex-1 flex-row items-center justify-center rounded-lg py-3 bg-primary-color-2`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" className="mr-2" />
          ) : null}
          <Text className="text-lg font-inter-bold text-white">
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper Component để render Label và Error Message gọn gàng
const FormInput = ({
                     label,
                     children,
                     error,
                   }: {
  label: string;
  children: ReactNode;
  error?: string;
}) => (
  <View className="mb-4">
    <Text className="mb-2 text-sm font-inter-semibold text-gray-700">{label}</Text>
    {children}
    {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);