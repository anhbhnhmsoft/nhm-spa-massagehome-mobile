import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
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

export default function AuthScreen() {
  const { t } = useTranslation();

  const { form, onSubmit, loading } = useHandleAuthenticate();

  const [show, setShow] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        {show ? (
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
              onPress={() => setShow(false)}>
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
              className="mb-10 flex-row items-center rounded-[24px] border border-gray-100 bg-white p-4">
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
                {t('auth.auth_title')}
              </Text>
              <Text className="mb-8 text-base leading-6 text-gray-500">
                {t('auth.auth_description')}
              </Text>

              {/* Input Container */}
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    required
                    label={t('common.phone')}
                    placeholder={t('auth.placeholder_phone')}
                    keyboardType="number-pad"
                    autoFocus={true}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors?.phone?.message}
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
