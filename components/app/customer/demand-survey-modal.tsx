import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { X, Sparkles, Check } from 'lucide-react-native';

interface DemandSurveyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

const SERVICE_OPTIONS = [
  { id: 'body', label: 'Massage Body' },
  { id: 'shoulder', label: 'Cổ vai gáy' },
  { id: 'traditional', label: 'Tẩm quất cổ truyền' },
  { id: 'thai', label: 'Massage Thái' },
  { id: 'head', label: 'Gội đầu dưỡng sinh' },
];

const TECHNIQUE_OPTIONS = [
  { id: 'acupressure', label: 'Ấn huyệt' },
  { id: 'massage', label: 'Xoa bóp' },
  { id: 'therapy', label: 'Trị liệu' },
  { id: 'stretching', label: 'Giãn cơ' },
  { id: 'essential_oil', label: 'Thư giãn tinh dầu' },
];

const TIME_SLOT_OPTIONS = [
  { id: '06_12', label: 'Sáng (06h - 12h)' },
  { id: '12_18', label: 'Chiều (12h - 18h)' },
  { id: '18_24', label: 'Tối (18h - 24h)' },
  { id: '00_06', label: 'Đêm (00h - 06h)' },
];

export const DemandSurveyModal: React.FC<DemandSurveyModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);

  const toggleItem = (list: string[], setList: (val: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSave = () => {
    const payload = {
      preferred_services: selectedServices,
      preferred_techniques: selectedTechniques,
      preferred_time_slots: selectedTimeSlots,
      demand_status: 'exploring',
    };
    if (onSubmit) {
      onSubmit(payload);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[85%] rounded-t-3xl bg-white p-5">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between border-b border-gray-100 pb-3">
            <View className="flex-row items-center gap-2">
              <Icon as={Sparkles} size={22} className="text-primary-color-1" />
              <Text className="text-lg font-bold text-gray-900">Khảo sát nhu cầu thư giãn</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-gray-100 p-1.5">
              <Icon as={X} size={18} className="text-gray-600" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
            <Text className="text-xs text-gray-500">
              Hãy chọn sở thích dịch vụ để MasaHome đề xuất Kỹ thuật viên phù hợp nhất cho bạn!
            </Text>

            {/* Dịch vụ quan tâm */}
            <View className="mt-3">
              <Text className="mb-2 font-semibold text-gray-800">Dịch vụ bạn quan tâm</Text>
              <View className="flex-row flex-wrap gap-2">
                {SERVICE_OPTIONS.map((item) => {
                  const active = selectedServices.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleItem(selectedServices, setSelectedServices, item.id)}
                      className={`flex-row items-center rounded-full px-3.5 py-2 border ${
                        active
                          ? 'border-primary-color-1 bg-primary-color-1/10'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {active && <Icon as={Check} size={14} className="mr-1 text-primary-color-1" />}
                      <Text
                        className={`text-xs ${
                          active ? 'font-semibold text-primary-color-1' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Kỹ thuật mong muốn */}
            <View className="mt-4">
              <Text className="mb-2 font-semibold text-gray-800">Kỹ thuật tay nghề mong muốn</Text>
              <View className="flex-row flex-wrap gap-2">
                {TECHNIQUE_OPTIONS.map((item) => {
                  const active = selectedTechniques.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() =>
                        toggleItem(selectedTechniques, setSelectedTechniques, item.id)
                      }
                      className={`flex-row items-center rounded-full px-3.5 py-2 border ${
                        active
                          ? 'border-primary-color-1 bg-primary-color-1/10'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {active && <Icon as={Check} size={14} className="mr-1 text-primary-color-1" />}
                      <Text
                        className={`text-xs ${
                          active ? 'font-semibold text-primary-color-1' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Khung giờ hay đặt */}
            <View className="mt-4 mb-4">
              <Text className="mb-2 font-semibold text-gray-800">Khung giờ hay đặt dịch vụ</Text>
              <View className="flex-row flex-wrap gap-2">
                {TIME_SLOT_OPTIONS.map((item) => {
                  const active = selectedTimeSlots.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleItem(selectedTimeSlots, setSelectedTimeSlots, item.id)}
                      className={`flex-row items-center rounded-full px-3.5 py-2 border ${
                        active
                          ? 'border-primary-color-1 bg-primary-color-1/10'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {active && <Icon as={Check} size={14} className="mr-1 text-primary-color-1" />}
                      <Text
                        className={`text-xs ${
                          active ? 'font-semibold text-primary-color-1' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View className="mt-3 border-t border-gray-100 pt-3">
            <Button onPress={handleSave} className="w-full bg-primary-color-1 py-3.5">
              <Text className="text-center font-bold text-white">Lưu sở thích nhu cầu</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
