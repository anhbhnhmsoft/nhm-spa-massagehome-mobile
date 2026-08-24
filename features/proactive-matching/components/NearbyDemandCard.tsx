import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { MapPin, Clock, Send } from 'lucide-react-native';
import { NearbyDemandItemType } from '../types';
import { useSendInviteMutation } from '../hooks/use-mutation';

interface NearbyDemandCardProps {
  item: NearbyDemandItemType;
  onSuccess?: () => void;
}

export const NearbyDemandCard: React.FC<NearbyDemandCardProps> = ({
  item,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const sendInviteMutation = useSendInviteMutation();

  const handleSendInvite = () => {
    sendInviteMutation.mutate(
      {
        customer_id: item.customer.id,
        request_id: item.request_id,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowNoteInput(false);
          setNote('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <View className="bg-white rounded-xl p-3.5 border border-slate-200 mb-3">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-base font-bold text-slate-900">{item.service_name}</Text>
        {item.distance_km != null && (
          <View className="flex-row items-center gap-1 bg-sky-50 px-2 py-0.5 rounded-full">
            <MapPin size={12} color="#0284C7" />
            <Text className="text-xs font-semibold text-sky-600">
              {item.distance_km} {t('proactive_matching.km_away')}
            </Text>
          </View>
        )}
      </View>

      <Text className="text-xs font-semibold text-slate-700 mb-0.5">
        {item.customer.display_name}
      </Text>
      <Text className="text-xs text-slate-500 mb-2">{item.relative_address}</Text>

      {item.preferred_techniques && item.preferred_techniques.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mb-2">
          {item.preferred_techniques.map((tech, idx) => (
            <View key={idx} className="bg-slate-100 px-2 py-1 rounded-md">
              <Text className="text-xs text-slate-600">{tech}</Text>
            </View>
          ))}
        </View>
      )}

      {item.time_slot && (
        <View className="flex-row items-center gap-1.5 mb-2.5">
          <Clock size={14} color="#64748B" />
          <Text className="text-xs text-slate-500">{item.time_slot}</Text>
        </View>
      )}

      {showNoteInput ? (
        <View className="gap-2">
          <TextInput
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
            placeholder={t('proactive_matching.note_placeholder')}
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            maxLength={200}
          />
          <TouchableOpacity
            className="flex-row items-center justify-center gap-1.5 bg-sky-600 py-2.5 rounded-lg"
            onPress={handleSendInvite}
            disabled={sendInviteMutation.isPending}
          >
            {sendInviteMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Send size={14} color="#FFFFFF" />
                <Text className="text-white text-xs font-semibold">
                  {t('proactive_matching.send_invite')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-1.5 bg-sky-50 py-2.5 rounded-lg border border-sky-200"
          onPress={() => setShowNoteInput(true)}
        >
          <Send size={14} color="#0284C7" />
          <Text className="text-sky-600 text-xs font-semibold">
            {t('proactive_matching.send_service_invite')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
