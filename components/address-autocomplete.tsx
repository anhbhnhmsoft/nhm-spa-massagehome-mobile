import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef, Place } from 'react-native-google-places-autocomplete';
import { View, StyleProp, ViewStyle } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clock, MapPin } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type LocationData = {
  address: string;
  lat: number;
  lng: number;
};

interface AddressAutocompleteProps {
  apiKey: string;
  placeholder?: string;
  value?: string;
  onSelect: (location: LocationData) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

interface LocationState {
  history: LocationData[];
  addToHistory: (item: LocationData) => void;
}
const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (newItem) => set((state) => {
        // Lọc bỏ địa chỉ trùng (nếu đã có thì xóa cái cũ đi để đưa cái mới lên đầu)
        const filteredHistory = state.history.filter(
          item => item.address !== newItem.address
        );
        // Thêm cái mới lên đầu, cắt lấy 5 cái thôi
        const newHistory = [newItem, ...filteredHistory].slice(0, 5);
        return { history: newHistory };
      }),
    }),
    {
      name: 'location-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


const AddressAutocomplete = ({
                               apiKey,
                               placeholder = '',
                               value,
                               onSelect,
                               containerStyle
                             }: AddressAutocompleteProps) => {
  const ref = useRef<GooglePlacesAutocompleteRef>(null);
  const [listViewDisplayed, setListViewDisplayed] = useState<'auto' | boolean>(false);

  // 1. Lấy history và hàm add từ Store
  const { history, addToHistory } = useLocationStore();

  // 2. Chuyển đổi history thành format của thư viện (predefinedPlaces)
  const predefinedPlaces = useMemo<Place[]>(() => {
    const places: Place[] = history.map((item) => ({
      description: item.address,
      geometry: { location: { lat: item.lat, lng: item.lng, latitude: item.lat, longitude: item.lng } },
      isHistory: true,
    }));
    return places;
  }, [history]) ;

  useEffect(() => {
    if (value) ref.current?.setAddressText(value);
  }, [value]);

  return (
    <View style={containerStyle} className="flex-1">
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        fetchDetails={true}
        listViewDisplayed={listViewDisplayed}

        // --- 3. CẤU HÌNH HISTORY ---
        predefinedPlaces={predefinedPlaces}
        predefinedPlacesAlwaysVisible={true} // Luôn hiện history khi chưa gõ gì

        onPress={(data, details = null) => {
          // Xử lý dữ liệu chuẩn
          // Lưu ý: Nếu chọn từ History, 'details' sẽ chứa cái 'geometry' mình đã fake ở trên
          const lat = details?.geometry.location.lat || 0;
          const lng = details?.geometry.location.lng || 0;
          const locationData: LocationData = {
            address: data.description,
            lat: lat,
            lng: lng,
          };
          // Gửi ra ngoài
          onSelect(locationData);
          // 4. LƯU VÀO HISTORY (Nếu chưa có)
          // Chỉ lưu nếu đây là kết quả tìm kiếm thực từ Google (không phải bấm lại history cũ)
          // data.isHistory là biến mình tự thêm lúc map ở trên
          if (!(data as any).isHistory) {
            addToHistory(locationData);
          }

          // UI Cleanup
          ref.current?.setAddressText(data.description);
          ref.current?.blur();
          setListViewDisplayed(false);
        }}

        query={{
          key: apiKey,
          language: 'vi',
          components: 'country:vn',
        }}

        textInputProps={{
          onChangeText: () => setListViewDisplayed('auto'),
          onFocus: () => setListViewDisplayed('auto'),
        }}

        // Custom Row để phân biệt History và Google Suggestion
        renderRow={(data) => {
          // Lấy cờ isHistory trực tiếp từ data (do mình đã gán ở useMemo trên)
          // Ép kiểu (data as any) vì type mặc định của thư viện không có trường này
          const isHistory = (data as any).isHistory;

          return (
            <View className="flex-row items-center gap-2">
              {isHistory ? (
                <Clock size={16} color="#9CA3AF" className="mr-2" />
              ) : (
                // Nếu không phải history thì hiện icon MapPin (như Grab/Google Maps)
                <MapPin size={16} color="#4F7A56" className="mr-2" />
              )}

              <Text
                className={cn(
                  'text-base',
                  isHistory ? 'text-gray-500 font-inter-italic' : 'text-gray-900 font-inter-medium'
                )}
                numberOfLines={1}
              >
                {data.description}
              </Text>
            </View>
          );
        }}

        styles={{
          container: { flex: 1, position:"relative" },
          textInputContainer: { backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0, paddingHorizontal: 0 },
          textInput: { height: 50, color: '#111827', fontSize: 16, backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' },
          listView: { backgroundColor: 'white', borderRadius: 8, zIndex: 1000, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB', position:"absolute", top: 60 },
          row: { padding: 13, flexDirection: 'row', alignItems: 'center' },
        }}

        keyboardShouldPersistTaps="handled"
        enablePoweredByContainer={false}
      />
    </View>
  );
};

export default AddressAutocomplete;