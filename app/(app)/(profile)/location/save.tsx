import React, { useState } from 'react';
import { View,  TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  Controller } from 'react-hook-form';
import {  MapPin, Tag } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import HeaderBack from '@/components/header-back';
import { useSaveLocation } from '@/features/location/hooks';
import SearchLocationModal from '@/components/search-location-modal';
import { DetailLocation } from '@/features/location/types';
import { useTranslation } from 'react-i18next';
import {Text} from "@/components/ui/text";

export default function AddAddressScreen() {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);

  const { form, submit, isEdit } = useSaveLocation();

  // Setup Form
  const { control, handleSubmit, setValue, watch, formState: { errors } } = form;

  // Watch để hiển thị UI
  const currentAddress = watch('address');

  // Xử lý khi chọn địa điểm từ Modal
  const handleSelectLocation = (location: DetailLocation) => {
    setValue('address', location.formatted_address, { shouldValidate: true });
    setValue('latitude', location.latitude, { shouldValidate: true });
    setValue('longitude', location.longitude, { shouldValidate: true });
    setShowSearch(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <HeaderBack title={isEdit ? 'location.title_edit' : 'location.title_add'} />

      <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
        {/* 1. SECTION CHỌN ĐỊA CHỈ  */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-semibold text-gray-700">{t('location.label_address')} *</Text>

          <TouchableOpacity
            onPress={() => setShowSearch(true)}
            className={`flex-row items-center rounded-xl border px-4 py-4 border-gray-200 bg-white`}
          >
            <View className="mr-3 rounded-full bg-blue-100 p-2">
              <Icon as={MapPin} size={20} className="text-blue-600" />
            </View>

            <View className="flex-1">
              {currentAddress ? (
                <Text className="text-base font-medium text-slate-800 leading-6">
                  {currentAddress}
                </Text>
              ) : (
                <Text className="text-base text-gray-400">
                  {t('location.placeholder_address')}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          {errors.address && <Text className="mt-2 text-xs text-red-500 ml-1">{errors.address.message}</Text>}

          {/* Validate Latitude/Longitude ẩn */}
          {(errors.latitude || errors.longitude) && !errors.address && (
            <Text className="mt-2 text-xs text-red-500 ml-1">{t('location.error.invalid_address')}</Text>
          )}
        </View>

        {/* 2. SECTION TÊN GỢI NHỚ (DESC) */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-semibold text-gray-700">{t('location.label_desc')}</Text>
          <Controller
            control={control}
            name="desc"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="flex-row items-center rounded-xl border border-gray-200 px-4 bg-white">
                <Icon as={Tag} size={20} className="text-gray-400 mr-3" />
                <TextInput
                  className="flex-1 py-4 text-base text-slate-800"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={t('location.placeholder_desc')}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            )}
          />
        </View>

        {/* 3. SECTION SWITCH IS_PRIMARY */}
        <View className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Controller
            control={control}
            name="is_primary"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-inter-semibold text-slate-800">{t('location.is_primary')}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{t('location.is_primary_desc')}</Text>
                </View>
                <Switch
                  trackColor={{ false: '#e2e8f0', true: '#bae6fd' }} // blue-200
                  thumbColor={value ? '#0ea5e9' : '#f4f4f5'} // blue-500
                  onValueChange={onChange}
                  value={value}
                />
              </View>
            )}
          />
        </View>

      </ScrollView>

      {/* FOOTER BUTTON */}
      <View className="border-t border-gray-100 p-4 bg-white">
        <TouchableOpacity
          onPress={handleSubmit(submit)}
          className={`flex-row items-center justify-center rounded-full py-4 bg-primary-color-2`}
        >
          <Text className="text-lg font-bold text-white">{t('location.save_address')}</Text>
        </TouchableOpacity>
      </View>

    <SearchLocationModal
      visible={showSearch}
      onClose={() => setShowSearch(false)}
      onSelectLocation={handleSelectLocation} />
    </SafeAreaView>
  );
}