import React, { useMemo, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, TouchableOpacity, TextInput, Switch } from 'react-native';
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

export default function PartnerRegisterIndividualScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { pickImage } = useImagePicker();
  const [followAgency, setFollowAgency] = useState(true);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('profile.partner_form.error_name_required')),
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
    idFront,
    setIdFront,
    idBack,
    setIdBack,
    degreeImages,
    setDegreeImages,
    handleSubmit,
  } = usePartnerRegisterForm({
    role: _UserRole.KTV,
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
    validateIdImages: (idFront, idBack) => {
      if (!idFront || !idBack) {
        Alert.alert(
          t('profile.partner_form.alert_missing_id_title'),
          t('profile.partner_form.alert_missing_id_message')
        );
        return false;
      }
      return true;
    },
    validateDegreeImages: (degreeImages) => {
      if (degreeImages.length === 0) {
        Alert.alert(
          t('profile.partner_form.alert_missing_degrees_title'),
          t('profile.partner_form.alert_missing_degrees_message')
        );
        return false;
      }
      return true;
    },
    prepareFiles: async (uploadFile, galleryImages, idFront, idBack, degreeImages) => {
      const files: Array<{ type: number; file_path: string; is_public: boolean }> = [];

      if (idFront) {
        const result = await uploadFile(idFront, { type: 1, isPublic: false });
        files.push({ type: 1, file_path: result.file_path, is_public: result.is_public });
      }

      if (idBack) {
        const result = await uploadFile(idBack, { type: 2, isPublic: false });
        files.push({ type: 2, file_path: result.file_path, is_public: result.is_public });
      }

      if (degreeImages) {
        for (const uri of degreeImages) {
          const result = await uploadFile(uri, { type: 3, isPublic: false });
          files.push({ type: 3, file_path: result.file_path, is_public: result.is_public });
        }
      }

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
      <HeaderBack title="profile.partner_form.title" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-2 text-base font-inter-bold text-slate-900">
          {t('profile.partner_form.images_title')} <Text className="text-red-500">*</Text>
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
        <Text className="mb-1 text-xs text-gray-500">
          {t('profile.partner_form.images_min_note')}
        </Text>
        <Text className="mb-4 text-xs text-red-500">
          {t('profile.partner_form.images_warning')}
        </Text>

        <Text className="mb-2 text-base font-inter-bold text-slate-900">
          {t('profile.partner_form.id_title')} <Text className="text-red-500">*</Text>
        </Text>
        <View className="mb-4 flex-row flex-wrap gap-3">
          <ImageSlot
            uri={idFront}
            label={t('profile.partner_form.id_front')}
            onAdd={() => pickImage((uri) => setIdFront(uri))}
            onRemove={() => setIdFront(null)}
          />
          <ImageSlot
            uri={idBack}
            label={t('profile.partner_form.id_back')}
            onAdd={() => pickImage((uri) => setIdBack(uri))}
            onRemove={() => setIdBack(null)}
          />
        </View>

        <Text className="mb-2 text-base font-inter-bold text-slate-900">
          {t('profile.partner_form.degrees_title')} <Text className="text-red-500">*</Text>
        </Text>
        <View className="mb-4 flex-row flex-wrap gap-3">
          {degreeImages.map((uri, index) => (
            <ImageSlot
              key={uri + index}
              uri={uri}
              label={t('profile.partner_form.degree_photo')}
              onAdd={() => pickImage((newUri) => {
                const copy = [...degreeImages];
                copy[index] = newUri;
                setDegreeImages(copy);
              })}
              onRemove={() => {
                setDegreeImages(degreeImages.filter((_, i) => i !== index));
              }}
            />
          ))}
          <ImageSlot
            uri={null}
            label={t('profile.partner_form.add_photo')}
            onAdd={() => pickImage((uri) => setDegreeImages([...degreeImages, uri]))}
          />
        </View>

        {user?.referred_by_user_id && (
          <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="mr-4 flex-1">
                <Text className="font-inter-bold text-base text-slate-900">
                  {t('profile.partner_form.follow_agency_label')}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  {t('profile.partner_form.follow_agency_desc')}
                </Text>
              </View>
              <Switch
                value={followAgency}
                onValueChange={setFollowAgency}
                trackColor={{ false: '#e2e8f0', true: '#bae6fd' }}
                thumbColor={followAgency ? '#0ea5e9' : '#f4f4f5'}
              />
            </View>
          </View>
        )}

        <View className="mb-4">
          <Text className="mb-1 text-base font-inter-bold text-slate-900">
            {t('profile.partner_form.field_name_label')} <Text className="text-red-500">*</Text>
          </Text>
          <InputField
            control={control as any}
            name="name"
            placeholder={t('profile.partner_form.field_name_placeholder')}
            error={errors.name?.message}
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-base font-inter-bold text-slate-900">
            {t('profile.partner_form.field_bio_label')}
          </Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="h-28 rounded-xl bg-gray-100 px-4 py-3 text-base text-slate-900"
                placeholder={t('profile.partner_form.field_bio_placeholder')}
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
