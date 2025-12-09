import { useTranslation } from 'react-i18next';
import { useHandleLogin } from '@/features/auth/hooks';
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
import { Controller } from 'react-hook-form';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Eye, EyeOff } from 'lucide-react-native';


export default function LoginScreen() {
  const {t} = useTranslation();

  const { form, onSubmit, loading } = useHandleLogin();

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

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
                  <View className="gap-2">
                    <View className="relative">
                      <Input
                        id="password"
                        value={value}
                        placeholder={'**********'}
                        className={cn('h-12 w-full rounded-2xl bg-white overflow-hidden px-4', {
                          'border-red-500': errors.password,
                        })}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        secureTextEntry={!passwordVisible}
                        textContentType={"password"}
                      />
                      <TouchableOpacity
                        className="absolute bottom-0 right-4 top-0 justify-center"
                        onPress={() => setPasswordVisible(!passwordVisible)}>
                        <Icon
                          as={passwordVisible ? EyeOff : Eye}
                          size={24}
                          opacity={0.6}
                        />
                      </TouchableOpacity>
                    </View>

                    {errors.password && (
                      <Text className="text-sm text-red-500">
                        {errors.password.message}
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
                    ? "bg-primary-color-2"
                    : "bg-gray-300"
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
  )
}
