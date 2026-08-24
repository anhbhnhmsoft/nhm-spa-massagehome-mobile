import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, MapPin, Clock, FileText } from 'lucide-react-native';
import { useCreateServiceRequestMutation } from '@/features/service-request/hooks/use-mutation';
import { _UrgencyLevel } from '@/features/service-request/types';

interface CreateServiceRequestModalProps {
  visible: boolean;
  onClose: () => void;
  serviceId: number;
  serviceTitle: string;
  onSuccess?: () => void;
}

const TECHNIQUES_OPTIONS = [
  { id: 'acupressure', labelKey: 'admin.ktv_technique.acupressure' },
  { id: 'massage', labelKey: 'admin.ktv_technique.massage' },
  { id: 'therapy', labelKey: 'admin.ktv_technique.therapy' },
  { id: 'stretching', labelKey: 'admin.ktv_technique.stretching' },
  { id: 'essential_oil', labelKey: 'admin.ktv_technique.essential_oil' },
];

export const CreateServiceRequestModal: React.FC<CreateServiceRequestModalProps> = ({
  visible,
  onClose,
  serviceId,
  serviceTitle,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<_UrgencyLevel>(
    _UrgencyLevel.NEED_NOW
  );
  const [address, setAddress] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateServiceRequestMutation();

  const toggleTechnique = (id: string) => {
    setSelectedTechniques((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (!address.trim()) {
      setErrorMessage(t('service_request_form.address_placeholder'));
      return;
    }
    setErrorMessage(null);

    createMutation.mutate(
      {
        service_id: serviceId,
        preferred_techniques: selectedTechniques,
        urgency_level: urgencyLevel,
        address: address.trim(),
        note: note.trim(),
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          setErrorMessage(err?.response?.data?.message || 'Error creating request');
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={20} color="#E11D48" />
              <Text style={styles.headerTitle}>
                {t('service_request_form.title')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              {t('service_request_form.subtitle')}
            </Text>

            {/* Dịch vụ đã chọn */}
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceBadgeText}>
                {t('service_request_form.service_label')}: {serviceTitle}
              </Text>
            </View>

            {/* Kỹ thuật mong muốn */}
            <Text style={styles.sectionTitle}>
              {t('service_request_form.techniques_label')}
            </Text>
            <View style={styles.chipContainer}>
              {TECHNIQUES_OPTIONS.map((item) => {
                const isSelected = selectedTechniques.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleTechnique(item.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {t(item.labelKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mức độ gấp */}
            <Text style={styles.sectionTitle}>
              {t('service_request_form.urgency_label')}
            </Text>
            <View style={styles.urgencyContainer}>
              {[
                { level: _UrgencyLevel.NEED_NOW, label: t('admin.urgency_level.need_now') },
                { level: _UrgencyLevel.TODAY, label: t('admin.urgency_level.today') },
                { level: _UrgencyLevel.SCHEDULED, label: t('admin.urgency_level.scheduled') },
              ].map((item) => (
                <TouchableOpacity
                  key={item.level}
                  style={[
                    styles.urgencyButton,
                    urgencyLevel === item.level && styles.urgencyButtonSelected,
                  ]}
                  onPress={() => setUrgencyLevel(item.level)}
                >
                  <Clock size={16} color={urgencyLevel === item.level ? '#FFFFFF' : '#64748B'} />
                  <Text
                    style={[
                      styles.urgencyText,
                      urgencyLevel === item.level && styles.urgencyTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Địa chỉ */}
            <View style={styles.inputHeader}>
              <MapPin size={16} color="#E11D48" />
              <Text style={styles.sectionTitleNoMargin}>
                {t('service_request_form.address_label')}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={t('service_request_form.address_placeholder')}
              value={address}
              onChangeText={setAddress}
              multiline
            />

            {/* Ghi chú */}
            <View style={styles.inputHeader}>
              <FileText size={16} color="#0284C7" />
              <Text style={styles.sectionTitleNoMargin}>
                {t('service_request_form.note_label')}
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('service_request_form.note_placeholder')}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />

            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </ScrollView>

          {/* Footer Submit */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('service_request_form.submit_button')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  serviceBadge: {
    backgroundColor: '#FFF1F2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  serviceBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E11D48',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitleNoMargin: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  urgencyContainer: {
    gap: 8,
    marginBottom: 16,
  },
  urgencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  urgencyButtonSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  urgencyText: {
    fontSize: 13,
    color: '#475569',
  },
  urgencyTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
