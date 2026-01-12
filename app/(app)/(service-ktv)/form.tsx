import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronDown, Plus, Trash2, X } from 'lucide-react-native';
import HeaderBack from '@/components/header-back';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import DefaultColor from '@/components/styles/color';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { cn, handleSetChangeNumber } from '@/lib/utils';
import { useFormService } from '@/features/ktv/hooks';
import { Controller, useFieldArray } from 'react-hook-form';
import { Image } from 'expo-image';
import SelectModal from '@/components/select-modal';
import { router } from 'expo-router';

export default function FormScreen() {
  const [langName, setLangName] = useState<_LanguageCode>(_LanguageCode.VI);
  const [langDesc, setLangDesc] = useState<_LanguageCode>(_LanguageCode.VI);
  const [openSelectCategory, setOpenSelectCategory] = useState(false);

  const { t } = useTranslation();

  const {
    optionsCategory,
    form,
    handleSetImage,
    resetImage,
    submit,
    isEdit,
    loading,
    setServiceEdit,
    listOptionByCategory,
  } = useFormService();
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Field Array quản lý danh sách tùy chọn

  const categoryId = watch('category_id');
  const getCategoryLabel = useCallback(
    (categoryId: string) => {
      const category = optionsCategory.find((cat) => cat.value === categoryId);
      return category?.label || '';
    },
    [optionsCategory]
  );
  const handleBack = useCallback(() => {
    if (isEdit) {
      setServiceEdit(null);
      router.back();
    } else {
      router.back();
    }
  }, []);
  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack
        title={isEdit ? 'ktv.services.edit_service' : 'ktv.services.add_new_service'}
        onBack={handleBack}
      />
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <ScrollView
            className="flex-1 px-4 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}>
            {/* --- Service Image --- */}
            <Controller
              name="image"
              control={control}
              render={({ field: { value } }) => (
                <View className="mb-5 mt-2">
                  {/*Label*/}
                  <Text className="mb-2 font-inter-bold text-sm text-gray-800">
                    {t('ktv.services.form.image')}
                  </Text>
                  <View
                    className={cn(
                      'relative h-48 w-full overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-100',
                      {
                        'border-red-500': errors.image,
                      }
                    )}>
                    {value && value.uri ? (
                      <Image
                        source={{ uri: value.uri }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="absolute h-full w-full items-center justify-center">
                        <Camera size={32} color={DefaultColor.slate[500]} />
                      </View>
                    )}
                    {/* Remove Image Button */}
                    {value && value.uri && (
                      <TouchableOpacity
                        onPress={resetImage}
                        className="absolute left-3 top-3 flex-row items-center rounded-lg bg-white/90 px-3 py-1.5 shadow-sm">
                        <X size={16} color={DefaultColor.gray[700]} />
                      </TouchableOpacity>
                    )}
                    {/* Change Image Button */}
                    <TouchableOpacity
                      onPress={handleSetImage}
                      className="absolute bottom-3 right-3 flex-row items-center rounded-lg bg-white/90 px-3 py-1.5 shadow-sm">
                      <Camera size={16} color={DefaultColor.gray[700]} />
                      <Text className="ml-2 font-inter-bold text-xs text-gray-700">
                        {t('ktv.services.form.change_image')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/*Error*/}
                  {errors.image && (
                    <Text className="mt-2 text-sm text-red-500">
                      {t('ktv.services.form.error.image')}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* --- Category --- */}
            <Controller
              name="category_id"
              control={control}
              render={() => (
                <View className="mb-5">
                  <Text className="mb-2 font-inter-bold text-sm text-gray-800">
                    {t('ktv.services.form.category')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setOpenSelectCategory(true)}
                    className={cn(
                      'flex-row items-center rounded-xl border bg-gray-50 p-3.5',
                      errors.category_id ? 'border-red-500' : 'border-gray-200'
                    )}>
                    {categoryId ? (
                      <Text className="font-bold text-gray-900">
                        {getCategoryLabel(categoryId)}
                      </Text>
                    ) : (
                      <Text className="text-gray-400">
                        {t('ktv.services.form.select_category')}
                      </Text>
                    )}
                    <View className="flex-1 items-end">
                      <ChevronDown size={20} color={DefaultColor.gray[900]} />
                    </View>
                  </TouchableOpacity>
                  {/*Error*/}
                  {errors.category_id && (
                    <Text className="mt-2 text-sm text-red-500">{errors.category_id.message}</Text>
                  )}
                </View>
              )}
            />

            {/* --- Service Name --- */}
            {Object.values(_LanguageCode).map((lang) => (
              <Controller
                key={`name-${lang}`}
                name={`name.${lang}`}
                control={control}
                render={({ field: { value, onChange, onBlur } }) => {
                  if (lang !== langName) return <></>;
                  return (
                    <View className="mb-5">
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="font-inter-bold text-sm text-gray-800">
                          {t('ktv.services.form.service_name')}
                        </Text>
                        <LanguageTabs selected={langName} onSelect={setLangName} />
                      </View>
                      <View
                        className={cn('h-12 rounded-xl border border-gray-200 bg-white px-4', {
                          'border-red-500': errors.name?.[langName],
                        })}>
                        <TextInput
                          className="h-full text-gray-900"
                          placeholder={t('ktv.services.form.service_name_placeholder')}
                          value={value || ''}
                          onChangeText={(text) => onChange(text)}
                          onBlur={onBlur}
                        />
                      </View>
                      {/*Error*/}
                      {errors.name?.[langName] && (
                        <Text className="mt-2 text-sm text-red-500">
                          {errors.name?.[langName].message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            ))}

            {/* --- Description --- */}
            {Object.values(_LanguageCode).map((lang) => (
              <Controller
                key={`description-${lang}`}
                name={`description.${lang}`}
                control={control}
                render={({ field: { value, onChange, onBlur } }) => {
                  if (lang !== langDesc) return <></>;
                  return (
                    <View className="mb-5">
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="font-inter-bold text-sm text-gray-800">
                          {t('ktv.services.form.description')}
                        </Text>
                        <LanguageTabs selected={langDesc} onSelect={setLangDesc} />
                      </View>
                      <View
                        className={cn('rounded-xl border border-gray-200 bg-white px-4', {
                          'border-red-500': errors.description?.[langDesc],
                        })}>
                        <TextInput
                          className="h-24 text-sm leading-5 text-gray-700"
                          placeholder="Nhập mô tả dịch vụ..."
                          multiline
                          textAlignVertical="top"
                          defaultValue={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                      </View>
                      {/*Error*/}
                      {errors.description?.[langName] && (
                        <Text className="mt-2 text-sm text-red-500">
                          {errors.description?.[langName].message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            ))}

            {/* --- Service Active --- */}
            <Controller
              name="is_active"
              control={control}
              render={({ field: { value, onChange } }) => (
                <View className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-gray-800">
                        {t('ktv.services.form.is_active')}
                      </Text>
                      <Text className="mt-0.5 text-[10px] text-gray-400">
                        {t('ktv.services.form.is_active_help')}
                      </Text>
                    </View>
                    <Switch
                      trackColor={{ false: DefaultColor.gray[200], true: DefaultColor.blue[200] }}
                      thumbColor={value ? DefaultColor.blue[500] : DefaultColor.gray[400]}
                      onValueChange={onChange}
                      value={value}
                    />
                  </View>
                </View>
              )}
            />

            {/* --- DANH SÁCH GÓI (OPTIONS) vụ đăng ký---  */}
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-inter-bold text-sm text-gray-800">
                {t('ktv.services.form.options')}
              </Text>
            </View>
            {/* item */}
            {listOptionByCategory.map((item, index) => (
              <View
                key={item.id}
                className="mb-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-xs font-bold uppercase text-gray-500">
                    {t('ktv.services.form.option')} {index + 1}
                  </Text>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-gray-400">
                      {t('ktv.services.form.duration')}
                    </Text>
                    <Text className="rounded-lg border border-gray-300 p-2 text-center">
                      {item.duration}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="mb-1 text-xs text-gray-400">
                      {t('ktv.services.form.price')}
                    </Text>
                    <Text className="rounded-lg border border-gray-300 p-2 text-right">
                      {item.price}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* --- Sticky Footer Button --- */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white p-4">
          <TouchableOpacity
            disabled={loading}
            onPress={submit}
            className="items-center justify-center rounded-xl bg-primary-color-2 py-3.5 shadow-lg shadow-blue-200">
            <Text className="font-inter-bold text-base text-white">
              {loading ? t('common.loading') : t('ktv.services.form.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- Modal: Select Category --- */}
      <SelectModal
        isVisible={openSelectCategory}
        value={categoryId}
        onClose={() => setOpenSelectCategory(false)}
        onSelect={(item) => {
          setValue('category_id', item.value as string);
        }}
        data={optionsCategory}
      />
    </View>
  );
}

const LanguageTabs = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (lang: _LanguageCode) => void;
}) => {
  return (
    <View className="flex-row overflow-hidden rounded-lg bg-gray-100 p-1">
      {_LanguagesMap.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => onSelect(lang.code)}
          className={cn(
            'rounded-md px-3 py-1',
            selected === lang.code ? 'bg-white' : 'bg-transparent'
          )}>
          <Text
            className={cn(
              'font-inter-medium text-xs',
              selected === lang.code ? 'text-gray-900' : 'text-gray-500'
            )}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
