import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useHandleRegister } from '@/features/auth/hooks';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import {
  Check,
  CheckSquare,
  ChevronDown,
  Eye,
  EyeOff,
  Mars,
  Square,
  Venus,
} from 'lucide-react-native';
import { _Gender } from '@/features/auth/const';
import { _LanguagesMap } from '@/lib/const';
import { SelectLanguageModal } from '@/components/select-language';
import { router } from 'expo-router';
import { ContractFileType } from '@/features/file/const';
import { useReferralStore } from '@/features/affiliate/store';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const user_referral = useReferralStore((state) => state.user_referral);
  const { form, onSubmit, loading } = useHandleRegister();

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const [modalLangVisible, setModalLangVisible] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;
  useEffect(() => {
    if (user_referral) {
      setValue('referral_code', user_referral.id);
    }
  }, [user_referral]);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  return (
    <SafeAreaView className="relative h-full flex-1 bg-white" edges={['top', 'bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-between gap-8 px-5 pt-4">
            <View className="w-full flex-1 items-center">
              <Text className="mb-3 text-center font-inter-bold text-2xl text-gray-900">
                {t('auth.register_title')}
              </Text>
              <Text className="mb-4 px-4 text-center text-base leading-6 text-gray-500">
                {t('auth.register_description')}
              </Text>
              {/* Input Container */}
              <View className={'w-full flex-1 gap-4'}>
                {/* Name Input */}
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="gap-2">
                      <Label htmlFor="name">{t('common.name')} *</Label>
                      <Input
                        id="name"
                        placeholder={t('common.name')}
                        value={value}
                        className={cn('h-12 w-full overflow-hidden rounded-2xl bg-white px-4', {
                          'border-red-500': errors.name,
                        })}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                      {errors.name && (
                        <Text className="text-sm text-red-500">{errors.name.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Reference Input */}
                <Controller
                  control={control}
                  name="referral_code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="gap-2">
                      <Label htmlFor="referral_code">{t('common.referral_code')}</Label>
                      <Input
                        id="referral_code"
                        placeholder={t('common.referral_code')}
                        value={value || ''}
                        className={cn('h-12 w-full overflow-hidden rounded-2xl bg-white px-4', {
                          'border-red-500': errors.referral_code,
                        })}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        editable={!user_referral}
                      />
                      {errors.referral_code && (
                        <Text className="text-sm text-red-500">{errors.referral_code.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Password Input */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="gap-2">
                      <Label htmlFor="password">{t('common.password')} *</Label>
                      <View className="relative">
                        <Input
                          id="password"
                          value={value}
                          placeholder={'**********'}
                          className={cn('h-12 w-full overflow-hidden rounded-2xl bg-white px-4', {
                            'border-red-500': errors.password,
                          })}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          secureTextEntry={!passwordVisible}
                          textContentType={'password'}
                        />
                        <TouchableOpacity
                          className="absolute bottom-0 right-4 top-0 justify-center"
                          onPress={() => setPasswordVisible(!passwordVisible)}>
                          <Icon as={passwordVisible ? EyeOff : Eye} size={24} opacity={0.6} />
                        </TouchableOpacity>
                      </View>

                      {errors.password && (
                        <Text className="text-sm text-red-500">{errors.password.message}</Text>
                      )}
                    </View>
                  )}
                />

                {/* Gender Input */}
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View className={'gap-2'}>
                      <Label htmlFor="gender">{t('common.gender')} *</Label>
                      <View className="flex-row justify-between gap-x-4">
                        {/* --- CARD: NAM --- */}
                        <GenderCard
                          label={t('common.male')}
                          isActive={value === _Gender.MALE}
                          onPress={() => onChange(_Gender.MALE)}
                        />

                        {/* --- CARD: NỮ --- */}
                        <GenderCard
                          label={t('common.female')}
                          isActive={value === _Gender.FEMALE}
                          onPress={() => onChange(_Gender.FEMALE)}
                        />
                      </View>
                      {errors.gender && (
                        <Text className="text-sm text-red-500">{errors.gender.message}</Text>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="language"
                  render={({ field: { onChange, value } }) => {
                    const langConfig = _LanguagesMap.find((lang) => lang.code === value);

                    return (
                      <View className={'gap-2'}>
                        <Label htmlFor="language">{t('common.language')} *</Label>
                        <TouchableOpacity
                          className="h-12 flex-row items-center justify-between rounded-2xl border border-gray-300 bg-white px-3 py-1.5 backdrop-blur-md"
                          onPress={() => setModalLangVisible(true)}>
                          <View className={'flex-row items-center gap-2'}>
                            <Image source={langConfig?.icon} className="mr-2 h-6 w-6" />
                            <Text className="mr-1 font-inter-medium">{langConfig?.label}</Text>
                          </View>
                          <ChevronDown color="gray" size={16} />
                        </TouchableOpacity>

                        <SelectLanguageModal
                          onClose={() => setModalLangVisible(false)}
                          visible={modalLangVisible}
                          onChange={onChange}
                          value={value}
                          closeOnSelect={true}
                        />

                        {errors.language && (
                          <Text className="text-sm text-red-500">{errors.language.message}</Text>
                        )}
                      </View>
                    );
                  }}
                />
                {/* Terms and Conditions với useState */}
                <View className="mt-4 px-1">
                  <View className="flex-row items-start gap-3">
                    {/* Ô Checkbox */}
                    <TouchableOpacity
                      onPress={() => setIsAgreed(!isAgreed)}
                      activeOpacity={0.7}
                      className="mt-0.5">
                      <Icon
                        as={isAgreed ? CheckSquare : Square}
                        size={22}
                        className={isAgreed ? 'text-primary-color-2' : 'text-gray-400'}
                      />
                    </TouchableOpacity>

                    {/* Nội dung văn bản có chứa link */}
                    <View className="flex-1">
                      <Text className="font-inter-regular leading-5 text-gray-600">
                        {t('auth.i_agree_to')}{' '}
                        <Text
                          className="font-inter-bold text-primary-color-2 underline"
                          onPress={() =>
                            router.push({
                              pathname: '/(auth)/term-or-use-pdf',
                              params: {
                                type: ContractFileType.TERM_OF_USE.toString(), // ✅ number OK
                              },
                            })
                          }>
                          {t('auth.terms_and_conditions')}
                        </Text>{' '}
                        {t('common.and')}{' '}
                        <Text
                          className="font-inter-bold text-primary-color-2 underline"
                          onPress={() =>
                            router.push({
                              pathname: '/(auth)/term-or-use-pdf',
                              params: {
                                type: ContractFileType.POLICY_PRIVACY.toString(), // ✅ number OK
                              },
                            })
                          }>
                          {t('auth.privacy_policy')}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-8 mt-8 w-full">
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading || !isAgreed}
                className={cn(
                  'w-full items-center justify-center rounded-full py-4',
                  !loading && isAgreed ? 'bg-primary-color-2' : 'bg-[#E0E0E0]'
                )}>
                <Text className="font-inter-bold text-lg text-white">{t('common.continue')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// --- SUB COMPONENT: GENDER CARD ---
// Tách ra cho code gọn gàng
const GenderCard = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'aspect-[0.85] flex-1 items-center justify-center rounded-2xl border',
        isActive ? 'border-blue-300 bg-blue-100' : 'border-gray-200 bg-white'
      )}>
      {/* Icon Circle Wrapper */}
      <View
        className={cn(
          'mb-3 h-20 w-20 items-center justify-center rounded-full',
          isActive ? 'bg-blue-200' : 'bg-gray-100'
        )}>
        {label === 'Nam' ? (
          <Icon as={Mars} size={48} className={isActive ? 'text-blue-400' : 'text-[#9CA3AF]'} />
        ) : (
          <Icon as={Venus} size={48} className={isActive ? 'text-blue-400' : 'text-[#9CA3AF]'} />
        )}
      </View>

      <Text
        className={cn('font-inter-medium text-lg', isActive ? 'text-gray-900' : 'text-gray-500')}>
        {label}
      </Text>

      {/* Dấu tích nhỏ (Optional - thêm vào cho xịn nếu muốn) */}
      {isActive && (
        <View className="absolute right-3 top-3 rounded-full bg-blue-400 p-1">
          <Check size={12} color="white" strokeWidth={4} />
        </View>
      )}
    </TouchableOpacity>
  );
};
