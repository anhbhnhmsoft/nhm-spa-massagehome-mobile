import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Controller, Control, UseFormSetValue, FieldValues, Path } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { MapPin } from 'lucide-react-native';
import { AddressItem } from '@/features/location/types';
import { ListLocationModal } from '@/components/app/location';
import { useGetLocation, useLocationAddress } from '@/features/app/hooks/use-location';
import { useTranslation } from 'react-i18next';

type LocationSelectorProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>; // address
  setValue: UseFormSetValue<T>;
  error?: string;
};

export function LocationSelector<T extends FieldValues>({
  control,
  name,
  setValue,
  error,
}: LocationSelectorProps<T>) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { getPermission } = useGetLocation();
  const { location: currentLocation } = useLocationAddress();
  const { t } = useTranslation();

  const handleGetCurrentLocation = useCallback(async () => {
    const hasPermission = await getPermission();

    if (!hasPermission) {
      Alert.alert(
        t('profile.partner_form.alert_location_permission_title'),
        t('profile.partner_form.alert_location_permission_message')
      );
      return;
    }

    if (!currentLocation?.address) return;

    // field chính
    setValue(name, currentLocation.address as any, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // fields phụ
    if (currentLocation.location?.coords?.latitude != null) {
      setValue('latitude' as Path<T>, currentLocation.location.coords.latitude.toString() as any, {
        shouldDirty: true,
      });
    }

    if (currentLocation.location?.coords?.longitude != null) {
      setValue(
        'longitude' as Path<T>,
        currentLocation.location.coords.longitude.toString() as any,
        { shouldDirty: true }
      );
    }
  }, []);

  return (
    <View>
      {/* ===== LABEL ===== */}
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="font-inter-bold text-base text-slate-900">
          {t('profile.partner_form.field_location_label')} <Text className="text-red-500">*</Text>
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

      {/* ===== CONTROLLER: ADDRESS ===== */}
      <Controller
        control={control}
        name={name}
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
                  <Text className="font-inter-medium text-base text-slate-800" numberOfLines={1}>
                    {value}
                  </Text>
                ) : (
                  <Text className="text-base text-gray-400">
                    {t('profile.partner_form.field_location_placeholder')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}

            {/* ===== MODAL CHỌN ĐỊA CHỈ ===== */}
            <ListLocationModal
              visible={showLocationModal}
              onClose={() => setShowLocationModal(false)}
              onSelect={(location: AddressItem) => {
                // field chính
                onChange(location.address);

                // fields phụ
                if (location.latitude) {
                  setValue('latitude' as Path<T>, location.latitude as any, { shouldDirty: true });
                }

                if (location.longitude) {
                  setValue('longitude' as Path<T>, location.longitude as any, {
                    shouldDirty: true,
                  });
                }

                setShowLocationModal(false);
              }}
            />
          </>
        )}
      />
    </View>
  );
}
