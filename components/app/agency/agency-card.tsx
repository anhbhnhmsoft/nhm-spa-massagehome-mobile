import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Check, ClipboardList, Copy, UserPlus, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import * as Linking from 'expo-linking';
import { _LinkingTask } from '@/features/app/hooks/use-handle-linking';


interface InviteKTVModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

interface AgencyListHeaderProps {
  onInvitePress: () => void;
  totalKtv: number;
}

export const InviteKTVModal = ({ isVisible, onClose, userId }: InviteKTVModalProps) => {
  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tạo full link
  const inviteLink = useMemo(() => {
    return Linking.createURL('/', {
      queryParams: {
        task: _LinkingTask.INVITE_KTV,
        referrer_id: userId,
      },
    });
  }, [userId]);

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable
          className="w-full items-center rounded-[32px] bg-white p-6"
          onPress={(e) => e.stopPropagation()}>
          {/* Nút đóng góc trên phải */}
          <View className="w-full flex-row justify-end">
            <TouchableOpacity onPress={onClose} className="rounded-full bg-gray-100 p-2">
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tiêu đề */}
          <Text className="mt-2 font-inter-bold text-xl text-primary-color-1">
            {t('agency.inviteKTVModal.title')}
          </Text>
          <Text className="mb-6 mt-2 px-4 text-center font-inter-medium text-gray-500">
            {t('agency.inviteKTVModal.description')}
          </Text>

          {/* QR Code Demo Area */}
          <View className="mb-8 rounded-3xl border-2 border-gray-50 bg-white p-4">
            <QRCode value={inviteLink} size={180} backgroundColor="white" color="#000" />
          </View>

          {/* Ô Input Copy Link */}
          <View className="mb-6 w-full">
            <Text className="mb-2 ml-1 font-inter-medium text-sm text-gray-400">
              {t('agency.inviteKTVModal.inviteIdLabel')}
            </Text>
            <View className="w-full flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-1">
              <TextInput
                className="h-12 flex-1 font-inter-regular text-gray-700"
                value={userId}
                editable={false}
                selectTextOnFocus={true}
              />
              <TouchableOpacity
                onPress={copyToClipboard}
                className="ml-2 rounded-xl bg-primary-color-2 p-2.5">
                {copied ? <Check size={18} color="white" /> : <Copy size={18} color="white" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Nút Hoàn tất */}
          <TouchableOpacity
            onPress={onClose}
            className="w-full items-center rounded-2xl bg-primary-color-2 py-4 active:opacity-80">
            <Text className="font-inter-bold text-base text-white">
              {t('agency.inviteKTVModal.doneButton')}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};;

export const AgencyListHeader = ({ onInvitePress, totalKtv }: AgencyListHeaderProps) => {
  const { t } = useTranslation();

  return (
    <View className="px-4 py-4">
      {/* Hàng 1: Tiêu đề và Nút mời */}
      <View className="flex-row items-center justify-between pb-5">
        <Text className="font-inter-bold text-base text-primary-color-1">
          {t('agency.technician_list_title')}
        </Text>
        {totalKtv !== 0 && (
          <TouchableOpacity
            onPress={onInvitePress}
            className="flex-row items-center rounded-lg bg-primary-color-2 px-4 py-2.5">
            <UserPlus size={18} color="white" />
            <Text className="ml-2 font-inter-semibold text-sm text-white">
              {t('agency.inviteKTV')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface AgencyEmptyStateProps {
  onInvitePress: () => void;
}

export const AgencyEmptyState = ({ onInvitePress }: AgencyEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <View className="mt-20 flex-1 items-center justify-center px-8">
      {/* Icon minh họa */}
      <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <ClipboardList size={48} color="#9ca3af" strokeWidth={1.5} />
        <View className="absolute bottom-0 right-0 rounded-full border-4 border-white bg-primary-color-2 p-1.5">
          <UserPlus size={16} color="white" />
        </View>
      </View>

      {/* Nội dung thông báo */}
      <Text className="text-center font-inter-bold text-xl text-primary-color-1">
        {t('agency.empty.empty_title')}
      </Text>

      <Text className="mb-8 mt-2 text-center font-inter-medium leading-5 text-gray-500">
        {t('agency.empty.empty_description')}
      </Text>

      {/* Nút hành động chính */}
      <TouchableOpacity
        onPress={onInvitePress}
        activeOpacity={0.8}
        className="w-full flex-row items-center justify-center rounded-2xl bg-primary-color-2 py-4 shadow-md">
        <UserPlus size={20} color="white" />
        <Text className="ml-2 font-inter-bold text-base text-white">
          {t('agency.empty.empty_button')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
