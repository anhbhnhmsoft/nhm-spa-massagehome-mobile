import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Controller, Control, UseFormSetValue, FieldValues, Path } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { MapPin } from 'lucide-react-native';
import { AddressItem } from '@/features/location/types';
import { ListLocationModal } from '@/components/app/location';
import { useGetLocation, useLocationAddress } from '@/features/app/hooks/use-location';
import { useTranslation } from 'react-i18next';

type LocationSelectorProps<T extends FieldValues = FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  setValue: UseFormSetValue<T>;
  error?: string;
};

export const LocationSelector = <T extends FieldValues = FieldValues>({
  control,
  name,
  setValue,
  error,
}: LocationSelectorProps<T>) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const getLocation = useGetLocation();
  const { t } = useTranslation();

  const handleGetCurrentLocation = async () => {
    const location = await getLocation();
    if (location && location?.address) {
      setValue(name, location.address as any);
      setValue('lat' as any, location.location.coords.latitude as any);
      setValue('lng' as any, location.location.coords.longitude as any);
    } else {
      Alert.alert(
        t('permission.location.title'),
        t('permission.location.error')
      );
    }
  };

  return (
    <View>
      <View className="mb-2 mt-2 flex-row items-center justify-between">
        <Text className="mb-1.5 ml-1 font-inter-medium text-sm text-gray-500">
          {t('profile.partner_form.field_location_label')}
        </Text>
        <TouchableOpacity
          onPress={handleGetCurrentLocation}
          className="flex-row items-center rounded-lg bg-primary-color-2/10 px-3 py-1.5">
          <Icon as={MapPin} size={16} className="mr-1 text-primary-color-2" />
          <Text className="font-inter-medium text-xs text-primary-color-2">
            {t('profile.partner_form.field_location_button')}
          </Text>
        </TouchableOpacity>
      </View>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity
              onPress={() => setShowLocationModal(true)}
              className="h-12 flex-row items-center rounded-xl border border-gray-300 px-4">
              <View className="flex-1 items-center">
                {value ? (
                  <Text className="text-base text-gray-900" numberOfLines={1}>
                    {value}
                  </Text>
                ) : (
                  <Text className="text-base text-gray-400">
                    {t('profile.partner_form.field_location_placeholder')}
                  </Text>
                )}
              </View>
              <View className="">
                <Icon as={MapPin} size={16} color={'#9CA3AF'} />
              </View>
            </TouchableOpacity>
            {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
            <ListLocationModal
              visible={showLocationModal}
              onClose={() => setShowLocationModal(false)}
              onSelect={(location: AddressItem) => {
                onChange(location.address);
                setValue(name, location.address as any);
                // Set latitude and longitude
                const lat = location.latitude ? parseFloat(location.latitude) : undefined;
                const lng = location.longitude ? parseFloat(location.longitude) : undefined;

                if (lat !== undefined && lat !== null && !isNaN(lat)) {
                  setValue('latitude' as any, lat as any);
                }
                if (lng !== undefined && lng !== null && !isNaN(lng)) {
                  setValue('longitude' as any, lng as any);
                }
                setShowLocationModal(false);
              }}
            />
          </>
        )}
      />
    </View>
  );
};
