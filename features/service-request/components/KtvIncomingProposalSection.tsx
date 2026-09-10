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

  const handleRespond = (proposalId: number | string, accept: boolean) => {
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
      {/* Section Header with brand blue indicator */}
      <View className="mb-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-full bg-blue-50">
            <Sparkles size={18} color="#2B7BBE" />
          </View>
          <Text className="font-inter-bold text-lg text-slate-900">
            {t('service_request_form.ktv_incoming_proposal_title', 'Đề xuất việc từ CSKH')}
          </Text>
        </View>
        <View className="rounded-full bg-[#2B7BBE] px-3 py-1 shadow-sm">
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
            className="mb-4 overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-md shadow-blue-500/10">
            {/* Top Accent Bar: MasaHome Brand Blue */}
            <View className="flex-row items-center justify-between bg-[#2B7BBE] px-3.5 py-2.5">
              <View className="flex-row items-center flex-1 min-w-0 mr-2">
                <BellRing size={14} color="#FFFFFF" />
                <Text className="ml-1.5 font-inter-bold text-[11px] text-white flex-shrink" numberOfLines={1}>
                  {t('service_request_form.proposal_badge', 'Yêu cầu CSKH ghép đơn')}
                </Text>
              </View>

              {/* Urgency Badge */}
              {req?.urgency_level === _UrgencyLevel.NEED_NOW && (
                <View className="flex-shrink-0 rounded-full bg-red-500 px-2 py-0.5 shadow-sm">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_now', '⚡ Cần gấp 30-60p')}
                  </Text>
                </View>
              )}
              {req?.urgency_level === _UrgencyLevel.TODAY && (
                <View className="flex-shrink-0 rounded-full bg-amber-500 px-2 py-0.5 shadow-sm">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_today', '📅 Trong ngày')}
                  </Text>
                </View>
              )}
              {req?.urgency_level === _UrgencyLevel.SCHEDULED && (
                <View className="flex-shrink-0 rounded-full bg-sky-500 px-2 py-0.5 shadow-sm">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_scheduled', '⏰ Đặt lịch')}
                  </Text>
                </View>
              )}
            </View>

            <View className="p-4">
              {/* Service Title, Request ID & Price */}
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-[11px] font-inter-semibold text-slate-400 mb-0.5">
                    Mã yêu cầu: #{req?.id || proposal.request_id}
                  </Text>
                  <Text
                    className="font-inter-bold text-base text-slate-900 leading-6"
                    numberOfLines={2}>
                    {serviceTitle}
                  </Text>
                </View>
                {req?.service?.price ? (
                  <View className="rounded-xl bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                    <Text className="font-inter-bold text-sm text-emerald-700">
                      {formatBalance(req.service.price)} đ
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Customer info & CSKH */}
              <View className="mb-2.5 flex-row items-center flex-wrap gap-2">
                <View className="flex-row items-center rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/80">
                  <User size={14} color="#64748B" />
                  <Text className="ml-1.5 font-inter-semibold text-xs text-slate-700">
                    {customerName}
                  </Text>
                </View>
                {proposal.cskh?.name ? (
                  <View className="flex-row items-center rounded-xl bg-sky-50 px-3 py-1.5 border border-sky-200/80">
                    <Headphones size={13} color="#0284C7" />
                    <Text className="ml-1.5 font-inter-semibold text-xs text-sky-700">
                      CSKH: {proposal.cskh.name}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Date & Time Slot */}
              {(req?.preferred_date || req?.time_slot) && (
                <View className="mb-2.5 flex-row items-center rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/80">
                  <Clock size={14} color="#64748B" />
                  <Text className="ml-1.5 font-inter-medium text-xs text-slate-600">
                    {req?.preferred_date
                      ? dayjs(req.preferred_date).format('DD/MM/YYYY')
                      : ''}{' '}
                    {req?.time_slot ? `(${req.time_slot})` : ''}
                  </Text>
                </View>
              )}

              {/* Address */}
              {req?.address ? (
                <View className="mb-2.5 flex-row items-start rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
                  <MapPin size={15} color="#EF4444" style={{ marginTop: 1 }} />
                  <Text
                    className="ml-2 flex-1 font-inter-medium text-xs text-slate-700 leading-5"
                    numberOfLines={2}>
                    {req.address}
                  </Text>
                </View>
              ) : null}

              {/* Customer Note */}
              {req?.note ? (
                <View className="mb-3.5 flex-row items-start rounded-xl bg-blue-50/70 p-3 border border-blue-100">
                  <MessageSquare size={14} color="#2B7BBE" style={{ marginTop: 1 }} />
                  <Text className="ml-2 flex-1 font-inter-regular text-xs text-slate-800 leading-5">
                    {t('service_request_form.note_prefix', 'Ghi chú:')} {req.note}
                  </Text>
                </View>
              ) : null}

              {/* Action Buttons */}
              <View className="mt-1 flex-row gap-3">
                {/* Từ chối */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-rose-300 bg-rose-50 py-3.5 active:bg-rose-100"
                  onPress={() => handleRespond(proposal.id, false)}
                  disabled={isPendingAction}
                  activeOpacity={0.75}>
                  <XCircle size={17} color="#E11D48" />
                  <Text className="ml-1.5 font-inter-bold text-sm text-rose-600">
                    {t('service_request_form.ktv_reject_job', 'Từ chối')}
                  </Text>
                </TouchableOpacity>

                {/* Nhận đơn */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center rounded-xl bg-[#2B7BBE] py-3.5 shadow-md shadow-blue-500/20 active:opacity-90"
                  onPress={() => handleRespond(proposal.id, true)}
                  disabled={isPendingAction}
                  activeOpacity={0.75}>
                  {isPendingAction ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <CheckCircle2 size={17} color="#FFFFFF" />
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
