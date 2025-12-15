import { DetailLocation } from '@/features/location/types';
import { FC } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from "@/components/ui/text"
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { useSearchLocation } from '@/features/location/hooks';
import { ChevronLeft, MapPin, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type LocationSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: DetailLocation) => void;
};

const SearchLocationModal: FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const {t} = useTranslation();
  const {
    keyword,
    results,
    loading,
    handleChangeText,
    clearKeyword,
    handleSelect,
  } = useSearchLocation();

  return (
    <>
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
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
                className="flex-1 text-base text-slate-800 leading-5"
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
            ) : <FlatList
              data={results}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled" // Quan trọng: Để bấm được vào item khi bàn phím đang mở
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center border-b border-gray-100 px-4 py-4 active:bg-gray-50"
                  onPress={() => handleSelect(item, onSelectLocation)}
                >
                  <View className="mr-4 rounded-full bg-gray-100 p-2">
                    <Icon as={MapPin} size={20} className="text-slate-600" />
                  </View>
                  <View className="flex-1">
                    {/* Giả lập hiển thị Title và Subtitle (Laravel của bạn đang trả về 1 string full, nên hiển thị 1 dòng) */}
                    <Text className="text-base font-inter-medium text-slate-800">
                      {item.formatted_address}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loading && keyword.length > 2 ? (
                  <View className="p-8 items-center">
                    <Text className="text-gray-500">{t('location.no_result')}</Text>
                  </View>
                ) : null
              }
            />}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  )
};

export default SearchLocationModal;
