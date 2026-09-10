import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserCheck, CheckCircle2, XCircle } from 'lucide-react-native';
import { _ServiceRequestProposalInfo } from '@/features/service-request/types';
import { useCustomerRespondProposalMutation } from '@/features/service-request/hooks/use-mutation';
import useToast from '@/features/app/hooks/use-toast';

interface KtvProposalCardProps {
  proposal: _ServiceRequestProposalInfo;
  onSuccess?: () => void;
}

export const KtvProposalCard: React.FC<KtvProposalCardProps> = ({
  proposal,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const respondMutation = useCustomerRespondProposalMutation();
  const { error: toastError } = useToast();

  const handleRespond = (accept: boolean) => {
    respondMutation.mutate(
      { proposalId: proposal.id, accept },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (err: any) => {
          toastError({
            title: t('common.error', 'Lỗi'),
            message:
              err?.response?.data?.message ||
              err?.message ||
              t('common.error_occurred', 'Có lỗi xảy ra, vui lòng thử lại!'),
          });
        },
      }
    );
  };

  const ktv = proposal.ktv;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <UserCheck size={18} color="#2B7BBE" />
        <Text style={styles.headerTitle}>
          {t('service_request_form.proposals_title')}
        </Text>
      </View>

      <View style={styles.ktvInfoRow}>
        {ktv?.avatar_url ? (
          <Image source={{ uri: ktv.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {ktv?.name ? ktv.name.charAt(0).toUpperCase() : 'K'}
            </Text>
          </View>
        )}

        <View style={styles.ktvDetails}>
          <Text style={styles.ktvName}>{ktv?.name || 'KTV MasaHome'}</Text>
          <Text style={styles.ktvPhone}>{ktv?.phone || ''}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleRespond(true)}
          disabled={respondMutation.isPending}
        >
          {respondMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text
                style={styles.acceptButtonText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {t('service_request_form.accept_button')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleRespond(false)}
          disabled={respondMutation.isPending}
        >
          <XCircle size={16} color="#E11D48" />
          <Text
            style={styles.rejectButtonText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t('service_request_form.reject_button')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B7BBE',
  },
  ktvInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B7BBE',
  },
  ktvDetails: {
    flex: 1,
  },
  ktvName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  ktvPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  acceptButton: {
    backgroundColor: '#2B7BBE',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  rejectButton: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  rejectButtonText: {
    color: '#E11D48',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
});
