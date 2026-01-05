import React, { useMemo, useEffect, useState } from 'react';
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
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

export default function PartnerRegisterIndividualScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { pickImage } = useImagePicker();

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('profile.partner_form.error_name_required')),
        city: z.string().min(1, t('profile.partner_form.error_city_required')),
        location: z.string().min(1, t('profile.partner_form.error_location_required')),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        bio: z.string().optional(),
        agency_id: z
          .string()
          .optional()
          .refine(
            (val) => {
              if (!val || val.trim() === '') return true; // Optional, nếu không nhập thì OK
              return /^\d+$/.test(val.trim()); // Chỉ chấp nhận số
            },
            {
              message: t('profile.partner_form.error_agency_id_invalid'),
            }
          ),
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
    validateAgencyId: async (agencyId: string | undefined) => {
      if (!agencyId || agencyId.trim() === '') {
        return true;
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
      // Set latitude and longitude cho địa chỉ mặc định
      if (user.primary_location.latitude) {
        setValue('latitude', Number(user.primary_location.latitude));
      }
      if (user.primary_location.longitude) {
        setValue('longitude', Number(user.primary_location.longitude));
      }
    }
  }, [user, setValue]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="profile.partner_form.title" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-2 mt-4 text-base font-inter-bold text-slate-900">
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

        <View className="mb-4">
          <Text className="mb-1 text-base font-inter-bold text-slate-900">
            {t('profile.partner_form.follow_agency_label')}
          </Text>
          {/* <Text className="mb-2 text-xs text-gray-500">
            {t('profile.partner_form.follow_agency_desc')}
          </Text> */}
          <InputField
            control={control as any}
            name="agency_id"
            placeholder={t('profile.partner_form.follow_agency_placeholder')}
            keyboardType="numeric"
            error={errors.agency_id?.message}
          />
        </View>

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
