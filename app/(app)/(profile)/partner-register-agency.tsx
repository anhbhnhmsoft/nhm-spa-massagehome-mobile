import React, { useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, TouchableOpacity, TextInput } from 'react-native';
import { Controller } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import HeaderBack from '@/components/header-back';
import { _UserRole } from '@/features/auth/const';
import { useProvinces } from '@/features/location/hooks/use-query';
import useAuthStore from '@/features/auth/store';
import { useImagePicker } from '@/features/app/hooks/use-image-picker';
import { usePartnerRegisterForm } from '@/features/user/hooks/use-partner-register-form';
import { ImageSlot } from '@/components/app/partner-register/image-slot';
import { InputField } from '@/components/app/partner-register/input-field';
import { ProvinceSelector } from '@/components/app/partner-register/province-selector';
import { LocationSelector } from '@/components/app/partner-register/location-selector';
import { Alert } from 'react-native';

export default function PartnerRegisterAgencyScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { pickImage } = useImagePicker();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('profile.partner_form.error_branch_name_required')),
        city: z.string().min(1, t('profile.partner_form.error_city_required')),
        location: z.string().min(1, t('profile.partner_form.error_location_required')),
        bio: z.string().optional(),
      }),
    [t]
  );

  const {
    form,
    galleryImages,
    setGalleryImages,
    handleSubmit,
  } = usePartnerRegisterForm({
    role: _UserRole.AGENCY,
    schema,
    validateImages: (images) => {
      if (images.length < 3) {
        Alert.alert(
          t('profile.partner_form.alert_missing_images_title'),
          t('profile.partner_form.alert_missing_images_message')
        );
        return false;
      }
      if (images.length > 5) {
        Alert.alert(
          t('profile.partner_form.alert_max_images_title'),
          t('profile.partner_form.alert_max_images_message')
        );
        return false;
      }
      return true;
    },
    prepareFiles: async (uploadFile, galleryImages) => {
      const files: Array<{ type: number; file_path: string; is_public: boolean }> = [];
      for (const uri of galleryImages) {
        const result = await uploadFile(uri, { type: 5, isPublic: true });
        files.push({ type: 5, file_path: result.file_path, is_public: result.is_public });
      }
      return files;
    },
  });

  const { control, formState: { errors }, setValue } = form;

  useEffect(() => {
    if (user?.primary_location) {
      setValue('location', user.primary_location.address);
    }
  }, [user, setValue]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderBack title="profile.partner_register.agency_title" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-2 text-base font-inter-bold text-slate-900">
          {t('profile.partner_form.id_title')} <Text className="text-red-500">*</Text>
        </Text>
        <View className="mb-2 flex-row flex-wrap gap-3">
          {galleryImages.map((uri, index) => (
            <ImageSlot
              key={uri + index}
              uri={uri}
              label={t('common.photo')}
              onAdd={() => pickImage((newUri) => {
                const copy = [...galleryImages];
                copy[index] = newUri;
                setGalleryImages(copy);
              })}
              onRemove={() => {
                setGalleryImages(galleryImages.filter((_, i) => i !== index));
              }}
            />
          ))}
          <ImageSlot
            uri={null}
            label={t('profile.partner_form.add_photo')}
            onAdd={() => pickImage((uri) => setGalleryImages([...galleryImages, uri]))}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-base font-inter-bold text-slate-900">
            {t('profile.partner_form.field_branch_name_label')} <Text className="text-red-500">*</Text>
          </Text>
          <InputField
            control={control as any}
            name="name"
            placeholder={t('profile.partner_form.field_branch_name_placeholder')}
            error={errors.name?.message}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-base font-inter-bold text-slate-900">
            {t('profile.partner_form.field_branch_bio_label')}
          </Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="h-28 rounded-xl bg-gray-100 px-4 py-3 text-base text-slate-900"
                placeholder={t('profile.partner_form.field_branch_bio_placeholder')}
                placeholderTextColor="#9CA3AF"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                multiline
                textAlignVertical="top"
              />
            )}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-1 text-base font-inter-bold text-slate-900">
            {t('profile.partner_form.field_city_label')} <Text className="text-red-500">*</Text>
          </Text>
          <ProvinceSelector
            control={control as any}
            name="city"
            provinces={provincesData?.data || []}
            isLoading={isLoadingProvinces}
            error={errors.city?.message}
          />
        </View>

        <View className="mb-4">
          <LocationSelector
            control={control as any}
            name="location"
            setValue={setValue as any}
            error={errors.location?.message}
          />
        </View>

        <TouchableOpacity
          className="mb-4 items-center rounded-full bg-primary-color-2 py-4"
          onPress={handleSubmit}>
          <Text className="text-base font-inter-bold text-white">
            {t('profile.partner_form.button_submit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
