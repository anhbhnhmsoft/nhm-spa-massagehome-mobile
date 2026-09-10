import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Headphones,
  MapPin,
  MessageSquare,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { Text } from '@/components/ui/text';
import { useKtvProposalsQuery } from '@/features/service-request/hooks/use-query';
import { useKtvRespondProposalMutation } from '@/features/service-request/hooks/use-mutation';
import {
  _ProposalStatus,
  _ServiceRequestProposalInfo,
  _UrgencyLevel,
} from '@/features/service-request/types';
import { formatBalance } from '@/lib/utils';
import useToast from '@/features/app/hooks/use-toast';

const getLocalizedText = (value: any, lang = 'vi'): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed[lang] || parsed['vi'] || parsed['en'] || '';
      }
    } catch {
      return value;
    }
    return value;
  }
  if (typeof value === 'object') {
    return value[lang] || value['vi'] || value['en'] || '';
  }
  return '';
};

export const KtvIncomingProposalSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: proposals, isLoading } = useKtvProposalsQuery({
    refetchInterval: 4000,
  });
  const respondMutation = useKtvRespondProposalMutation();
  const { success, error: toastError } = useToast();

  const pendingProposals = useMemo(() => {
    if (!proposals || !Array.isArray(proposals)) return [];
    return proposals.filter((p) => Number(p.status) === _ProposalStatus.PROPOSED);
  }, [proposals]);

  if (!pendingProposals || pendingProposals.length === 0) {
    return null;
  }

  const handleRespond = (proposalId: number, accept: boolean) => {
    respondMutation.mutate(
      { proposalId, accept },
      {
        onSuccess: () => {
          if (accept) {
            success({
              title: t('common.success', 'Thành công'),
              message: t(
                'service_request_form.ktv_accept_success',
                'Bạn đã đồng ý nhận yêu cầu dịch vụ! Đang chờ khách hàng xác nhận.'
              ),
            });
          } else {
            success({
              title: t('common.success', 'Thành công'),
              message: t(
                'service_request_form.ktv_reject_success',
                'Đã từ chối đề xuất nhận việc.'
              ),
            });
          }
        },
        onError: (err: any) => {
          toastError({
            title: t('common.error', 'Lỗi'),
            message:
              err?.message ||
              t('common.error_occurred', 'Có lỗi xảy ra, vui lòng thử lại.'),
          });
        },
      }
    );
  };

  return (
    <View className="mb-6">
      {/* Section Header with pulsing indicator */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-amber-100">
            <Sparkles size={16} color="#D97706" />
          </View>
          <Text className="font-inter-bold text-lg text-slate-900">
            {t('service_request_form.ktv_incoming_proposal_title', 'Đề xuất việc từ CSKH')}
          </Text>
        </View>
        <View className="rounded-full bg-amber-500 px-2.5 py-0.5">
          <Text className="font-inter-bold text-xs text-white">
            {pendingProposals.length} {t('common.new', 'Mới')}
          </Text>
        </View>
      </View>

      {/* List Proposals */}
      {pendingProposals.map((proposal) => {
        const req = proposal.service_request || proposal.serviceRequest;
        const serviceTitle =
          getLocalizedText(req?.service?.title, i18n.language) ||
          getLocalizedText(req?.category?.title, i18n.language) ||
          t('service_request_form.default_service_name', 'Dịch vụ Massage');

        const customerName =
          req?.customer?.name || t('service_request_form.customer_default', 'Khách hàng MasaHome');

        const isPendingAction =
          respondMutation.isPending &&
          respondMutation.variables?.proposalId === proposal.id;

        return (
          <View
            key={proposal.id}
            className="mb-4 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-md">
            {/* Top Accent Bar */}
            <View className="flex-row items-center justify-between bg-amber-500 px-4 py-2">
              <View className="flex-row items-center">
                <BellRing size={14} color="#FFFFFF" />
                <Text className="ml-1.5 font-inter-semibold text-xs text-white">
                  {t('service_request_form.proposal_badge', 'Yêu cầu CSKH ghép đơn')} #{req?.id || proposal.request_id}
                </Text>
              </View>

              {/* Urgency Badge */}
              {req?.urgency_level === _UrgencyLevel.NEED_NOW && (
                <View className="rounded-full bg-red-600 px-2 py-0.5">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_now', '⚡ Cần gấp 30-60p')}
                  </Text>
                </View>
              )}
              {req?.urgency_level === _UrgencyLevel.TODAY && (
                <View className="rounded-full bg-amber-600 px-2 py-0.5">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_today', '📅 Trong ngày')}
                  </Text>
                </View>
              )}
              {req?.urgency_level === _UrgencyLevel.SCHEDULED && (
                <View className="rounded-full bg-sky-600 px-2 py-0.5">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_scheduled', '⏰ Đặt lịch')}
                  </Text>
                </View>
              )}
            </View>

            <View className="p-4">
              {/* Service Title & Price */}
              <View className="mb-2.5 flex-row items-start justify-between">
                <Text
                  className="mr-2 flex-1 font-inter-bold text-base text-slate-900"
                  numberOfLines={2}>
                  {serviceTitle}
                </Text>
                {req?.service?.price ? (
                  <Text className="font-inter-bold text-base text-[#2B7BBE]">
                    {formatBalance(req.service.price)} đ
                  </Text>
                ) : null}
              </View>

              {/* Customer info & CSKH */}
              <View className="mb-2 flex-row items-center">
                <User size={14} color="#64748B" />
                <Text className="ml-2 font-inter-medium text-sm text-slate-700">
                  {customerName}
                </Text>
                {proposal.cskh?.name ? (
                  <View className="ml-2 flex-row items-center rounded-md bg-slate-100 px-1.5 py-0.5">
                    <Headphones size={11} color="#64748B" />
                    <Text className="ml-1 text-[11px] text-slate-500">
                      CSKH: {proposal.cskh.name}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Date & Time Slot */}
              {(req?.preferred_date || req?.time_slot) && (
                <View className="mb-2 flex-row items-center">
                  <Clock size={14} color="#64748B" />
                  <Text className="ml-2 font-inter-regular text-sm text-slate-600">
                    {req?.preferred_date
                      ? dayjs(req.preferred_date).format('DD/MM/YYYY')
                      : ''}{' '}
                    {req?.time_slot ? `(${req.time_slot})` : ''}
                  </Text>
                </View>
              )}

              {/* Address */}
              {req?.address ? (
                <View className="mb-2 flex-row items-start">
                  <MapPin size={14} color="#EF4444" style={{ marginTop: 2 }} />
                  <Text
                    className="ml-2 flex-1 font-inter-regular text-sm text-slate-600"
                    numberOfLines={2}>
                    {req.address}
                  </Text>
                </View>
              ) : null}

              {/* Customer Note */}
              {req?.note ? (
                <View className="mb-3 flex-row items-start rounded-xl bg-amber-50/80 p-2.5">
                  <MessageSquare size={13} color="#D97706" style={{ marginTop: 2 }} />
                  <Text className="ml-2 flex-1 font-inter-regular text-xs text-amber-900">
                    {t('service_request_form.note_prefix', 'Ghi chú:')} {req.note}
                  </Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View className="mt-2 flex-row gap-3">
                {/* Từ chối */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-3"
                  onPress={() => handleRespond(proposal.id, false)}
                  disabled={isPendingAction}
                  activeOpacity={0.7}>
                  <XCircle size={16} color="#E11D48" />
                  <Text className="ml-1.5 font-inter-bold text-sm text-rose-600">
                    {t('service_request_form.ktv_reject_job', 'Từ chối')}
                  </Text>
                </TouchableOpacity>

                {/* Nhận đơn */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-xl bg-emerald-600 py-3 shadow-sm"
                  onPress={() => handleRespond(proposal.id, true)}
                  disabled={isPendingAction}
                  activeOpacity={0.7}>
                  {isPendingAction ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} color="#FFFFFF" />
                      <Text className="ml-1.5 font-inter-bold text-sm text-white">
                        {t('service_request_form.ktv_accept_job', 'Nhận đơn')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
