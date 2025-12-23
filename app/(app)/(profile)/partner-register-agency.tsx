import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View, TouchableOpacity, Alert, Modal, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ImagePlus, Trash2, MapPin, ChevronDown, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useGetLocation, useLocationAddress } from '@/features/app/hooks/use-location';
import { useProvinces } from '@/features/location/hooks/use-query';
import { ProvinceItem, AddressItem } from '@/features/location/types';
import { useMutationApplyPartner } from '@/features/user/hooks/use-mutation';
import { client } from '@/lib/axios-client';
import useApplicationStore from '@/lib/store';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { useTranslation } from 'react-i18next';
import useAuthStore from '@/features/auth/store';
import { ListLocationModal } from '@/components/app/location';
import HeaderBack from '@/components/header-back';

type AgencyPartnerForm = {
  name: string;
  city: string;
  location: string;
  bio?: string;
};

export default function PartnerRegisterAgencyScreen() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const { getPermission } = useGetLocation();
  const { location: currentLocation } = useLocationAddress();
  const { data: provincesData, isLoading: isLoadingProvinces } = useProvinces();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const applyPartnerMutation = useMutationApplyPartner();
  const setLoading = useApplicationStore((s) => s.setLoading);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('profile.partner_form.error_branch_name_required')),
        city: z.string().min(1, t('profile.partner_form.error_city_required')),
        location: z
          .string()
          .min(1, t('profile.partner_form.error_location_required')),
        bio: z.string().optional(),
      }),
    [t]
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AgencyPartnerForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      city: '',
      location: '',
      bio: '',
    },
  });

  useEffect(() => {
    if (user?.primary_location) {
      setValue('location', user.primary_location.address);
    }
  }, [user, setValue]);

  const handleGetCurrentLocation = async () => {
    const hasPermission = await getPermission();
    if (hasPermission && currentLocation?.address) {
      setValue('location', currentLocation.address);
    } else if (!hasPermission) {
      Alert.alert(
        t('profile.partner_form.alert_location_permission_title'),
        t('profile.partner_form.alert_location_permission_message')
      );
    }
  };

  const pickImage = async (onPicked: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('profile.partner_form.alert_photo_permission_title'),
        t('profile.partner_form.alert_photo_permission_message')
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      onPicked(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: AgencyPartnerForm) => {
    if (galleryImages.length < 3) {
      Alert.alert(
        t('profile.partner_form.alert_missing_images_title'),
        t('profile.partner_form.alert_missing_images_message')
      );
      return;
    }
    if (galleryImages.length > 5) {
      Alert.alert(
        t('profile.partner_form.alert_max_images_title'),
        t('profile.partner_form.alert_max_images_message')
      );
      return;
    }

    try {
      setLoading(true);
      const uploadSingle = async (uri: string, type?: number) => {
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
          uri,
          name: 'upload.jpg',
          type: 'image/jpeg',
        });
        if (typeof type === 'number') {
          formData.append('type', String(type));
        }
        const response = await client.post('/file/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data.file_path as string;
      };

      const filesPayload: { type?: number; file_path: string }[] = [];

      for (const uri of galleryImages) {
        const path = await uploadSingle(uri, 5); // 5: Ảnh hiển thị
        filesPayload.push({ type: 5, file_path: path });
      }

      await applyPartnerMutation.mutateAsync({
        name: data.name,
        apply_role: 'agency',
        reviewApplication: {
          province_code: data.city,
          address: data.location,
          bio: data.bio,
        },
        files: filesPayload,
      });

      Alert.alert(
        t('profile.partner_form.alert_success_title'),
        t('profile.partner_form.alert_success_message')
      );
      router.back();
    } catch (error: any) {
      Alert.alert(
        t('profile.partner_form.alert_error_title'),
        t('profile.partner_form.alert_error_message')
      );
    } finally {
      setLoading(false);
    }
  };

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
            control={control}
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
            <Controller
                control={control}
                name="city"
                render={({ field: { onChange, value } }) => {
                const provinces = provincesData?.data || [];
                const selectedProvince = provinces.find((p) => p.code === value);

                return (
                <>
                  <TouchableOpacity
                    onPress={() => setProvinceModalVisible(true)}
                    className="h-12 flex-row items-center justify-between rounded-xl bg-gray-100 px-4">
                    <Text
                      className={`text-base ${selectedProvince ? 'text-slate-900' : 'text-gray-400'}`}>
                      {selectedProvince
                        ? selectedProvince.name
                        : t('profile.partner_form.field_city_placeholder')}
                    </Text>
                    <Icon as={ChevronDown} size={20} className="text-gray-400" />
                  </TouchableOpacity>

                  <Modal
                    visible={provinceModalVisible}
                    animationType="slide"
                    onRequestClose={() => setProvinceModalVisible(false)}>
                    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                      <FocusAwareStatusBar hidden={false} />
                      <ProvinceModalContent
                        provinces={provinces}
                        isLoading={isLoadingProvinces}
                        selectedValue={value}
                        onSelect={(code) => {
                          onChange(code);
                          setProvinceModalVisible(false);
                        }}
                        onClose={() => setProvinceModalVisible(false)}
                      />
                    </SafeAreaView>
                  </Modal>
                </>
              );
            }}
          />
          {errors.city?.message && (
            <Text className="mt-1 text-xs text-red-500">{errors.city.message}</Text>
          )}
        </View>

        <View className="mb-4">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-base font-inter-bold text-slate-900">
              {t('profile.partner_form.field_location_label')}{' '}
              <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              className="flex-row items-center rounded-lg bg-primary-color-2/10 px-3 py-1.5">
              <Icon as={MapPin} size={16} className="mr-1 text-primary-color-2" />
              <Text className="text-xs font-inter-medium text-primary-color-2">
                {t('profile.partner_form.field_location_button')}
              </Text>
            </TouchableOpacity>
          </View>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  onPress={() => setShowLocationModal(true)}
                  className="h-12 flex-row items-center rounded-xl bg-gray-100 px-4">
                  <View className="mr-3 rounded-full bg-blue-100 p-2">
                    <Icon as={MapPin} size={20} className="text-blue-600" />
                  </View>
                  <View className="flex-1">
                    {value ? (
                      <Text className="text-base font-inter-medium text-slate-800" numberOfLines={1}>
                        {value}
                      </Text>
                    ) : (
                      <Text className="text-base text-gray-400">
                        {t('profile.partner_form.field_location_placeholder')}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                {errors.location && (
                  <Text className="mt-1 text-xs text-red-500">{errors.location.message}</Text>
                )}
              </>
            )}
          />
          <ListLocationModal
            visible={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            onSelect={(location: AddressItem) => {
              setValue('location', location.address);
              setShowLocationModal(false);
            }}
          />
        </View>

        <TouchableOpacity
          className="mb-4 items-center rounded-full bg-primary-color-2 py-4"
          onPress={handleSubmit(onSubmit)}>
          <Text className="text-base font-inter-bold text-white">
            {t('profile.partner_form.button_submit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

type ImageSlotProps = {
  uri: string | null;
  label: string;
  onAdd: () => void;
  onRemove?: () => void;
};

const ImageSlot: React.FC<ImageSlotProps> = ({ uri, label, onAdd, onRemove }) => {
  return (
    <TouchableOpacity
      onPress={onAdd}
      className="relative h-32 w-28 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 overflow-hidden">
      {uri ? (
        <>
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            className="rounded-xl"
          />
          {onRemove && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 z-10"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon as={Trash2} size={14} className="text-white" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View className="items-center justify-center">
          <Icon as={ImagePlus} size={24} className="text-gray-400" />
          <Text className="mt-1 text-xs text-gray-400">{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

type InputFieldProps = {
  control: any;
  name: string;
  placeholder: string;
  error?: string;
};

const InputField: React.FC<InputFieldProps> = ({ control, name, placeholder, error }) => {
  return (
    <View>
      <Controller
        control={control}
        name={name as any}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="rounded-xl bg-gray-100 px-4 py-3 text-base text-slate-900"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

type ProvinceModalContentProps = {
  provinces: ProvinceItem[];
  isLoading: boolean;
  selectedValue: string;
  onSelect: (code: string) => void;
  onClose: () => void;
};

const ProvinceModalContent: React.FC<ProvinceModalContentProps> = ({
  provinces,
  isLoading,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <>
      <View style={{ paddingTop: Math.max(insets.top, 0) }}>
        <HeaderBack title="profile.partner_form.field_city_label" onBack={onClose} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text className="mt-4 text-sm text-gray-500">{t('common.loading_data')}</Text>
        </View>
      ) : provinces.length > 0 ? (
        <FlatList
          data={provinces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelect(item.code)}
              className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4 active:bg-gray-50">
              <Text className="flex-1 text-base text-slate-900">{item.name}</Text>
              {selectedValue === item.code && (
                <Icon as={Check} size={20} className="text-primary-color-2" />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-500">{t('common.no_data')}</Text>
        </View>
      )}
    </>
  );
};

