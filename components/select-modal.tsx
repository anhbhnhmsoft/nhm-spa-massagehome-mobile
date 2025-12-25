import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';

// Định nghĩa kiểu dữ liệu cho item trong danh sách
export interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (item: SelectOption) => void;
  data: SelectOption[];
  value?: string | number; // Để highlight item đang chọn
}

const renderItem = ({
  item,
  value,
  handleSelect,
}: {
  item: SelectOption;
  value?: string | number;
  handleSelect: (item: SelectOption) => void;
}) => {
  const isSelected = item.value === value;
  return (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      className={`flex-row items-center border-b border-gray-100 p-4 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
      <View className="flex-1">
        <Text
          className={`text-base ${isSelected ? 'font-inter-bold text-primary-color-2' : 'font-inter-medium text-gray-800'}`}>
          {item.label}
        </Text>
      </View>

      {isSelected && <Ionicons name="checkmark-circle" size={24} color="#2B7BBE" />}
    </TouchableOpacity>
  );
};

const SelectModal: React.FC<Props> = ({ isVisible, onClose, onSelect, data, value }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc dữ liệu dựa trên từ khóa tìm kiếm
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, searchQuery]);

  const handleSelect = (item: SelectOption) => {
    onSelect(item);
    onClose();
    setSearchQuery(''); // Reset search khi đóng
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          <TouchableWithoutFeedback>
            <View className="h-[85%] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl">
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
                <Text className="font-inter-bold text-gray-800">{t('common.select_title')}</Text>
                <TouchableOpacity onPress={onClose} className="p-1">
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View className="bg-white p-4">
                <View className="flex-row items-center rounded-xl bg-gray-100 px-3 py-2.5">
                  <Ionicons name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    className="ml-2 flex-1 font-inter-semibold text-base text-gray-800"
                    placeholder={t('common.search_placeholder')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                    autoCorrect={false}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* List Data */}
              <FlatList
                data={filteredData}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => renderItem({ item, value, handleSelect })}
                contentContainerStyle={{ paddingBottom: 30 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View className="mt-10 items-center justify-center">
                    <Text className="font-inter-medium text-gray-500">
                      {t('common.no_results')}
                    </Text>
                  </View>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SelectModal;
