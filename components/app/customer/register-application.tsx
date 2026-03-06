import { CheckApplyPartnerResponse } from '@/features/user/types';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import DefaultColor from '@/components/styles/color';
import { _UserRole } from '@/features/auth/const';
import { useAuthStore } from '@/features/auth/stores';
import { _ReviewApplicationStatus, _ReviewApplicationStatusMap } from '@/features/user/const';
import { TFunction } from 'i18next';
import { Card } from '@/components/ui/card';


// Helper function để ánh xạ trạng thái ứng dụng
const statusMap = (status: _ReviewApplicationStatus) => {
  switch (status) {
    case _ReviewApplicationStatus.PENDING:
      return {
        bgColor: DefaultColor.yellow[100],
        textColor: DefaultColor.yellow[500],
        text: _ReviewApplicationStatusMap[status],
      };
    case _ReviewApplicationStatus.APPROVED:
      return {
        bgColor: DefaultColor.green[100],
        textColor: DefaultColor.green[500],
        text: _ReviewApplicationStatusMap[status],
      };
    case _ReviewApplicationStatus.REJECTED:
      return {
        bgColor: DefaultColor.red[100],
        textColor: DefaultColor.red[500],
        text: _ReviewApplicationStatusMap[status],
      };
  }
};

// Component con hiển thị hàng thông tin
const InfoRow = ({ label, value, icon, t }: { label: string, value?: string | null, icon: any, t: TFunction }) => (
  <View className="flex-row items-center justify-between py-2 w-full">
    {/* Label Group: Cố định kích thước hoặc chiếm không gian tối thiểu */}
    <View className="flex-row items-center mr-4">
      <MaterialCommunityIcons name={icon} size={20} color="#94a3b8" />
      <Text className="ml-3 text-gray-500 text-sm">{label}</Text>
    </View>

    {/* Value Group: flex-1 để chiếm phần còn lại và ép text phải cắt */}
    <View className="flex-1 items-end">
      <Text
        className="font-inter-bold text-slate-800 text-sm"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value || t('common.no')}
      </Text>
    </View>
  </View>
);

// Helper render Image với Token
const PrivateImage = ({ uri, token }: { uri: string | null, token: string | null }) => {
  if (!uri || !token) return <View
    className={`h-32 w-full rounded-xl bg-gray-200 items-center justify-center`}><Text>N/A</Text></View>;
  return (
    <Image
      source={{ uri, headers: { Authorization: `Bearer ${token}` } }}
      style={{ width: '100%', height: 128, borderRadius: 12 }}
      contentFit="cover"
    />
  );
};

type ModalApplicationProps = {
  t: TFunction;
  isVisible: boolean;
  onClose: () => void;
  data: CheckApplyPartnerResponse['data']['review_application'];
};

