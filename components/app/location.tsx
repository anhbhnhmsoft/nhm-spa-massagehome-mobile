import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import HeaderBack from '@/components/header-back';
import React, { FC, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useListLocation, useSaveLocation, useSearchLocation } from '@/features/location/hooks';
import { useApplicationStore } from '@/features/app/stores';
import { useGetLocation } from '@/features/app/hooks/use-location';
import { Icon } from '@/components/ui/icon';
import { ChevronLeft, Map, MapPin, PlusCircle, Star, Tag, Trash2, X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { DetailLocation, SelectAddress } from '@/features/location/types';
import { Controller } from 'react-hook-form';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';

// Component hiển thị danh sách location
type ListLocationModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (location: SelectAddress) => void;
};

export const ListLocationModal = ({ visible, onClose, onSelect }: ListLocationModalProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    queryList,
    createHandler,
    editHandler,
    deleteHandler,
    closeSaveModal,
    showSaveModal,
    location,
    isLocating,
    getCurrentLocation,
  } = useListLocation(visible);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = queryList;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <FocusAwareStatusBar style={'dark'} />
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
            paddingBottom: Math.max(insets.bottom, 16) + 80,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={() => (
            <View className="border-b-2 border-b-gray-100 pb-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={async () => {
                  let loc = location;
                  if (!loc) {
                    loc = await getCurrentLocation();
                  }
                  if (loc) {
                    if (onSelect) {
                      onSelect({
                        address: loc.address,
                        latitude: loc.location.coords.latitude.toString(),
                        longitude: loc.location.coords.longitude.toString(),
                        desc: loc.address,
                      });
                    } else {
                      // Nếu đang ở màn hình Quản lý địa chỉ: mở form thêm để lưu lại địa chỉ này
                      createHandler();
                    }
                  }
                }}
                className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-orange-50 p-4 active:bg-orange-100">
                {/* ICON BÊN TRÁI */}
                <View
                  className={
                    'mr-4 h-10 w-10 items-center justify-center rounded-full bg-orange-100'
                  }>
                  {isLocating && !location ? (
                    <ActivityIndicator size="small" color="#F97316" />
                  ) : (
                    <Icon as={Star} size={20} className={'text-orange-500'} fill={'currentColor'} />
                  )}
                </View>
                {/* NỘI DUNG TEXT */}
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-bold text-base text-slate-800" numberOfLines={1}>
                      {location
                        ? location.address.split(',')[0]
                        : isLocating
                        ? t('location.locating_current')
                        : t('header_app.need_location')}
                    </Text>
                  </View>

                  {/* Địa chỉ chi tiết */}
                  <Text className="mt-0.5 text-sm text-orange-500" numberOfLines={1}>
                    {location ? location.address : t('location.primary_address')}
                  </Text>
                </View>

                {/* NÚT THAO TÁC (KHI QUẢN LÝ ĐỊA CHỈ) */}
                {!onSelect && (
                  <View className="rounded-lg bg-orange-500/10 px-2.5 py-1.5">
                    <Text className="font-inter-medium text-xs text-orange-600">
                      {t('location.save_this_address')}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
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
                    <Text className="font-inter-medium text-primary-color-2">
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
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              key={`location-${item.id}`}
              onPress={() => {
                // Nếu có onSelect thì gọi hàm đó (chọn địa chỉ), không thì mở modal chỉnh sửa
                if (onSelect) {
                  onSelect(item);
                } else {
                  editHandler(item);
                }
              }}
              className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50">
              {/* ICON BÊN TRÁI */}
              <View
                className={'mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100'}>
                <Icon
                  as={MapPin}
                  size={20}
                  className={'text-slate-500'}
                  fill={'none'}
                />
              </View>

              {/* NỘI DUNG TEXT */}
              <View className="flex-1 pr-2">
                <View className="flex-row items-center gap-2">
                  {/* Tên gợi nhớ (Ví dụ: Nhà riêng) */}
                  <Text className="font-inter-bold text-base text-slate-800" numberOfLines={1}>
                    {item.address.split(',')[0]}
                  </Text>
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
                <Icon as={PlusCircle} size={20} className="mr-2 text-primary-color-2" />
                <Text className="font-inter-medium text-base text-primary-color-2">
                  {t('location.add_new_address')}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* View thêm / chỉnh sửa địa chỉ (Overlay view thay vì nested Modal để tránh lỗi tap trên iOS) */}
        {showSaveModal && (
          <SaveLocationView onClose={closeSaveModal} />
        )}
      </View>
    </Modal>
  );
};

