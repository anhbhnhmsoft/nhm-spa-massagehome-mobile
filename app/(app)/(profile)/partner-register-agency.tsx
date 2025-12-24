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
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        bio: z.string().optional(),
      }),
    [t]
  );

  const {
    form,
    idFront,
    setIdFront,
    idBack,
    setIdBack,
    handleSubmit,
  } = usePartnerRegisterForm({
    role: _UserRole.AGENCY,
    schema,
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
    prepareFiles: async (uploadFile, galleryImages, idFront, idBack) => {
      const files: Array<{ type: number; file_path: string; is_public: boolean }> = [];

      if (idFront) {
        const result = await uploadFile(idFront, { type: 1, isPublic: false });
        files.push({ type: 1, file_path: result.file_path, is_public: result.is_public });
      }

      if (idBack) {
        const result = await uploadFile(idBack, { type: 2, isPublic: false });
        files.push({ type: 2, file_path: result.file_path, is_public: result.is_public });
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
      <HeaderBack title="profile.partner_register.agency_title" />

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="mb-2 mt-4 text-base font-inter-bold text-slate-900">
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
