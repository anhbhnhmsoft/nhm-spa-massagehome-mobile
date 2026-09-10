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
            className="mb-4 overflow-hidden rounded-2xl border-2 border-primary-color-2 bg-white shadow-md">
            {/* Header trạng thái */}
            <View className="flex-row items-center justify-between bg-primary-color-2 px-4 py-2.5">
              <View className="flex-row items-center">
                <Sparkles size={16} color="#FFFFFF" />
                <Text className="ml-1.5 font-inter-bold text-xs text-white">
                  {acceptedProposal
                    ? t('service_request_form.has_ktv_ready', '✨ ĐÃ TÌM THẤY KTV PHÙ HỢP!')
                    : t('service_request_form.cskh_matching_title', 'CSKH Đang Tìm KTV...')}
                </Text>
              </View>

              {req.urgency_level === _UrgencyLevel.NEED_NOW && (
                <View className="rounded-full bg-red-500 px-2 py-0.5">
                  <Text className="font-inter-bold text-[10px] text-white">
                    {t('service_request_form.urgency_now', '⚡ Cần gấp')}
                  </Text>
                </View>
              )}
            </View>

            <View className="p-4">
              {/* Tên dịch vụ & Giá */}
              <View className="mb-2 flex-row items-start justify-between">
                <Text className="mr-2 flex-1 font-inter-bold text-base text-slate-900">
                  {serviceTitle}
                </Text>
                {req.service?.price ? (
                  <Text className="font-inter-bold text-base text-[#2B7BBE]">
                    {formatBalance(req.service.price)} đ
                  </Text>
                ) : null}
              </View>

              {/* Thông tin địa chỉ & thời gian */}
              {req.address ? (
                <View className="mb-1.5 flex-row items-start">
                  <MapPin size={13} color="#64748B" style={{ marginTop: 2 }} />
                  <Text className="ml-1.5 flex-1 text-xs text-slate-600" numberOfLines={1}>
                    {req.address}
                  </Text>
                </View>
              ) : null}

              {(req.preferred_date || req.time_slot) && (
                <View className="mb-3 flex-row items-center">
                  <Clock size={13} color="#64748B" />
                  <Text className="ml-1.5 text-xs text-slate-600">
                    {req.preferred_date ? dayjs(req.preferred_date).format('DD/MM/YYYY') : ''}{' '}
                    {req.time_slot ? `(${req.time_slot})` : ''}
                  </Text>
                </View>
              )}

              {/* Nếu có đề xuất KTV đã nhận việc -> Hiện KtvProposalCard để khách chốt */}
              {acceptedProposal ? (
                <View className="mt-2">
                  <View className="mb-2 rounded-xl bg-emerald-50 p-2.5">
                    <Text className="font-inter-medium text-xs text-emerald-800">
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
                <View className="mt-1 rounded-xl bg-sky-50 p-3">
                  <View className="flex-row items-center">
                    <Headphones size={15} color="#0284C7" />
                    <Text className="ml-2 font-inter-semibold text-xs text-sky-800">
                      {t('service_request_form.cskh_processing', 'CSKH MasaHome đang liên hệ KTV tốt nhất cho bạn.')}
                    </Text>
                  </View>
                  <Text className="mt-1 text-[11px] text-sky-600">
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