// Component hiển thị màn hình lưu/chỉnh sửa địa chỉ
type SaveLocationViewProps = {
  onClose: () => void;
};

const SaveLocationView: FC<SaveLocationViewProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showSearch, setShowSearch] = useState(false);

  const { form, submit, isEdit, setLocationCurrent, loading, isLocating } = useSaveLocation(onClose);

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

  // Xử lý khi chọn địa điểm từ Search view
  const handleSelectLocation = (location: DetailLocation) => {
    if (!location) return;
    setValue('address', location.formatted_address || '', { shouldValidate: true });
    setValue('latitude', Number(location.latitude) || 0, { shouldValidate: true });
    setValue('longitude', Number(location.longitude) || 0, { shouldValidate: true });
    setShowSearch(false);
  };

  return (
    <View className="absolute inset-0 z-10 bg-white" style={{ paddingTop: insets.top }}>
      <FocusAwareStatusBar style={'dark'} />
      {/* HEADER */}
      <HeaderBack
        title={isEdit ? 'location.title_edit' : 'location.title_add'}
        onBack={onClose}
      />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          {/* 1. SECTION CHỌN ĐỊA CHỈ  */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center justify-between gap-2">
              <Text className="font-inter-semibold text-sm text-gray-700">
                {t('location.label_address')} *
              </Text>
              {/* Nút Lấy Vị Trí Hiện Tại */}
              <TouchableOpacity
                onPress={setLocationCurrent}
                disabled={isLocating}
                className="flex-row items-center rounded-lg bg-primary-color-2/10 px-3 py-1.5 active:bg-primary-color-2/20">
                {isLocating ? (
                  <ActivityIndicator size="small" color="#0ea5e9" className="mr-1" />
                ) : (
                  <Icon as={MapPin} size={16} className="mr-1 text-primary-color-2" />
                )}
                <Text className="font-inter-medium text-xs text-primary-color-2">
                  {isLocating ? t('location.loading') : t('location.get_current_location')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowSearch(true)}
              className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-50">
              <View className="mr-3 rounded-full bg-blue-100 p-2">
                <Icon as={MapPin} size={20} className="text-blue-600" />
              </View>

              <View className="flex-1">
                {currentAddress ? (
                  <Text className="font-inter-medium text-base leading-6 text-slate-800">
                    {currentAddress}
                  </Text>
                ) : isLocating ? (
                  <Text className="font-inter-regular text-base italic text-gray-400">
                    {t('location.locating_current')}
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
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* FOOTER BUTTON */}
      <View
        className="border-t border-gray-100 bg-white p-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <TouchableOpacity
          onPress={handleSubmit(submit)}
          disabled={loading}
          className="flex-row items-center justify-center rounded-full bg-primary-color-2 py-4 active:opacity-90">
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
          ) : null}
          <Text className="font-inter-bold text-lg text-white">
            {loading ? t('location.loading') : t('location.save_address')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Location Screen Overlay */}
      {showSearch && (
        <SearchLocationView
          onClose={() => setShowSearch(false)}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </View>
  );
};

// Component hiển thị màn hình tìm kiếm địa chỉ
type SearchLocationViewProps = {
  onClose: () => void;
  onSelectLocation: (location: DetailLocation) => void;
};

const SearchLocationView: FC<SearchLocationViewProps> = ({
  onClose,
  onSelectLocation,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const currentLocation = useApplicationStore((s) => s.location);
  const getCurrentLocation = useGetLocation();
  const [isGettingCurrent, setIsGettingCurrent] = useState(false);

  const {
    keyword,
    searchedKeyword,
    results,
    isSearching,
    isLoadingDetail,
    selectedPlaceId,
    handleChangeText,
    clearKeyword,
    handleSelect,
  } = useSearchLocation();

  const trimmedKeyword = keyword.trim();
  const showEmpty =
    !isSearching &&
    trimmedKeyword.length >= 2 &&
    searchedKeyword === trimmedKeyword &&
    results.length === 0;

  const handleSelectCurrentLocation = async () => {
    Keyboard.dismiss();
    if (currentLocation?.address && currentLocation.location?.coords) {
      onSelectLocation({
        place_id: 'current_location',
        formatted_address: currentLocation.address,
        latitude: Number(currentLocation.location.coords.latitude),
        longitude: Number(currentLocation.location.coords.longitude),
      });
      return;
    }

    try {
      setIsGettingCurrent(true);
      const loc = await getCurrentLocation();
      if (loc?.address && loc.location?.coords) {
        onSelectLocation({
          place_id: 'current_location',
          formatted_address: loc.address,
          latitude: Number(loc.location.coords.latitude),
          longitude: Number(loc.location.coords.longitude),
        });
      }
    } finally {
      setIsGettingCurrent(false);
    }
  };

  return (
    <View className="absolute inset-0 z-20 bg-white" style={{ paddingTop: insets.top }}>
      <FocusAwareStatusBar style={'dark'} />
      {/* HEADER: Nút Back + Input */}
      <View className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 pb-4">
        <TouchableOpacity onPress={onClose} className="p-1 active:opacity-70">
          <Icon as={ChevronLeft} size={28} className="text-slate-800" />
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
          {/* Chấm tròn cam */}
          <View className="mr-3 h-2 w-2 rounded-full bg-orange-500" />

          <TextInput
            className="flex-1 text-base leading-5 text-slate-800"
            placeholder={t('location.search_placeholder')}
            value={keyword}
            onChangeText={handleChangeText}
            autoFocus={true}
            clearButtonMode="while-editing"
          />

          {/* Nút X để xóa text */}
          {keyword.length > 0 && (
            <TouchableOpacity onPress={clearKeyword} className="p-1">
              <Icon as={X} size={16} className="text-gray-400" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTENT */}
      <View className="flex-1 bg-white">
        {/* NÚT CHỌN NHANH VỊ TRÍ HIỆN TẠI (GPS) */}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isGettingCurrent}
          onPress={handleSelectCurrentLocation}
          className="flex-row items-center border-b border-orange-100 bg-orange-50/70 px-4 py-3.5 active:bg-orange-100">
          <View className="mr-3.5 h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            {isGettingCurrent ? (
              <ActivityIndicator size="small" color="#F97316" />
            ) : (
              <Icon as={MapPin} size={20} className="text-orange-500" />
            )}
          </View>
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-inter-bold text-sm text-slate-800">
                {t('location.use_current_location')}
              </Text>
              <View className="rounded bg-orange-500/10 px-1.5 py-0.5">
                <Text className="font-inter-medium text-[10px] text-orange-600">GPS</Text>
              </View>
            </View>
            <Text className="mt-0.5 font-inter-regular text-xs text-gray-500" numberOfLines={1}>
              {currentLocation?.address || t('location.get_current_location')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Loading khi đang tìm kiếm */}
        {isSearching ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator color="#F97316" size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) =>
              item?.place_id ? `place-${item.place_id}` : `place-index-${index}`
            }
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16) + 20,
            }}
            renderItem={({ item }) => {
              const isSelected = Boolean(selectedPlaceId && selectedPlaceId === item?.place_id);
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="flex-row items-center border-b border-gray-100 px-4 py-4 active:bg-gray-50"
                  disabled={isLoadingDetail}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleSelect(item, onSelectLocation);
                  }}>
                  <View className="mr-4 rounded-full bg-gray-100 p-2">
                    {isSelected ? (
                      <ActivityIndicator size="small" color="#F97316" />
                    ) : (
                      <Icon as={MapPin} size={20} className="text-slate-600" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-medium text-base text-slate-800">
                      {item?.formatted_address || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              showEmpty ? (
                <View className="items-center p-8">
                  <Text className="text-gray-500">{t('location.no_result')}</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};
