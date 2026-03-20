import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import { useHandleAuthenticate } from '@/features/auth/hooks';
import { FormInput } from '@/components/ui/form-input';
import { AtSign, ChevronRightIcon, PhoneIcon } from 'lucide-react-native';
import { useState } from 'react';
import { _TypeAuthenticate } from '@/features/auth/const';

export default function AuthScreen() {
  const { t } = useTranslation();

  const { form, onSubmit, loading } = useHandleAuthenticate();

  const [showSelection, setShowSelection] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const typeAuthenticate = watch('type_authenticate');
  const isPhone = typeAuthenticate === _TypeAuthenticate.PHONE;
  const inputLabel = isPhone ? t('common.phone') : t('common.email');
  const inputPlaceholder = isPhone ? t('auth.placeholder_phone') : t('common.email');
  const inputKeyboardType = isPhone ? 'number-pad' : 'email-address';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        {showSelection ? (
          <View className="flex-1 bg-white px-4 pt-12">
            {/* Header */}
            <Text className="mb-2 font-inter-bold text-2xl tracking-tight text-gray-900">
              {t('common.welcome_back')}
            </Text>
            <Text className="mb-10 text-base leading-6 text-gray-500">
              {t('common.choose_method')}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              className="mb-4 flex-row items-center rounded-[24px] border border-gray-100 bg-white p-4"
              onPress={() => {
                setValue('type_authenticate', _TypeAuthenticate.PHONE);
                setValue('username', '');
                setShowSelection(false);
              }}>
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-base-color-3">
                <PhoneIcon size={24} color="#044984" />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-semibold text-gray-900">
                  {t('common.login_phone')}
                </Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            {/* Email Option */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="mb-10 flex-row items-center rounded-[24px] border border-gray-100 bg-white p-4"
              onPress={() => {
                setValue('type_authenticate', _TypeAuthenticate.EMAIL);
                setValue('username', '');
                setShowSelection(false);
              }}>
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-base-color-3">
                <AtSign size={24} color="#044984" />
              </View>
              <View className="flex-1">
                <Text className="text-[17px] font-semibold text-gray-900">{t('common.email')}</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
            className="flex-1 justify-between px-5 pt-4">
            {/* --- CONTENT --- */}
            <View>
              {/* Title */}
              <Text className="mb-2 font-inter-bold text-2xl text-gray-900">
                {t(isPhone ? 'auth.auth_title_phone' : 'auth.auth_title_email')}
              </Text>
              <Text className="mb-8 text-base leading-6 text-gray-500">
                {t(isPhone ? 'auth.auth_description_phone' : 'auth.auth_description_email')}
              </Text>

              {/* Input Container */}
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    required
                    label={inputLabel}
                    placeholder={inputPlaceholder}
                    keyboardType={inputKeyboardType}
                    autoFocus={true}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors?.username?.message}
                    autoCapitalize={isPhone ? 'none' : 'none'}
                  />
                )}
              />
            </View>

            {/* --- FOOTER BUTTON --- */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading} // Disable khi đang loading
                className={cn(
                  'w-full items-center justify-center rounded-full py-4',
                  !loading
                    ? 'bg-primary-color-2' // Màu xanh theme Glow (Active)
                    : 'bg-gray-300' // Màu xám (Disabled)
                )}>
                <Text className="font-inter-bold text-lg text-white">
                  {loading ? t('common.loading') : t('common.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
