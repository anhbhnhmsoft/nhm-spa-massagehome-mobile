import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import HeaderBack from '@/components/header-back';
import React, { FC, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useListLocation, useSaveLocation, useSearchLocation } from '@/features/location/hooks';
import { Icon } from '@/components/ui/icon';
import { ChevronLeft, Map, MapPin, PlusCircle, Star, Tag, Trash2, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { AddressItem, DetailLocation } from '@/features/location/types';
import { Controller } from 'react-hook-form';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

type ListLocationModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (location: AddressItem) => void;
};

export const ListLocationModal = ({ visible, onClose, onSelect }: ListLocationModalProps) => {
  const { t } = useTranslation();

  const { queryList, createHandler, editHandler, deleteHandler, closeSaveModal, showSaveModal } =
    useListLocation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = queryList;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        <HeaderBack title={'location.title'} onBack={onClose} />

        <FlatList
          keyExtractor={(item, index) => `masseur-${item.id}-${index}`}
          data={data}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{
            flex: 1,
            position: 'relative',
          }}
          contentContainerStyle={{
            gap: 12,
            paddingBottom: 100,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            // 1. Nếu list rỗng -> Không hiện footer (để ListEmptyComponent lo)
            if (!data || data.length === 0) return null;
            return (
              <View className="mt-2 pb-10">
                {isFetchingNextPage ? (
                  <View className="py-4">
                    <ActivityIndicator size="small" color="#0ea5e9" />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={createHandler}
                    className="flex-row items-center justify-center rounded-xl border border-dashed border-primary-color-2 bg-blue-50/50 py-4 active:bg-blue-100">
                    <Icon as={PlusCircle} size={20} className="mr-2 text-primary-color-2" />
                    <Text className="font-medium text-primary-color-2">
                      {t('location.add_new_address')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={`location-${item.id}`}
              onPress={() => {
                // Nếu có onSelect thì gọi hàm đó (chọn địa chỉ), không thì mở modal chỉnh sửa
                if (onSelect) {
                  onSelect(item);
                }else{
                  editHandler(item)
                }
              }}
              className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50">
              {/* ICON BÊN TRÁI */}
              <View
                className={cn(
                  'mr-4 h-10 w-10 items-center justify-center rounded-full',
                  item.is_primary ? 'bg-orange-100' : 'bg-gray-100'
                )}>
                <Icon
                  as={item.is_primary ? Star : MapPin}
                  size={20}
                  // Nếu là primary thì tô màu cam, thường thì màu xám
                  className={item.is_primary ? 'text-orange-500' : 'text-slate-500'}
                  fill={item.is_primary ? 'currentColor' : 'none'} // Tô đặc ngôi sao nếu là primary
                />
              </View>

              {/* NỘI DUNG TEXT */}
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-2">
                  {/* Tên gợi nhớ (Ví dụ: Nhà riêng) */}
                  <Text className="font-inter-bold text-base text-slate-800" numberOfLines={1}>
                    {item.address.split(',')[0]}
                  </Text>

                  {/* Badge Mặc định */}
                  {item.is_primary && (
                    <View className="rounded bg-orange-100 px-2 py-0.5">
                      <Text className="font-inter-bold text-[10px] text-orange-600">
                        {t('location.primary')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Địa chỉ chi tiết */}
                <Text className="mt-1 text-sm text-gray-500" numberOfLines={1}>
                  {item.desc ? `${item.desc} ` : t('location.no_desc')} - {item.address}
                </Text>
              </View>

              {/* NÚT XOÁ  */}
              {!onSelect && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // Quan trọng: Chặn nổi bọt sự kiện
                    deleteHandler(item);
                  }}
                  className="p-2">
                  <Icon as={Trash2} size={20} className="text-red-400" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-8 pb-20">
              <View className="mb-6 items-center justify-center">
                <View className="relative h-40 w-40 items-center justify-center rounded-full bg-gray-100/50">
                  {/* Icon Bản đồ mờ làm nền */}
                  <Icon as={Map} size={150} color="#cbd5e1" strokeWidth={1} />
                  {/* Điểm ghim vị trí chính */}
                  <View className="absolute top-[30%]">
                    <View className="rounded-full bg-white p-1 shadow-sm">
                      <Icon as={MapPin} size={48} color="#64748b" />
                    </View>
                  </View>
                </View>
              </View>

              {/* --- PHẦN VĂN BẢN --- */}
              <Text className="mb-2 text-center font-inter-bold text-lg text-slate-800">
                {t('location.common_address')}
              </Text>

              <Text className="mb-10 text-center text-base text-gray-500">
                {t('location.description')}
              </Text>

              {/* --- NÚT CHỨC NĂNG --- */}
              <TouchableOpacity
                onPress={createHandler}
                className="flex-row items-center rounded-full bg-base-color-3 px-6 py-3 active:bg-blue-100">
                {/* Sử dụng màu xanh dương nhạt tương tự trong ảnh (ví dụ: #0ea5e9 - cyan-500 hoặc text-blue-500) */}
                <Icon as={PlusCircle} size={20} className="mr-2 text-primary-color-2" />
                <Text className="text-base font-medium text-primary-color-2">
                  {t('location.add_new_address')}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
        <SaveLocationModal visible={showSaveModal} onClose={closeSaveModal} />
      </SafeAreaView>
    </Modal>
  );
};

type SaveLocationModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const SaveLocationModal = ({ visible, onClose }: SaveLocationModalProps) => {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);

  const { form, submit, isEdit } = useSaveLocation(onClose);

  // Setup Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

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
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <FocusAwareStatusBar hidden={true} />
      <SafeAreaView className="flex-1 bg-white">
        {/* HEADER */}
        <HeaderBack
          title={isEdit ? 'location.title_edit' : 'location.title_add'}
          onBack={onClose}
        />
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
            {/* 1. SECTION CHỌN ĐỊA CHỈ  */}
            <View className="mb-6">
              <Text className="font-inter-semibold-semibold mb-2 text-sm text-gray-700">
                {t('location.label_address')} *
              </Text>

              <TouchableOpacity
                onPress={() => setShowSearch(true)}
                className={`flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-4`}>
                <View className="mr-3 rounded-full bg-blue-100 p-2">
                  <Icon as={MapPin} size={20} className="text-blue-600" />
                </View>

                <View className="flex-1">
                  {currentAddress ? (
                    <Text className="text-base font-inter-medium leading-6 text-slate-800">
                      {currentAddress}
                    </Text>
                  ) : (
                    <Text className="text-base text-gray-400">
                      {t('location.placeholder_address')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              {errors.address && (
                <Text className="ml-1 mt-2 text-xs text-red-500">{errors.address.message}</Text>
              )}

              {/* Validate Latitude/Longitude ẩn */}
              {(errors.latitude || errors.longitude) && !errors.address && (
                <Text className="ml-1 mt-2 text-xs text-red-500">
                  {t('location.error.invalid_address')}
                </Text>
              )}
            </View>

            {/* 2. SECTION TÊN GỢI NHỚ (DESC) */}
            <View className="mb-6">
              <Text className="mb-2 text-sm font-semibold text-gray-700">
                {t('location.label_desc')}
              </Text>
              <Controller
                control={control}
                name="desc"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
                    <Icon as={Tag} size={20} className="mr-3 text-gray-400" />
                    <TextInput
                      className="min-h-24 flex-1 rounded-lg p-3 text-base text-slate-800"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline={true}
                      numberOfLines={6}
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
                    <View className="mr-4 flex-1">
                      <Text className="font-inter-semibold text-base text-slate-800">
                        {t('location.is_primary')}
                      </Text>
                      <Text className="mt-1 text-sm text-gray-500">
                        {t('location.is_primary_desc')}
                      </Text>
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
        </TouchableWithoutFeedback>

        {/* FOOTER BUTTON */}
        <View className="border-t border-gray-100 bg-white p-4">
          <TouchableOpacity
            onPress={handleSubmit(submit)}
            className={`flex-row items-center justify-center rounded-full bg-primary-color-2 py-4`}>
            <Text className="text-lg font-bold text-white">{t('location.save_address')}</Text>
          </TouchableOpacity>
        </View>

        <SearchLocationModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectLocation={handleSelectLocation}
        />
      </SafeAreaView>
    </Modal>
  );
};

type LocationSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: DetailLocation) => void;
};

export const SearchLocationModal: FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const { t } = useTranslation();
  const { keyword, results, loading, handleChangeText, clearKeyword, handleSelect } = useSearchLocation();

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
        <FocusAwareStatusBar hidden={true} />
        <SafeAreaView className="flex-1 bg-white">
          {/* HEADER: Nút Back + Input */}
          <View className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 pb-4">
            <TouchableOpacity onPress={onClose} className="p-1">
              <Icon as={ChevronLeft} size={28} className="text-slate-800" />
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
              {/* Chấm tròn đỏ/xanh giống Grab */}
              <View className="mr-3 h-2 w-2 rounded-full bg-orange-500" />

              <TextInput
                className="flex-1 text-base leading-5 text-slate-800"
                placeholder={t('location.search_placeholder')}
                value={keyword}
                onChangeText={handleChangeText}
                autoFocus={true} // Tự động focus khi mở modal
                clearButtonMode="while-editing" // iOS only
              />

              {/* Nút X để xóa text (Android/Custom) */}
              {keyword.length > 0 && (
                <TouchableOpacity onPress={() => clearKeyword()}>
                  <Icon as={X} size={16} className="text-gray-400" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* CONTENT */}
          <View className="flex-1 bg-white">
            {/* Loading Indicator */}
            {loading ? (
              <View className="py-4">
                <ActivityIndicator color="#F97316" />
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled" // Quan trọng: Để bấm được vào item khi bàn phím đang mở
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center border-b border-gray-100 px-4 py-4 active:bg-gray-50"
                    onPress={() => handleSelect(item, onSelectLocation)}>
                    <View className="mr-4 rounded-full bg-gray-100 p-2">
                      <Icon as={MapPin} size={20} className="text-slate-600" />
                    </View>
                    <View className="flex-1">
                      {/* Giả lập hiển thị Title và Subtitle (Laravel của bạn đang trả về 1 string full, nên hiển thị 1 dòng) */}
                      <Text className="font-inter-medium text-base text-slate-800">
                        {item.formatted_address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  !loading && keyword.length > 2 ? (
                    <View className="items-center p-8">
                      <Text className="text-gray-500">{t('location.no_result')}</Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};
