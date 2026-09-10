import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sparkles, Clock, CheckCircle2, Headphones, MapPin } from 'lucide-react-native';
import dayjs from 'dayjs';
import { Text } from '@/components/ui/text';
import { useCustomerServiceRequestsQuery } from '@/features/service-request/hooks/use-query';
import {
  _ProposalStatus,
  _ServiceRequestInfo,
  _ServiceRequestStatus,
  _UrgencyLevel,
} from '@/features/service-request/types';
import { KtvProposalCard } from './KtvProposalCard';
import { formatBalance } from '@/lib/utils';
import useToast from '@/features/app/hooks/use-toast';
import { queryClient } from '@/lib/provider/query-provider';
import { router } from 'expo-router';

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

export const CustomerActiveRequestSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { data: requests, refetch } = useCustomerServiceRequestsQuery({
    refetchInterval: 4000,
  });
  const { success } = useToast();

  const activeRequests = useMemo(() => {
    if (!requests || !Array.isArray(requests)) return [];
    return requests.filter((r) =>
      [
        _ServiceRequestStatus.NEW,
        _ServiceRequestStatus.ASSIGNED,
        _ServiceRequestStatus.SEARCHING_KTV,
        _ServiceRequestStatus.PROPOSAL_SENT,
        _ServiceRequestStatus.WAITING_CUSTOMER_CONFIRM,
      ].includes(r.status)
    );
  }, [requests]);

  if (!activeRequests || activeRequests.length === 0) {
    return null;
  }

  return (
    <View className="mb-6 px-4">
      {activeRequests.map((req) => {
        const serviceTitle =
          getLocalizedText(req.service?.title, i18n.language) ||
          getLocalizedText(req.category?.title, i18n.language) ||
          t('service_request_form.default_service_name', 'Dịch vụ Massage');

        // Lấy đề xuất mới nhất KTV đã chấp nhận hoặc đã gửi
        const acceptedProposal = req.proposals?.find(
          (p) => Number(p.status) === _ProposalStatus.KTV_ACCEPTED
        ) || req.proposals?.find(
          (p) => Number(p.status) === _ProposalStatus.PROPOSED
        );

        return (
          <View
            key={req.id}
            className="mb-4 overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-md shadow-blue-500/10">
            {/* Header trạng thái */}
            <View className="flex-row items-center justify-between bg-[#2B7BBE] px-3.5 py-2.5">
              <View className="flex-row items-center flex-1 min-w-0 mr-2">
                <Sparkles size={14} color="#FFFFFF" />
                <Text className="ml-1.5 font-inter-bold text-[11px] text-white flex-shrink" numberOfLines={1}>
                  {acceptedProposal
                    ? t('service_request_form.has_ktv_ready', '✨ ĐÃ TÌM THẤY KTV PHÙ HỢP!')
                    : t('service_request_form.cskh_matching_title', 'CSKH Đang Tìm KTV...')}
                </Text>
              </View>

              {req.urgency_level === _UrgencyLevel.NEED_NOW && (
                <View className="flex-shrink-0 rounded-full bg-red-500 px-2.5 py-0.5 shadow-sm">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_now_short', '⚡ Cần gấp')}
                  </Text>
                </View>
              )}
              {req.urgency_level === _UrgencyLevel.TODAY && (
                <View className="flex-shrink-0 rounded-full bg-amber-500 px-2.5 py-0.5 shadow-sm">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_today_short', '📅 Trong ngày')}
                  </Text>
                </View>
              )}
              {req.urgency_level === _UrgencyLevel.SCHEDULED && (
                <View className="flex-shrink-0 rounded-full bg-sky-500 px-2.5 py-0.5 shadow-sm">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_scheduled_short', '⏰ Đặt lịch')}
                  </Text>
                </View>
              )}
            </View>

            <View className="p-4">
              {/* Tên dịch vụ & Giá */}
              <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-[11px] font-inter-semibold text-slate-400 mb-0.5">
                    Mã yêu cầu: #{req.id}
                  </Text>
                  <Text className="font-inter-bold text-base text-slate-900 leading-6" numberOfLines={2}>
                    {serviceTitle}
                  </Text>
                </View>
                {req.service?.price ? (
                  <View className="rounded-xl bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                    <Text className="font-inter-bold text-sm text-emerald-700">
                      {formatBalance(req.service.price)} đ
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Thông tin địa chỉ & thời gian */}
              {req.address ? (
                <View className="mb-2 flex-row items-start rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <MapPin size={15} color="#EF4444" style={{ marginTop: 1 }} />
                  <Text className="ml-2 flex-1 font-inter-medium text-xs text-slate-700 leading-5" numberOfLines={2}>
                    {req.address}
                  </Text>
                </View>
              ) : null}

              {(req.preferred_date || req.time_slot) && (
                <View className="mb-3 flex-row items-center rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-100">
                  <Clock size={14} color="#64748B" />
                  <Text className="ml-1.5 font-inter-medium text-xs text-slate-600">
                    {req.preferred_date ? dayjs(req.preferred_date).format('DD/MM/YYYY') : ''}{' '}
                    {req.time_slot ? `(${req.time_slot})` : ''}
                  </Text>
                </View>
              )}

              {/* Nếu có đề xuất KTV đã nhận việc -> Hiện KtvProposalCard để khách chốt */}
              {acceptedProposal ? (
                <View className="mt-2">
                  <View className="mb-2.5 rounded-xl bg-emerald-50 p-3 border border-emerald-200/80">
                    <Text className="font-inter-medium text-xs text-emerald-800 leading-5">
                      {t(
                        'service_request_form.ktv_accepted_hint',
                        'KTV này đã đồng ý nhận việc! Bạn vui lòng bấm Đồng ý để chốt đơn.'
                      )}
                    </Text>
                  </View>

                  <KtvProposalCard
                    proposal={acceptedProposal}
                    onSuccess={() => {
                      success({
                        title: t('common.success', 'Thành công'),
                        message: t(
                          'service_request_form.customer_accept_success',
                          'Đã chốt KTV thành công! Đơn lịch hẹn của bạn đã được tạo.'
                        ),
                      });
                      refetch();
                      // Điều hướng sang tab đơn hàng
                      router.push('/(app)/(customer)/(tab)/orders');
                    }}
                  />
                </View>
              ) : (
                <View className="mt-1 rounded-xl bg-sky-50 p-3.5 border border-sky-100">
                  <View className="flex-row items-center">
                    <Headphones size={16} color="#0284C7" />
                    <Text className="ml-2 font-inter-semibold text-xs text-sky-900 flex-1">
                      {t('service_request_form.cskh_processing', 'CSKH MasaHome đang liên hệ KTV tốt nhất cho bạn.')}
                    </Text>
                  </View>
                  <Text className="mt-1 text-[11px] text-sky-700 leading-4">
                    {t('service_request_form.cskh_notify_soon', 'Khi KTV nhận đơn, thông tin KTV sẽ hiện tại đây để bạn duyệt.')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};
