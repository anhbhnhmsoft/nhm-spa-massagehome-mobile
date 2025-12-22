import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ChevronDown, Check } from 'lucide-react-native';
import { ProvinceItem } from '@/features/location/types';
import HeaderBack from '@/components/header-back';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

type ProvinceSelectorProps<T extends FieldValues = any> = {
  control: Control<T>;
  name: FieldPath<T>;
  provinces: ProvinceItem[];
  isLoading: boolean;
  error?: string;
};

export const ProvinceSelector = <T extends FieldValues = any>({
  control,
  name,
  provinces,
  isLoading,
  error,
}: ProvinceSelectorProps<T>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selectedProvince = provinces.find((p) => p.code === value);

          return (
            <>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
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
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}>
                <SafeAreaView className="flex-1 bg-white" edges={['top']}>
                  <FocusAwareStatusBar hidden={false} />
                  <View style={{ paddingTop: Math.max(insets.top, 0) }}>
                    <HeaderBack
                      title="profile.partner_form.field_city_label"
                      onBack={() => setModalVisible(false)}
                    />
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
                          onPress={() => {
                            onChange(item.code);
                            setModalVisible(false);
                          }}
                          className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4 active:bg-gray-50">
                          <Text className="flex-1 text-base text-slate-900">{item.name}</Text>
                          {value === item.code && (
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
                </SafeAreaView>
              </Modal>
            </>
          );
        }}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

