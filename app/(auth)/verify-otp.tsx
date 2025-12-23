import { useTranslation } from 'react-i18next';
import {Text} from '@/components/ui/text';
import { useHandleVerifyRegisterOtp } from '@/features/auth/hooks';
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
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function VerifyOTPScreen() {
  const {t} = useTranslation();

  const {
    phoneAuthen,
    timer,
    form,
    onSubmit,
    resendOTP,
    loading,
  } = useHandleVerifyRegisterOtp();

  const {
    control,
    handleSubmit,
    formState: { isValid },
      watch,
    setValue
  } = form;

  // Theo dõi giá trị để hook của thư viện hoạt động
  const otpValue = watch('otp');

// Hook của thư viện: Tự động ẩn bàn phím khi nhập đủ
  const ref = useBlurOnFulfill({ value: otpValue, cellCount: CELL_COUNT });

// Hook của thư viện: Xử lý logic focus vào từng ô
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otpValue,
    setValue: (text) => setValue('otp', text, { shouldValidate: true }), // Update React Hook Form
  });

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
                <Text className="font-inter-bold text-primary-color-1">{phoneAuthen}</Text>
              </View>


              {/* --- OTP INPUT --- */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, value } }) => (
                    <CodeField
                      ref={ref}
                      {...props}
                      value={value}
                      onChangeText={onChange}
                      cellCount={CELL_COUNT}
                      rootStyle={{ marginTop: 0, width: '100%' }} // Style container chính
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoFocus={true}
                      renderCell={({ index, symbol, isFocused }) => (
                        <View
                          key={index}
                          onLayout={getCellOnLayoutHandler(index)}
                          className={cn(
                            // Dùng % để không bị vỡ giao diện trên màn hình nhỏ
                            "w-[14%] aspect-square rounded-xl border justify-center items-center bg-white",

                            // Logic viền:
                            // - isFocused: Màu xanh (Active)
                            // - symbol (đã nhập): Màu xám đậm hơn chút (Optional, ở đây giữ nguyên logic cũ)
                            // - chưa nhập: Màu xám nhạt
                            isFocused ? "border-primary-color-2 border-[1.5px]" : "border-gray-300"
                          )}
                        >
                          <Text className="text-2xl font-inter-medium text-black">
                            {symbol || (isFocused ? <Cursor /> : null)}
                          </Text>
                        </View>
                      )}
                    />
                  )}
                />
              </View>
            </View>

            {/* --- FOOTER (Gửi lại & Nút Tiếp tục) --- */}
            <View className="px-6 mb-8 w-full">
              {/* Text Gửi lại SMS */}
              <TouchableOpacity
                onPress={resendOTP}
                disabled={timer > 0 || loading}
                className="items-center mb-6"
              >
                <Text className={cn(
                  "text-base font-inter-medium",
                  timer > 0 ? "text-primary-color-2" : "text-gray-500"
                )}>
                  {timer > 0 ? `${t('auth.resend_otp')} (${timer})` : t('auth.resend_otp')}
                </Text>
              </TouchableOpacity>

              {/* Button Tiếp tục */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || loading}
                className={cn(
                  "w-full py-4 rounded-full items-center justify-center",
                  isValid
                    ? "bg-primary-color-2"
                    : "bg-[#E0E0E0]"
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
