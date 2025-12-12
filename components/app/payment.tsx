import { Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView // 1. Import ScrollView
} from 'react-native';
import { X, Copy, Download } from 'lucide-react-native';
import { formatBalance, generateQRCodeImageUrl } from '@/lib/utils';
import { useCheckPaymentQRCode } from '@/features/payment/hooks';
import useSaveFileImage from '@/features/app/hooks/use-save-image';
import { useMemo } from 'react';

export const CheckQRPaymentModal = () => {
  const { t } = useTranslation();
  const { visible, closeModal, qrBankData } = useCheckPaymentQRCode();
  const copyToClipboard = useCopyClipboard();
  const { saveURLImage } = useSaveFileImage();

  const QRCodeImageUrl = useMemo(() => {
    if (!qrBankData) return '';
    return generateQRCodeImageUrl({
      bin: qrBankData.bin,
      numberCode: qrBankData.account_number,
      name: qrBankData.account_name,
      money: qrBankData.amount.toString(),
      desc: qrBankData.description,
    });
  }, [qrBankData]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => closeModal()}
    >
      <View className="flex-1 justify-end bg-black/50">
        {qrBankData && (
          <View className="w-full max-h-[90%] bg-white rounded-t-[24px] shadow-2xl overflow-hidden">
            {/* HEADER (Giữ cố định, không cuộn) */}
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
              <Text className="text-lg font-inter-bold text-gray-900">
                {t('payment.payment_qr_title')}
              </Text>
              <TouchableOpacity onPress={() => closeModal()} className="p-1 bg-gray-100 rounded-full">
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }} // Thêm padding bottom để tránh bị sát đáy
            >
              {/* QR CODE IMAGE SECTION */}
              <View className="items-center mb-6">
                <View className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm items-center justify-center relative">
                  <Image
                    source={{ uri: QRCodeImageUrl }}
                    style={{ width: 180, height: 180 }}
                    resizeMode="contain"
                  />
                </View>

                {/* ACTION BUTTONS */}
                <View className="flex-row gap-4 mt-4">
                  <TouchableOpacity
                    onPress={() => saveURLImage(QRCodeImageUrl)}
                    className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-full"
                  >
                    <Download size={18} color="#374151" />
                    <Text className="text-xs font-inter-medium text-gray-700">{t('common.save_image')}</Text>
                  </TouchableOpacity>
                </View>

                <Text className="mt-3 text-sm text-gray-500 text-center">
                  {t('payment.scan_qr_in_bank_app')}
                </Text>
              </View>

              {/* TRANSACTION DETAILS */}
              <View className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
                {/* Ngân hàng */}
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3">
                  <View>
                    <Text className="text-xs text-gray-500 mb-1">{t('payment.bank_name')}</Text>
                    <Text className="text-base font-inter-bold text-gray-900">{qrBankData.bank_name}</Text>
                  </View>
                </View>

                {/* Tên chủ TK */}
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mt-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs text-gray-500 mb-1">{t('payment.account_name')}</Text>
                    <Text className="text-base font-inter-bold text-gray-900">{qrBankData.account_name}</Text>
                  </View>
                </View>

                {/* Số tài khoản */}
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mt-3">
                  <View>
                    <Text className="text-xs text-gray-500 mb-1">{t('payment.account_number')}</Text>
                    <Text className="text-base font-inter-bold text-gray-900">{qrBankData.account_number}</Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(qrBankData.account_number)}>
                    <Copy size={20} color="#2B7BBE" />
                  </TouchableOpacity>
                </View>

                {/* Số tiền */}
                <View className="flex-row justify-between items-center border-b border-gray-200 pb-3 mt-3">
                  <View>
                    <Text className="text-xs text-gray-500 mb-1">{t('payment.total_payment')}</Text>
                    <Text className="text-lg font-inter-bold text-[#2B7BBE]">
                      {formatBalance(qrBankData.amount)} đ
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(qrBankData.amount.toString())}>
                    <Copy size={20} color="#2B7BBE" />
                  </TouchableOpacity>
                </View>

                {/* Nội dung */}
                <View className="flex-row justify-between items-center mt-3">
                  <View className="flex-1 pr-4">
                    <Text className="text-xs text-gray-500 mb-1">{t('payment.description_qr_bank')}</Text>
                    <Text className="text-base font-inter-bold text-red-600 mb-1">
                      {qrBankData.description}
                    </Text>
                    <Text className="text-[10px] text-red-500 italic">
                      {t('payment.description_qr_bank_note')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(qrBankData.description)}>
                    <Copy size={20} color="#2B7BBE" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* STATUS LOADING */}
              <View className="flex-row justify-center items-center mb-6 gap-2">
                <ActivityIndicator size="small" color="#2B7BBE" />
                <Text className="text-[#2B7BBE] font-inter-medium">{t('payment.waiting_payment')}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};