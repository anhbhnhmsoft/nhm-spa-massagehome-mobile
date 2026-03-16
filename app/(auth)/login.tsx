import { useTranslation } from 'react-i18next';
import { useHandleLogin } from '@/features/auth/hooks';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform, Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FormInput } from '@/components/ui/form-input';


export default function LoginScreen() {
  const { t } = useTranslation();

  const { form, onSubmit, onForgotPassword, loading } = useHandleLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-5 pt-4 justify-between"
        >
          {/* --- CONTENT --- */}
          <View>
            {/* Title */}
            <Text className="text-2xl text-center font-inter-bold text-gray-900 mb-2">
              {t('auth.login_title')}
            </Text>
            <Text className="text-gray-500 text-base mb-8 leading-6">
              {t('auth.login_description')}
            </Text>

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  id="password"
                  required
                  description={t('common.password_description')}
                  placeholder={t('common.password')}
                  label={t('common.password')}
                  error={errors.password?.message}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  textContentType={'password'}
                  isPassword={true}
                />
              )}
            />
          </View>

          <View className="mb-6 gap-4">

            {/* Nút Quên mật khẩu */}
            <View className="flex-row items-center justify-center">
              <TouchableOpacity
                onPress={onForgotPassword}
                disabled={loading}
                activeOpacity={0.6}
              >
                <Text className={cn('font-inter-semibold',
                  !loading
                    ? 'text-primary-color-2'
                    : 'text-gray-400')}>
                  {loading ? t('common.loading') : t('common.forgot_password')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Nút Tiếp tục / Xác nhận */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              className={cn(
                'w-full py-4 rounded-full items-center justify-center',
                !loading
                  ? 'bg-primary-color-2'
                  : 'bg-gray-300',
              )}
            >
              <Text className="text-white text-lg font-inter-bold">
                {loading ? t('common.loading') : t('common.continue')}
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
