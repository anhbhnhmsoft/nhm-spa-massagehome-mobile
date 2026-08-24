import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, ShieldCheck, Award, MapPin, Wrench } from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { KtvVerificationInfo } from '@/features/ktv/types';
import { _KtvTechniqueLabels, _KtvServiceLocationLabels } from '@/features/ktv/consts';
import { useUpdateKtvVerificationMutation } from '@/features/ktv/hooks/use-mutation';

interface KtvVerificationCardProps {
  verification?: KtvVerificationInfo;
  onRefresh?: () => void;
}

export const KtvVerificationCard: React.FC<KtvVerificationCardProps> = ({
  verification,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>(
    verification?.techniques || []
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    verification?.service_locations || []
  );

  const updateMutation = useUpdateKtvVerificationMutation();

  const handleToggleTechnique = (tech: string) => {
    const updated = selectedTechniques.includes(tech)
      ? selectedTechniques.filter((t) => t !== tech)
      : [...selectedTechniques, tech];
    setSelectedTechniques(updated);
  };

  const handleToggleLocation = (loc: string) => {
    const updated = selectedLocations.includes(loc)
      ? selectedLocations.filter((l) => l !== loc)
      : [...selectedLocations, loc];
    setSelectedLocations(updated);
  };

  const handleSaveCompetency = () => {
    updateMutation.mutate(
      {
        techniques: selectedTechniques,
        service_locations: selectedLocations,
      },
      {
        onSuccess: () => {
          Alert.alert(
            t('common.save'),
            t('ktv_verification.save_success')
          );
          onRefresh?.();
        },
        onError: (err: any) => {
          Alert.alert(
            t('common_error.program_error'),
            err?.response?.data?.message || t('ktv_verification.save_error')
          );
        },
      }
    );
  };

  return (
    <Card title={t('ktv_verification.title')}>
      {/* 1. KHUNG HỒ SƠ XÁC THỰC */}
      <View className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
        <View className="flex-row items-center mb-2">
          <ShieldCheck size={18} color={DefaultColor.emerald[600]} />
          <Text className="ml-2 font-inter-semibold text-slate-800 text-sm">
            {t('ktv_verification.verification_status')}
          </Text>
        </View>

        <View className="space-y-2 mt-1">
          {/* SĐT Liên hệ */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-slate-600 font-inter-medium">
              {t('ktv_verification.contact_phone')}
            </Text>
            <View className="flex-row items-center">
              {verification?.contact_verified ? (
                <>
                  <CheckCircle2 size={14} color={DefaultColor.emerald[500]} />
                  <Text className="ml-1 text-xs text-emerald-600 font-inter-semibold">
                    {t('ktv_verification.verified')} ({verification.contact_phone})
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={DefaultColor.slate[400]} />
                  <Text className="ml-1 text-xs text-slate-500 font-inter-regular">
                    {t('ktv_verification.unverified')}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Chân dung */}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-slate-600 font-inter-medium">
              {t('ktv_verification.portrait')}
            </Text>
            <View className="flex-row items-center">
              {verification?.portrait_verified ? (
                <>
                  <CheckCircle2 size={14} color={DefaultColor.emerald[500]} />
                  <Text className="ml-1 text-xs text-emerald-600 font-inter-semibold">
                    {t('ktv_verification.verified_by_masahome')}
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={DefaultColor.slate[400]} />
                  <Text className="ml-1 text-xs text-slate-500 font-inter-regular">
                    {t('ktv_verification.unverified_videocall')}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Chứng chỉ */}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-slate-600 font-inter-medium">
              {t('ktv_verification.certificate')}
            </Text>
            <View className="flex-row items-center">
              {verification?.certificate_verified ? (
                <>
                  <Award size={14} color={DefaultColor.emerald[500]} />
                  <Text className="ml-1 text-xs text-emerald-600 font-inter-semibold">
                    {t('ktv_verification.certificates_count', { count: verification.certificates?.length || 0 })}
                  </Text>
                </>
              ) : (
                <>
                  <XCircle size={14} color={DefaultColor.slate[400]} />
                  <Text className="ml-1 text-xs text-slate-500 font-inter-regular">
                    {t('ktv_verification.no_certificate')}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 2. KỸ THUẬT CHUYÊN MÔN (MULTIPLE CHOICE) */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Wrench size={16} color={DefaultColor.emerald[600]} />
          <Text className="ml-2 font-inter-semibold text-slate-800 text-sm">
            {t('ktv_verification.techniques')}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {Object.entries(_KtvTechniqueLabels).map(([key, labelKey]) => {
            const isSelected = selectedTechniques.includes(key);
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleToggleTechnique(key)}
                className={`px-3 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-inter-medium ${
                    isSelected ? 'text-emerald-700 font-inter-semibold' : 'text-slate-600'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. ĐỊA ĐIỂM DỊCH VỤ */}
      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <MapPin size={16} color={DefaultColor.blue[600]} />
          <Text className="ml-2 font-inter-semibold text-slate-800 text-sm">
            {t('ktv_verification.service_locations')}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {Object.entries(_KtvServiceLocationLabels).map(([key, labelKey]) => {
            const isSelected = selectedLocations.includes(key);
            return (
              <TouchableOpacity
                key={key}
                onPress={() => handleToggleLocation(key)}
                className={`px-3 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text
                  className={`text-xs font-inter-medium ${
                    isSelected ? 'text-blue-700 font-inter-semibold' : 'text-slate-600'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}
                  {t(labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* NÚT LƯU CẬP NHẬT */}
      <TouchableOpacity
        onPress={handleSaveCompetency}
        disabled={updateMutation.isPending}
        className="bg-emerald-600 py-2.5 rounded-lg flex-row justify-center items-center mt-1"
      >
        {updateMutation.isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white font-inter-semibold text-xs">
            {t('ktv_verification.save_button')}
          </Text>
        )}
      </TouchableOpacity>
    </Card>
  );
};
