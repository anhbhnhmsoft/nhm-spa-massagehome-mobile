import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TouchableWithoutFeedback, Keyboard, View, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { useHandleRegister } from '@/features/auth/hooks';
import { Controller } from 'react-hook-form';
import {Input} from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Check, Eye, EyeOff, Mars, Venus, ChevronDown } from 'lucide-react-native';
import { _Gender } from '@/features/auth/const';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { _LanguagesMap } from '@/lib/const';
import { SelectLanguageModal } from '@/components/select-language';


export default function RegisterScreen() {
  const {t} = useTranslation();

  const {form, onSubmit, loading} = useHandleRegister();

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const languageSheetRef = useRef<BottomSheetModal>(null);

  const {
    control,
    handleSubmit,
    formState: { errors},
  } = form;

  return (
    <SafeAreaView
      className="relative h-full flex-1 bg-white"
      edges={['top', 'bottom']}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1}}
          enableOnAndroid={true}
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-4 justify-between gap-8">
            <View className="items-center flex-1 w-full">
              <Text className="text-2xl font-inter-bold text-gray-900 text-center mb-3">
                {t('auth.register_title')}
              </Text>
              <Text className="text-gray-500 text-center text-base px-4 leading-6 mb-4">
                {t('auth.register_description')}
              </Text>
              {/* Input Container */}
              <View className={"flex-1 gap-4 w-full"}>
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
                        className={cn('h-12 w-full rounded-2xl bg-white overflow-hidden px-4', {
                          'border-red-500': errors.name,
                        })}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                      {errors.name && (
                        <Text className="text-sm text-red-500">
                          {errors.name.message}
                        </Text>
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
                        className={cn('h-12 w-full rounded-2xl bg-white overflow-hidden px-4', {
                          'border-red-500': errors.referral_code,
                        })}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                      {errors.referral_code && (
                        <Text className="text-sm text-red-500">
                          {errors.referral_code.message}
                        </Text>
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

                {/* Gender Input */}
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <View className={"gap-2"}>
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
                        <Text className="text-sm text-red-500">
                          {errors.gender.message}
                        </Text>
                      )}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="language"
                  render={({ field: { onChange, value } }) => {
                    const langConfig = _LanguagesMap.find((lang) => lang.code === value);

                    return(
                      <View className={"gap-2"}>
                        <Label htmlFor="language">{t('common.language')} *</Label>
                        <TouchableOpacity
                          className="flex-row h-12 items-center justify-between rounded-2xl border border-gray-300 bg-white px-3 py-1.5 backdrop-blur-md"
                          onPress={() => languageSheetRef.current?.present()}
                        >
                          <View className={"flex-row gap-2 items-center"}>
                            <Image source={langConfig?.icon} className="mr-2 h-6 w-6" />
                            <Text className="mr-1 font-medium">{langConfig?.label}</Text>
                          </View>
                          <ChevronDown color="gray" size={16} />
                        </TouchableOpacity>

                        <SelectLanguageModal ref={languageSheetRef} onChange={onChange} value={value} closeOnSelect={true} />

                        {errors.language && (
                          <Text className="text-sm text-red-500">
                            {errors.language.message}
                          </Text>
                        )}
                      </View>
                    )
                  }}
                />

              </View>
            </View>
            <View className="mt-8 mb-8 w-full">
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className={cn(
                  "w-full py-4 rounded-full items-center justify-center",
                  !loading
                    ? "bg-primary-color-2"
                    : "bg-[#E0E0E0]"
                )}
              >
                <Text className="text-white text-lg font-bold">
                  {t('common.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
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
        "flex-1 aspect-[0.85] rounded-2xl items-center justify-center border",
        isActive
          ? "bg-blue-100 border-blue-300"
          : "bg-white border-gray-200"
      )}
    >
      {/* Icon Circle Wrapper */}
      <View
        className={cn(
          "w-20 h-20 rounded-full items-center justify-center mb-3",
          isActive ? "bg-blue-200" : "bg-gray-100"
        )}
      >
        {label === 'Nam' ? (
          <Icon as={Mars} size={48} className={isActive ? "text-blue-400" : "text-[#9CA3AF]"}  />
        ) : (
          <Icon as={Venus} size={48} className={isActive ? "text-blue-400" : "text-[#9CA3AF]"}/>
        )}
      </View>

      <Text className={cn(
        "text-lg font-medium",
        isActive ? "text-gray-900" : "text-gray-500"
      )}>
        {label}
      </Text>

      {/* Dấu tích nhỏ (Optional - thêm vào cho xịn nếu muốn) */}
      {isActive && (
        <View className="absolute top-3 right-3 bg-blue-400 rounded-full p-1">
          <Check size={12} color="white" strokeWidth={4} />
        </View>
      )}
    </TouchableOpacity>
  );
};
