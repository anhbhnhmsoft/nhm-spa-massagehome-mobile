import { _TypeAuthenticate } from '@/features/auth/const';
import { Text } from '@/components/ui/text';
import { useHandleResendOtp, useHandleVerifyOtp } from '@/features/auth/hooks';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import OtpCodeField from '@/components/ui/otp-code-field';
import { useTranslation } from 'react-i18next';

export default function VerifyOtpScreen() {
  const { t } = useTranslation();

  const {
    username,
    typeAuthenticate,
    form,
    onSubmit,
    loading: loadingVerifyOTP,
  } = useHandleVerifyOtp();
  const { resendOTP, secondsLeft, loading: loadingResendOTP } = useHandleResendOtp();
  const isPhone = typeAuthenticate === _TypeAuthenticate.PHONE;

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
  } = form;

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-between px-5 pt-4">
            {/* --- CONTENT --- */}
            <View className="mt-6 flex-1 items-center px-6">
              {/* Title */}
              <Text className="mb-3 text-center font-inter-bold text-2xl text-gray-900">
                {t(isPhone ? 'auth.auth_verify_title_phone' : 'auth.auth_verify_title_email')}
              </Text>

              {/* Subtitle */}
              <View className={'mb-4 items-center justify-center gap-2'}>
                <Text className="px-4 text-center text-base leading-6 text-gray-500">
                  {t(
                    isPhone
                      ? 'auth.auth_verify_description_phone'
                      : 'auth.auth_verify_description_email'
                  )}
                </Text>
                <Text className="font-inter-bold text-primary-color-1">{username}</Text>
              </View>

              {/* --- OTP INPUT --- */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { value } }) => (
                    <OtpCodeField
                      value={value}
                      setValue={(text) => setValue('otp', text, { shouldValidate: true })}
                    />
                  )}
                />
              </View>
            </View>

            {/* --- FOOTER (Gửi lại & Nút Tiếp tục) --- */}
            <View className="mb-8 w-full px-6">
              {/* Text Gửi lại SMS */}
              <TouchableOpacity
                onPress={resendOTP}
                disabled={secondsLeft > 0 || loadingVerifyOTP || loadingResendOTP}
                className="mb-6 items-center">
                <Text
                  className={cn(
                    'font-inter-medium text-base',
                    secondsLeft > 0 ? 'text-primary-color-2' : 'text-gray-500'
                  )}>
                  {secondsLeft > 0
                    ? `${t(isPhone ? 'auth.resend_otp_phone' : 'auth.resend_otp_email')} (${secondsLeft})`
                    : t(isPhone ? 'auth.resend_otp_phone' : 'auth.resend_otp_email')}
                </Text>
              </TouchableOpacity>

              {/* Button Tiếp tục */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || loadingVerifyOTP || loadingResendOTP}
                className={cn(
                  'w-full items-center justify-center rounded-full py-4',
                  isValid ? 'bg-primary-color-2' : 'bg-slate-100'
                )}>
                <Text className="font-inter-bold text-lg text-white">{t('common.continue')}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
}