export const ModalApplication = ({ t, isVisible, onClose, data }: ModalApplicationProps) => {
  if (!data) return null;

  const token = useAuthStore(s => s.token);

  const statusMapping = statusMap(data.status);

  return (
    <Modal visible={isVisible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={onClose} className="p-2">
            <MaterialCommunityIcons name="close" size={24} color="#334155" />
          </TouchableOpacity>
          <Text
            className="text-lg font-inter-bold text-slate-900">{t('profile.partner_form.modal_application.title')}</Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>

          {/* Status Banner */}
          <View className={`p-4 rounded-2xl mb-6`} style={{ backgroundColor: statusMapping.bgColor }}>
            <View className="flex-row items-center mb-1">
              <MaterialCommunityIcons name="information-outline" size={20} color={statusMapping.textColor} />
              <Text className={`ml-2 font-inter-bold`}
                    style={{ color: statusMapping.textColor }}>{t(statusMapping.text)}</Text>
            </View>
            {data.reason_cancel && (
              <Text
                className="text-gray-600 italic">{t('profile.partner_form.modal_application.reason')}: {data.reason_cancel}</Text>
            )}
          </View>

          {/* Section 1: Thông tin cơ bản */}
          <View className="mb-8">
            <Text
              className="text-gray-400 font-inter-bold uppercase text-xs mb-4 tracking-widest">{t('profile.partner_form.modal_application.information')}</Text>

            <View className="space-y-4">
              {data.role == _UserRole.KTV && (
                <>
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.nickname')}
                    value={data.nickname}
                    icon="account-circle-outline" />
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.experience')}
                    value={`${data.experience} ${t('common.year')}`}
                    icon="briefcase-outline" />
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.role')}
                    value={t('profile.partner_form.modal_application.ktv')}
                    icon="badge-account-horizontal-outline"
                  />
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.leader')}
                    value={data.is_leader ? t('common.yes') : t('common.no')}
                    icon="star-outline" />
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.referrer_id')}
                    value={data.referrer_id || t('common.no')}
                    icon="link-variant" />
                </>
              )}
              {data.role == _UserRole.AGENCY && (
                <>
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.role')}
                    value={t('profile.partner_form.modal_application.agency')}
                    icon="badge-account-horizontal-outline"
                  />
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.real_name')}
                    value={data.nickname}
                    icon="account"
                  />
                  <InfoRow
                    t={t}
                    label={t('profile.partner_form.modal_application.address')}
                    value={data.address}
                    icon="map-marker"
                  />
                </>
              )}



            </View>
          </View>

          {/* Section 2: Bio đa ngôn ngữ */}
          {data.role == _UserRole.KTV && (
            <View className="mb-8 p-4 bg-slate-50 rounded-2xl">
              <Text className="text-gray-400 font-inter-bold uppercase text-xs mb-4 tracking-widest">
                {t('profile.partner_form.modal_application.bio')}
              </Text>

              <View className="space-y-4">
                {/* Tiếng Việt */}
                <View className="border-l-2 border-blue-500 pl-3 mb-4">
                  <Text className="text-[10px] font-inter-bold text-blue-500 uppercase mb-1">Tiếng Việt</Text>
                  <Text className="text-slate-700 leading-6 text-sm">
                    {data.bio?.vi || 'Chưa cập nhật'}
                  </Text>
                </View>

                {/* Tiếng Anh */}
                <View className="border-l-2 border-slate-300 pl-3 mb-4">
                  <Text className="text-[10px] font-inter-bold text-gray-400 uppercase mb-1">English</Text>
                  <Text className="text-slate-700 leading-6 text-sm">
                    {data.bio?.en || 'Not updated'}
                  </Text>
                </View>

                {/* Tiếng Trung */}
                <View className="border-l-2 border-slate-300 pl-3">
                  <Text className="text-[10px] font-inter-bold text-gray-400 uppercase mb-1">中文 (Chinese)</Text>
                  <Text className="text-slate-700 leading-6 text-sm font-medium">
                    {data.bio?.cn || '尚未更新'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Section 3: Giấy tờ (Private Images) */}
          <View className="mb-8">
            <Text
              className="text-gray-400 font-inter-bold uppercase text-xs mb-4 tracking-widest">{t('profile.partner_form.modal_application.identity')}</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] mb-4">
                <Text
                  className="text-xs text-gray-500 mb-2">{t('profile.partner_form.modal_application.cccd_front')}</Text>
                <PrivateImage uri={data.cccd_front} token={token} />
              </View>
              <View className="w-[48%] mb-4">
                <Text
                  className="text-xs text-gray-500 mb-2">{t('profile.partner_form.modal_application.cccd_back')}</Text>
                <PrivateImage uri={data.cccd_back} token={token} />
              </View>
              {data.role == _UserRole.KTV && (
                <View className="w-[48%] mb-4">
                  <Text
                    className="text-xs text-gray-500 mb-2">{t('profile.partner_form.modal_application.face_with_identity_card')}</Text>
                  <PrivateImage uri={data.face_with_identity_card} token={token} />
                </View>
              )}
            </View>
          </View>

          {/* Section 4: Gallery */}
          {data.role == _UserRole.KTV && data.gallery && data.gallery.length > 0 && (
            <View className="mb-10">
              <Text
                className="text-gray-400 font-inter-bold uppercase text-xs mb-4 tracking-widest">{t('profile.partner_form.modal_application.gallery')} ({data.gallery.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {data.gallery.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: img }}
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 16,
                      marginRight: 16,
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

type CardReasonRejectApplicationProps = {
  t: TFunction;
  data: CheckApplyPartnerResponse['data']['review_application'];
  setShowModalApplication: (show: boolean) => void;
};

export const CardReasonRejectApplication = ({ data, t, setShowModalApplication }: CardReasonRejectApplicationProps) => {

  if (!data) return null;

  return (
    <>
      {data.status === _ReviewApplicationStatus.REJECTED && (
        <Card containerClassName={'mb-2'}>
          <View className="gap-2">
            <Text className="font-inter-bold text-base text-red-500">
              {t('profile.partner_form.cancel_reason_title')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowModalApplication(true)}
              className={'items-center justify-center rounded-xl bg-primary-color-2 px-3 py-1 shadow-blue-200'}
            >
              <Text className="font-inter-bold text-sm text-white">
                {t('profile.partner_form.show_application')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </>
  );
};


type CardPendingApplicationProps = {
  t: TFunction;
  data: CheckApplyPartnerResponse['data']['review_application'];
  setShowModalApplication: (show: boolean) => void;
}

export const CardPendingApplication = ({ data, t, setShowModalApplication }: CardPendingApplicationProps) => {
  if (!data) return null;

  return (
    <>
      {data.status == _ReviewApplicationStatus.PENDING && (
        <View className="flex-1 justify-center items-center p-4">
          <Card className="justify-center items-center gap-2">
            <Text className="font-inter-bold text-sm text-center leading-6">
              {/* KTV */}
              {data.role == _UserRole.KTV && !data.is_leader && t('profile.partner_form.status_pending_for_ktv')}
              {/* KTV Leader */}
              {data.role == _UserRole.KTV && data.is_leader && t('profile.partner_form.status_pending_for_ktv_leader')}
              {/* Agency */}
              {data?.role == _UserRole.AGENCY && t('profile.partner_form.status_pending_for_agency')}
            </Text>

            <TouchableOpacity
              onPress={() => setShowModalApplication(true)}
              className={'items-center justify-center rounded-xl bg-primary-color-2 px-3 py-2 shadow-blue-200'}
            >
              <Text className="font-inter-bold text-sm text-white">
                {t('profile.partner_form.show_application')}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      )}
    </>
  );

};