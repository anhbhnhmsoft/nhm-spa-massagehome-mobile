import React from 'react';
import { View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { CheckCircle2, XCircle, UserCheck } from 'lucide-react-native';
import { KtvProactiveInviteType } from '../types';
import { useRespondInviteMutation } from '../hooks/use-mutation';

interface CustomerInviteCardModalProps {
  invite: KtvProactiveInviteType;
  onSuccess?: () => void;
}

export const CustomerInviteCardModal: React.FC<CustomerInviteCardModalProps> = ({
  invite,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const respondInviteMutation = useRespondInviteMutation();

  const handleRespond = (accept: boolean) => {
    respondInviteMutation.mutate(
      { inviteId: invite.id, accept },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  const ktv = invite.ktv;

  return (
    <View className="bg-sky-50 rounded-xl p-3.5 border border-sky-200 mb-3">
      <View className="flex-row items-center gap-1.5 mb-2.5">
        <UserCheck size={18} color="#0284C7" />
        <Text className="text-sm font-bold text-sky-700">
          {t('proactive_matching.direct_invite_title')}
        </Text>
      </View>

      <View className="flex-row items-center gap-3 mb-3">
        {ktv?.avatar ? (
          <Image source={{ uri: ktv.avatar }} className="w-12 h-12 rounded-full" />
        ) : (
          <View className="w-12 h-12 rounded-full bg-slate-300 items-center justify-center">
            <Text className="text-lg font-bold text-slate-700">
              {ktv?.name ? ktv.name.charAt(0).toUpperCase() : 'K'}
            </Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900">
            {ktv?.name || 'KTV MasaHome'}
          </Text>
          {invite.note && (
            <Text className="text-xs italic text-slate-600 mt-0.5">
              "{invite.note}"
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg bg-sky-600"
          onPress={() => handleRespond(true)}
          disabled={respondInviteMutation.isPending}
        >
          {respondInviteMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold">
                {t('proactive_matching.accept_and_book')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200"
          onPress={() => handleRespond(false)}
          disabled={respondInviteMutation.isPending}
        >
          <XCircle size={16} color="#E11D48" />
          <Text className="text-rose-600 text-xs font-semibold">
            {t('proactive_matching.reject')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
