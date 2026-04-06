import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useHandleRegister } from '@/features/auth/hooks';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import React, { Fragment, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import {
  CheckSquare,
  ChevronDown,
  Square,
} from 'lucide-react-native';
import { _Gender, _TypeAuthenticate } from '@/features/auth/const';
import { _LanguagesMap } from '@/lib/const';
import { SelectLanguageModal } from '@/components/app/select-language';
import { router } from 'expo-router';
import { ContractFileType } from '@/features/file/const';
import { useReferralStore } from '@/features/affiliate/store';
import { FormInput } from '@/components/ui/form-input';
import { GenderCard } from '@/components/app/gender-card';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const user_referral = useReferralStore((state) => state.user_referral);

  const { form, onSubmit, loading } = useHandleRegister();

  const [modalLangVisible, setModalLangVisible] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const typeAuthenticate = watch('type_authenticate');

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
          showsVerticalScrollIndicator={false}
        >
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
                    <FormInput
                      id="name"
                      required
                      placeholder={t('common.name')}
                      label={t('common.name')}
                      error={errors.name?.message}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />

                {/* Phone Input */}
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <>
                      {
                        typeAuthenticate === _TypeAuthenticate.EMAIL ? (
                          <FormInput
                            id="phone"
                            required
                            placeholder={t('common.phone')}
                            label={t('common.phone')}
                            error={errors.phone?.message}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                          />
                        )
                        : <Fragment />
                      }
                    </>
                  )}
                />

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

                {/* Reference Input */}
                <Controller
                  control={control}
                  name="referral_code"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormInput
                      id="referral_code"
                      placeholder={t('common.referral_code')}
                      label={t('common.referral_code')}
                      error={errors.referral_code?.message}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value || ''}
                      editable={!user_referral}
                    />
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

                {/* Language Input */}
                <Controller
                  control={control}
                  name="language"
                  render={({ field: { onChange, value } }) => {
                    const langConfig = _LanguagesMap.find((lang) => lang.code === value);
                    return (
                      <View className={'gap-2'}>
                        <Label htmlFor="language">{t('common.language')}</Label>
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

              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
      <View className="w-full px-5">
        {/* Terms and Conditions với useState */}
        <View className="my-4 p px-1">
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
                      pathname: '/(app)/term-or-use-pdf',
                      params: {
                        type: ContractFileType.TERM_OF_USE.toString(),
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
                      pathname: '/(app)/term-or-use-pdf',
                      params: {
                        type: ContractFileType.POLICY_PRIVACY.toString(),
                      },
                    })
                  }>
                  {t('auth.privacy_policy')}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading || !isAgreed}
          className={cn(
            'w-full items-center justify-center rounded-full py-4',
            !loading && isAgreed ? 'bg-primary-color-2' : 'bg-gray-300',
          )}>
          <Text className="font-inter-bold text-lg text-white">{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}