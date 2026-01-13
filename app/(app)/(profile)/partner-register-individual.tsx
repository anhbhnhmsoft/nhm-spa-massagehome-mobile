import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { _UserRole } from '@/features/auth/const';
import { useProvinces } from '@/features/location/hooks/use-query';
import useAuthStore from '@/features/auth/store';
import { useImagePicker } from '@/features/app/hooks/use-image-picker';
import {
  getFilesByType,
  usePartnerRegisterForm,
} from '@/features/user/hooks/use-partner-register-form';
import { ImageSlot } from '@/components/app/partner-register/image-slot';
import { InputField } from '@/components/app/partner-register/input-field';
import { ProvinceSelector } from '@/components/app/partner-register/province-selector';
import { LocationSelector } from '@/components/app/partner-register/location-selector';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { _PartnerFileType } from '@/features/user/const';
import { cn } from '@/lib/utils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ContractFileType } from '@/features/file/const';
import { CheckSquare, Square } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

const LanguageTextArea = ({ lang, placeholder, value, onChangeText, error }: any) => (
  <View className="relative mb-4">
    <View
      className={cn(
        'min-h-[100px] rounded-xl border bg-white px-4 py-3',
        error ? 'border-red-500' : 'border-gray-200'
      )}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        className="flex-1 pr-8 pt-1 text-base text-gray-900"
      />
    </View>

    {/* Badge ngôn ngữ */}
    <View className="absolute right-3 top-3 rounded-md bg-gray-100 px-2 py-1">
      <Text className="text-[10px] font-bold text-gray-500">{lang}</Text>
    </View>

    {/* ERROR TEXT */}
    {error && <Text className="ml-1 mt-1 text-xs text-red-500">{error}</Text>}
  </View>
);
export default function PartnerRegisterIndividualScreen() {
  const { t } = useTranslation();

  const { referrer_id } = useLocalSearchParams<{ referrer_id: string }>();
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { pickImage } = useImagePicker();

  const [isAgreed, setIsAgreed] = useState<boolean>(false);
  const { form, onSubmit, onInvalidSubmit } = usePartnerRegisterForm();
  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = form;
  useEffect(() => {
    if (referrer_id) {
      form.setValue('referrer_id', referrer_id, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [referrer_id]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="profile.partner_form.title" />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        enableOnAndroid={true}
        scrollEnabled={true}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-4">
          <Text className="mb-2 mt-4 font-inter-bold text-base text-slate-900">
            {t('profile.partner_form.images_title')} <Text className="text-red-500">*</Text>
          </Text>

          {/* List ảnh demo */}
          <Controller
            control={control}
            name="file_uploads"
            render={({ field: { value = [], onChange } }) => {
              const licenseFiles = getFilesByType(value, _PartnerFileType.KTV_IMAGE_DISPLAY);

              return (
                <View className="mb-2 flex-row flex-wrap gap-3">
                  {licenseFiles.map((item, index) => (
                    <ImageSlot
                      key={item.file.uri + index}
                      uri={item.file.uri}
                      label={t('common.degree')}
                      onAdd={() =>
                        pickImage((newUri) => {
                          const updated = value.map((f) =>
                            f === item
                              ? {
                                  ...f,
                                  file: {
                                    ...f.file,
                                    uri: newUri,
                                  },
                                }
                              : f
                          );
                          onChange(updated);
                        })
                      }
                      onRemove={() => {
                        onChange(value.filter((_, i) => value[i] !== item));
                      }}
                    />
                  ))}

                  {/* ADD NEW LICENSE IMAGE */}
                  <ImageSlot
                    uri={null}
                    label={t('profile.partner_form.add_photo')}
                    onAdd={() =>
                      pickImage((uri) =>
                        onChange([
                          ...value,
                          {
                            type_upload: _PartnerFileType.KTV_IMAGE_DISPLAY,
                            file: {
                              uri,
                              name: 'degree.jpg',
                              type: 'image/jpeg',
                            },
                          },
                        ])
                      )
                    }
                  />
                </View>
              );
            }}
          />

          <Text className="mb-1 text-xs text-gray-500">
            {t('profile.partner_form.images_min_note')}
          </Text>
          <Text className="mb-4 text-xs text-red-500">
            {t('profile.partner_form.images_warning')}
          </Text>

          <Text className="mb-2 font-inter-bold text-base text-slate-900">
            {t('profile.partner_form.id_title')} <Text className="text-red-500">*</Text>
          </Text>
          {/* Ảnh căn cước công dân  */}
          <Controller
            control={control}
            name="file_uploads"
            render={({ field: { value = [], onChange } }) => {
              const idFrontFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_FRONT)[0];

              const idBackFile = getFilesByType(value, _PartnerFileType.IDENTITY_CARD_BACK)[0];

              return (
                <View className="mb-4 flex-row flex-wrap gap-3">
                  {/* CCCD FRONT */}
                  <ImageSlot
                    uri={idFrontFile?.file.uri || null}
                    label={t('profile.partner_form.id_front')}
                    onAdd={() =>
                      pickImage((uri) => {
                        // remove old front if exists
                        const filtered = value.filter(
                          (f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_FRONT
                        );

                        onChange([
                          ...filtered,
                          {
                            type_upload: _PartnerFileType.IDENTITY_CARD_FRONT,
                            file: {
                              uri,
                              name: 'id_front.jpg',
                              type: 'image/jpeg',
                            },
                          },
                        ]);
                      })
                    }
                    onRemove={() =>
                      onChange(
                        value.filter((f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_FRONT)
                      )
                    }
                  />

                  {/* CCCD BACK */}
                  <ImageSlot
                    uri={idBackFile?.file.uri || null}
                    label={t('profile.partner_form.id_back')}
                    onAdd={() =>
                      pickImage((uri) => {
                        const filtered = value.filter(
                          (f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_BACK
                        );

                        onChange([
                          ...filtered,
                          {
                            type_upload: _PartnerFileType.IDENTITY_CARD_BACK,
                            file: {
                              uri,
                              name: 'id_back.jpg',
                              type: 'image/jpeg',
                            },
                          },
                        ]);
                      })
                    }
                    onRemove={() =>
                      onChange(
                        value.filter((f) => f.type_upload !== _PartnerFileType.IDENTITY_CARD_BACK)
                      )
                    }
                  />
                </View>
              );
            }}
          />

          <Text className="mb-2 font-inter-bold text-base text-slate-900">
            {t('profile.partner_form.face_with_id')} <Text className="text-red-500">*</Text>
          </Text>
          {/* Ảnh khuôn  mặt và cccd */}
          <Controller
            control={control}
            name="file_uploads"
            render={({ field: { value = [], onChange } }) => {
              const faceWithCardFile = getFilesByType(
                value,
                _PartnerFileType.FACE_WITH_IDENTITY_CARD
              )[0];

              return (
                <ImageSlot
                  uri={faceWithCardFile?.file.uri || null}
                  label={t('profile.partner_form.add_photo')}
                  onAdd={() =>
                    pickImage((uri) => {
                      const filtered = value.filter(
                        (f) => f.type_upload !== _PartnerFileType.FACE_WITH_IDENTITY_CARD
                      );

                      onChange([
                        ...filtered,
                        {
                          type_upload: _PartnerFileType.FACE_WITH_IDENTITY_CARD,
                          file: {
                            uri,
                            name: 'face_with_card.jpg',
                            type: 'image/jpeg',
                          },
                        },
                      ]);
                    })
                  }
                  onRemove={() =>
                    onChange(
                      value.filter(
                        (f) => f.type_upload !== _PartnerFileType.FACE_WITH_IDENTITY_CARD
                      )
                    )
                  }
                />
              );
            }}
          />

          <Text className="mb-2 font-inter-bold text-base text-slate-900">
            {t('profile.partner_form.degrees_title')} <Text className="text-red-500">*</Text>
          </Text>

          {/* Bằng cấp */}
          <Controller
            control={control}
            name="file_uploads"
            render={({ field: { value = [], onChange } }) => {
              const degreeFiles = getFilesByType(value, _PartnerFileType.LICENSE);

              return (
                <View className="mb-4 flex-row flex-wrap gap-3">
                  {degreeFiles.map((item, index) => (
                    <ImageSlot
                      key={item.file.uri + index}
                      uri={item.file.uri}
                      label={t('profile.partner_form.degree_photo')}
                      onAdd={() =>
                        pickImage((newUri) => {
                          const updated = value.map((f) =>
                            f === item
                              ? {
                                  ...f,
                                  file: {
                                    ...f.file,
                                    uri: newUri,
                                  },
                                }
                              : f
                          );
                          onChange(updated);
                        })
                      }
                      onRemove={() => onChange(value.filter((f) => f !== item))}
                    />
                  ))}

                  {/* ADD NEW DEGREE IMAGE */}
                  <ImageSlot
                    uri={null}
                    label={t('profile.partner_form.add_photo')}
                    onAdd={() =>
                      pickImage((uri) =>
                        onChange([
                          ...value,
                          {
                            type_upload: _PartnerFileType.LICENSE,
                            file: {
                              uri,
                              name: 'degree.jpg',
                              type: 'image/jpeg',
                            },
                          },
                        ])
                      )
                    }
                  />
                </View>
              );
            }}
          />

          <View className="mb-4">
            <Text className="mb-1 font-inter-bold text-base text-slate-900">
              {t('profile.partner_form.follow_agency_label')}
            </Text>
            <InputField
              control={control as any}
              name="referrer_id"
              placeholder={t('profile.partner_form.follow_agency_placeholder')}
              keyboardType="numeric"
              error={errors.referrer_id?.message}
              editable={!referrer_id}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1 font-inter-bold text-base text-slate-900">
              {t('common.years_of_experience')} <Text className="text-red-500">*</Text>
            </Text>
            <InputField
              control={control}
              name="experience"
              placeholder={t('profile.partner_form.field_experience_placeholder')}
              keyboardType="numeric"
              error={errors.experience?.message}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1 font-inter-bold text-base text-slate-900">
              {t('profile.partner_form.field_bio_label')}
            </Text>
            <Controller
              control={control}
              name="bio.vi"
              render={({ field, fieldState }) => (
                <LanguageTextArea
                  lang="VI"
                  placeholder="Mô tả kinh nghiệm, kỹ năng chuyên môn (Tiếng Việt)..."
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="bio.en"
              render={({ field, fieldState }) => (
                <LanguageTextArea
                  lang="EN"
                  placeholder="Describe your experience and skills (English)..."
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            {/* Giới thiệu (Trung) */}
            <Controller
              control={control}
              name="bio.cn"
              render={({ field, fieldState }) => (
                <LanguageTextArea
                  lang="CN"
                  placeholder="描述您的经验和技能 (中文)..."
                  value={field.value}
                  onChangeText={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>

          <View className="mb-6">
            <Text className="mb-1 font-inter-bold text-base text-slate-900">
              {t('profile.partner_form.field_city_label')} <Text className="text-red-500">*</Text>
            </Text>
            <ProvinceSelector
              control={control as any}
              name="province_code"
              provinces={provincesData?.data || []}
              isLoading={isLoadingProvinces}
              error={errors.province_code?.message}
            />
          </View>

          <View className="mb-4">
            <LocationSelector
              control={control}
              name="address"
              setValue={setValue}
              error={errors.address?.message}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <View className="border-t border-gray-100 bg-white p-4">
        <View className="mb-2 flex-row items-start gap-3">
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
                    pathname: '/term-or-use-pdf',
                    params: {
                      type: ContractFileType.POLICY_FOR_KTV.toString(),
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
                    pathname: '/term-or-use-pdf',
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
        <TouchableOpacity
          onPress={handleSubmit(onSubmit, onInvalidSubmit)}
          disabled={!isAgreed}
          className={cn(
            'items-center justify-center rounded-xl bg-primary-color-2 py-3.5 shadow-lg shadow-blue-200',
            isAgreed ? 'bg-primary-color-2' : 'bg-[#E0E0E0]'
          )}>
          <Text className="font-inter-bold text-base text-white">
            {t('profile.partner_form.button_submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
