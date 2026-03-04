import { useTranslation } from 'react-i18next';
import {Text} from '@/components/ui/text';
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

export default function VerifyOtpScreen() {
  const {t} = useTranslation();

  const {
    phone,
    form,
    onSubmit,
    loading: loadingVerifyOTP,
  } = useHandleVerifyOtp();

  const {
    resendOTP,
    secondsLeft,
    loading: loadingResendOTP,
  } = useHandleResendOtp()

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue
  } = form;

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 px-5 pt-4 justify-between"
          >

            {/* --- CONTENT --- */}
            <View className="flex-1 px-6 items-center mt-6">

              {/* Title */}
              <Text className="text-2xl font-inter-bold text-gray-900 text-center mb-3">
                {t('auth.auth_verify_title')}
              </Text>

              {/* Subtitle */}
              <View className={"gap-2 justify-center items-center mb-4"}>
                <Text className="text-gray-500 text-center text-base px-4 leading-6">
                  {t('auth.auth_verify_description')}
                </Text>
                <Text className="font-inter-bold text-primary-color-1">{phone}</Text>
              </View>


              {/* --- OTP INPUT --- */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { value } }) => (
                     <OtpCodeField value={value} setValue={(text) => setValue('otp', text, { shouldValidate: true })} />
                  )}
                />
              </View>
            </View>

            {/* --- FOOTER (Gửi lại & Nút Tiếp tục) --- */}
            <View className="px-6 mb-8 w-full">
              {/* Text Gửi lại SMS */}
              <TouchableOpacity
                onPress={resendOTP}
                disabled={secondsLeft > 0 || loadingVerifyOTP || loadingResendOTP}
                className="items-center mb-6"
              >
                <Text className={cn(
                  "text-base font-inter-medium",
                  secondsLeft > 0 ? "text-primary-color-2" : "text-gray-500"
                )}>
                  {secondsLeft > 0 ? `${t('auth.resend_otp')} (${secondsLeft})` : t('auth.resend_otp')}
                </Text>
              </TouchableOpacity>

              {/* Button Tiếp tục */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || loadingVerifyOTP || loadingResendOTP}
                className={cn(
                  "w-full py-4 rounded-full items-center justify-center",
                  isValid
                    ? "bg-primary-color-2"
                    : "bg-slate-100"
                )}
              >
                <Text className="text-white text-lg font-inter-bold">
                  {t('common.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  )
}
