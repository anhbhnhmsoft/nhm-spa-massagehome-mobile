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
import { Controller } from 'react-hook-form';
import { FormInput } from '@/components/ui/form-input';
import { cn } from '@/lib/utils';
import { useResetPassword } from '@/features/auth/hooks';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();

  const { form, onSubmit, loading } = useResetPassword();

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
              {t('auth.reset_password_title')}
            </Text>
            <Text className="text-gray-500 text-base mb-8 leading-6">
              {t('auth.reset_password_description')}
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
                  placeholder={t('common.new_password')}
                  label={t('common.new_password')}
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
                {loading ? t('common.loading') : t('auth.btn_reset_password')}
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
