import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Text} from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import { useHandleAuthenticate } from '@/features/auth/hooks';

export default function AuthScreen() {

  const {t} = useTranslation();

  const {form, onSubmit, loading} = useHandleAuthenticate();

  const {
    control,
    handleSubmit,
    formState: { errors },
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
            <View>
              {/* Title */}
              <Text className="text-2xl font-inter-bold text-gray-900 mb-2">
                {t('auth.auth_title')}
              </Text>
              <Text className="text-gray-500 text-base mb-8 leading-6">
                {t('auth.auth_description')}
              </Text>

              {/* Input Container */}
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View
                      className={cn(
                        "flex-row items-center h-14 rounded-2xl border bg-white overflow-hidden",
                        // Logic đổi màu viền: Đỏ nếu lỗi, Xanh nếu focus (bạn có thể custom), mặc định Xám
                        errors.phone ? "border-red-500" : "border-gray-200"
                      )}
                    >
                      {/* Text Input */}
                      <TextInput
                        className="flex-1 h-full px-4 text-lg text-gray-900 font-medium items-center"
                        placeholder={t('auth.placeholder_phone')}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        autoFocus={true}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </View>

                    {/* Hiển thị lỗi (nếu cần thiết, trong design gốc không thấy nhưng nên có) */}
                    {errors.phone && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.phone.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* --- FOOTER BUTTON --- */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading} // Disable khi đang loading
                className={cn(
                  "w-full py-4 rounded-full items-center justify-center",
                  !loading
                    ? "bg-primary-color-2" // Màu xanh theme Glow (Active)
                    : "bg-gray-300" // Màu xám (Disabled)
                )}
              >
                <Text className="text-white text-lg font-bold">
                  {loading ? t('common.loading') : t('common.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
}
