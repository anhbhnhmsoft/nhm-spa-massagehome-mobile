import { useTranslation } from 'react-i18next';
import { useCheckPaymentQRCode, useDeposit } from '@/features/payment/hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { Controller } from 'react-hook-form';
import { cn, formatBalance, generateQRCodeImageUrl } from '@/lib/utils';
import { _PAYMENT_METHODS, _PaymentType, _QUICK_AMOUNTS } from '@/features/payment/consts';
import {
  CheckCircle2,
  Circle,
  CircleDollarSign,
  Copy,
  Download,
  QrCode,
  X,
} from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import React, { useEffect, useMemo, useState } from 'react';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import useSaveFileImage from '@/features/app/hooks/use-save-image';
import { _UserRole } from '@/features/auth/const';
import { QRWechatData } from '@/features/payment/types';
import { useWalletStore } from '@/features/payment/stores';

// --- KHỐI NẠP TIẾN ---
export default function Deposit({ useFor }: { useFor: _UserRole }) {
  const { t } = useTranslation();

  // giá đổi tiền giữa VND và CNY (nếu chọn nạp qua Wechat)
  const [exchangePriceCny, setExchangePriceCny] = useState<number>(0);

  const { configPayment, form, submitDeposit, visibleModalWechat, handleCloseWechat } =
    useDeposit();


  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  // Watch giá trị để update giao diện (đổi màu border, tính point...)
  const watchedAmount = watch('amount');
  const watchedPayment = watch('payment_type');

  useEffect(() => {
    if (configPayment?.exchange_rate_vnd_cny && watchedPayment === _PaymentType.WECHAT_PAY) {
      const priceCny = Number(watchedAmount) / Number(configPayment?.exchange_rate_vnd_cny);
      setExchangePriceCny(priceCny);
    }else{
      setExchangePriceCny(0);
    }
  }, [watchedAmount, watchedPayment]);

  // Logic tính toán quy đổi
  // const receivedPoints = Math.floor(
  //   Number(watchedAmount) / Number(configPayment?.currency_exchange_rate)
  // );

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        {/* --- HEADER --- */}
        <HeaderBack title={'payment.deposit_title'} />

        {/* --- SCROLL VIEW --- */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          enableOnAndroid={true}
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-5 pt-2">
            {/* --- KHỐI NHẬP TIỀN  --- */}
            <View className="z-10 mb-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <Text className="mb-3 font-inter-medium text-gray-500">
                {t('payment.deposit_label_input')}
              </Text>
              <View className={'mb-4'}>
                <View className="flex-row items-center border-b border-gray-100 pb-2">
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value } }) => (
                      <View
                        className={cn(
                          'flex-row items-center border-b pb-2',
                          errors.amount ? 'border-red-500' : 'border-gray-200'
                        )}>
                        <TextInput
                          className="flex-1 font-inter-bold text-3xl text-gray-900"
                          placeholder="0"
                          keyboardType="numeric"
                          value={value}
                          onChangeText={onChange}
                        />
                        <Text className="font-inter-bold text-xl text-gray-400">đ</Text>
                      </View>
                    )}
                  />
                  {/* Hiển thị lỗi Amount */}
                </View>
                {errors.amount && (
                  <Text className="mt-2 text-xs text-red-500">{errors.amount.message}</Text>
                )}
              </View>

              {/* --- NÚT NHẬP SỐ TIỀN CÓ SẴN --- */}
              <View className="flex-row flex-wrap gap-2">
                {_QUICK_AMOUNTS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setValue('amount', item.toString())}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                    <Text className="font-inter-medium text-xs text-gray-600">
                      {formatBalance(item)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Hiển thị giá đổi tiền CNY */}
              {watchedPayment === _PaymentType.WECHAT_PAY && (
                <Text className="mt-2 text-xs text-gray-500">
                  {t('payment.exchange_rate_wechat_pay', {
                    priceCny: formatBalance(exchangePriceCny),
                  })}
                </Text>
              )}
            </View>
            {/* --- 3. PHƯƠNG THỨC THANH TOÁN --- */}
            <Text className="mb-4 font-inter-bold text-lg text-gray-900">
              {t('payment.payment_methods')}
            </Text>
            <Controller
              control={control}
              name="payment_type"
              render={({ field: { onChange, value } }) => (
                <View className="mb-24 gap-3">
                  {_PAYMENT_METHODS.map((method, index) => {
                    const isSelected = value === method.id;
                    let disabled: boolean = false;
                    if (method.id === _PaymentType.QR_BANKING) {
                      disabled = !configPayment?.allow_payment?.qrcode;
                    } else if (method.id === _PaymentType.ZALO_PAY) {
                      disabled = !configPayment?.allow_payment?.zalopay;
                    } else if (method.id === _PaymentType.WECHAT_PAY) {
                      disabled = !configPayment?.allow_payment?.wechatpay;
                    }
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => onChange(method.id)}
                        activeOpacity={0.7}
                        disabled={disabled}
                        style={[
                          styles.methodContainer,
                          isSelected ? styles.methodSelected : styles.methodUnselected,
                          disabled ? styles.methodDisabled : {},
                        ]}>
                        {disabled && (
                          <View className="absolute bottom-0 left-0 right-0 top-0 z-10 flex-1 items-center justify-center rounded-xl bg-black/40">
                            <View className="rounded-2xl bg-white px-2 py-1">
                              <Text className="font-inter-bold text-xs text-red-500">
                                {t('payment.method_disabled')}
                              </Text>
                            </View>
                          </View>
                        )}
                        {/* ICON AREA */}
                        <View
                          style={[
                            styles.iconContainer,
                            isSelected ? styles.iconBgSelected : styles.iconBgUnselected,
                          ]}>
                          {method.id === _PaymentType.QR_BANKING && (
                            <QrCode
                              size={24}
                              color={isSelected ? 'white' : DefaultColor.gray['400']}
                            />
                          )}
                          {method.id === _PaymentType.ZALO_PAY && (
                            <Image
                              source={require('@/assets/icon/zalopay.jpeg')}
                              style={{ width: 24, height: 24, borderRadius: 12 }}
                            />
                          )}
                          {method.id === _PaymentType.WECHAT_PAY && (
                            <Image
                              source={require('@/assets/icon/wechat.png')}
                              style={{ width: 24, height: 24, borderRadius: 12 }}
                            />
                          )}
                        </View>

                        {/* TEXT AREA */}
                        <View style={styles.textContainer}>
                          <View style={styles.row}>
                            <Text
                              style={[
                                styles.methodTitle,
                                isSelected ? styles.textSelected : styles.textUnselected,
                              ]}>
                              {t(method.name)}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.methodDesc,
                              isSelected
                                ? { color: DefaultColor.gray['100'] }
                                : { color: DefaultColor.gray['500'] },
                            ]}>
                            {t(method.desc)}
                          </Text>
                        </View>

                        {/* CHECKBOX AREA */}
                        {isSelected ? (
                          <CheckCircle2 size={22} color={DefaultColor.base['primary-color-1']} />
                        ) : (
                          <Circle size={22} color={DefaultColor.gray['300']} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                  {errors.payment_type && (
                    <Text className="mt-2 text-red-500">{errors.payment_type.message}</Text>
                  )}
                </View>
              )}
            />
          </View>
        </KeyboardAwareScrollView>

        {/* --- BOTTOM BUTTON --- */}
        <View className="absolute bottom-0 w-full border-t border-gray-100 bg-white p-5 shadow-lg">
          <View className="mb-2 flex-row justify-between items-center">
            <Text className="text-sm text-gray-500">{t('payment.total_payment')}:</Text>
            <View className="flex-row items-center justify-center gap-2">
              {watchedPayment === _PaymentType.WECHAT_PAY && (
                <Text className="mt-2 text-xs text-gray-500">
                  ({formatBalance(exchangePriceCny)} CNY)
                </Text>
              )}
              <Text className="font-inter-bold text-lg text-gray-900">
                {watchedAmount ? formatBalance(watchedAmount) : '0'} {t('common.currency')}
              </Text>
            </View>

          </View>
          <TouchableOpacity
            className={`items-center justify-center rounded-full py-4 ${
              watchedAmount && Number(watchedAmount) > 0 && watchedPayment
                ? 'bg-primary-color-2'
                : 'bg-gray-300'
            }`}
            onPress={handleSubmit(submitDeposit)}
            disabled={!watchedAmount || Number(watchedAmount) <= 0 || !watchedPayment}>
            <Text className="font-inter-bold text-base text-white">
              {t('payment.confirm_payment')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* --- QR PAYMENT MODAL --- */}
      <CheckQRPaymentModal useFor={useFor} />

      <WeChatPaymentModal visible={visibleModalWechat} onClose={handleCloseWechat} />
    </>
  );
}
const styles = StyleSheet.create({
  // Container tổng của từng dòng phương thức
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    padding: 16, // p-4
    backgroundColor: DefaultColor.white,
    marginBottom: 12, // gap-3 (khoảng cách giữa các item)
  },
  // Trạng thái được chọn
  methodSelected: {
    borderColor: DefaultColor.base['primary-color-1'],
    backgroundColor: DefaultColor.base['primary-color-2'],
  },
  // Trạng thái không chọn (có shadow nhẹ)
  methodUnselected: {
    borderColor: DefaultColor.white,
    // Shadow-sm implementation
    ...Platform.select({
      ios: {
        shadowColor: DefaultColor.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  methodDisabled: {
    backgroundColor: DefaultColor.gray['200'],
  },

  // Vùng chứa Icon (tròn tròn bên trái)
  iconContainer: {
    marginRight: 12, // mr-3
    height: 40, // h-10
    width: 40, // w-10
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999, // rounded-full
  },
  iconBgSelected: {
    backgroundColor: DefaultColor.base['primary-color-1'],
  },
  iconBgUnselected: {
    backgroundColor: DefaultColor.gray['200'],
  },

  // Phần text ở giữa
  textContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold', // font-inter-bold
    fontWeight: '700', // Fallback nếu font chưa load
  },
  textSelected: {
    color: DefaultColor.gray['100'],
  },
  textUnselected: {
    color: DefaultColor.gray['900'],
  },
  methodDesc: {
    marginTop: 2, // mt-0.5
    fontSize: 12, // text-xs
  },
});

// --- QR PAYMENT MODAL ---
const CheckQRPaymentModal = ({ useFor }: { useFor: _UserRole }) => {
  const { t } = useTranslation();
  const { visible, closeModal, qrBankData } = useCheckPaymentQRCode(useFor);
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
      onRequestClose={() => closeModal()}>
      <View className="flex-1 justify-end bg-black/50">
        {qrBankData && (
          <View className="max-h-[90%] w-full overflow-hidden rounded-t-[24px] bg-white shadow-2xl">
            {/* HEADER (Giữ cố định, không cuộn) */}
            <View className="z-10 flex-row items-center justify-between border-b border-gray-100 bg-white p-5">
              <Text className="font-inter-bold text-lg text-gray-900">
                {t('payment.payment_qr_title')}
              </Text>
              <TouchableOpacity
                onPress={() => closeModal()}
                className="rounded-full bg-gray-100 p-1">
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }} // Thêm padding bottom để tránh bị sát đáy
            >
              {/* QR CODE IMAGE SECTION */}
              <View className="mb-6 items-center">
                <View className="relative items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <Image
                    source={{ uri: QRCodeImageUrl }}
                    style={{ width: 180, height: 180 }}
                    resizeMode="contain"
                  />
                </View>

                {/* ACTION BUTTONS */}
                <View className="mt-4 flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => saveURLImage(QRCodeImageUrl)}
                    className="flex-row items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
                    <Download size={18} color="#374151" />
                    <Text className="font-inter-medium text-xs text-gray-700">
                      {t('common.save_image')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text className="mt-3 text-center text-sm text-gray-500">
                  {t('payment.scan_qr_in_bank_app')}
                </Text>
              </View>

              {/* TRANSACTION DETAILS */}
              <View className="mb-6 space-y-4 rounded-xl bg-gray-50 p-4">
                {/* Ngân hàng */}
                <View className="flex-row items-center justify-between border-b border-gray-200 pb-3">
                  <View>
                    <Text className="mb-1 text-xs text-gray-500">{t('payment.bank_name')}</Text>
                    <Text className="font-inter-bold text-base text-gray-900">
                      {qrBankData.bank_name}
                    </Text>
                  </View>
                </View>

                {/* Tên chủ TK */}
                <View className="mt-3 flex-row items-center justify-between border-b border-gray-200 pb-3">
                  <View className="flex-1 pr-2">
                    <Text className="mb-1 text-xs text-gray-500">{t('payment.account_name')}</Text>
                    <Text className="font-inter-bold text-base text-gray-900">
                      {qrBankData.account_name}
                    </Text>
                  </View>
                </View>

                {/* Số tài khoản */}
                <View className="mt-3 flex-row items-center justify-between border-b border-gray-200 pb-3">
                  <View>
                    <Text className="mb-1 text-xs text-gray-500">
                      {t('payment.account_number')}
                    </Text>
                    <Text className="font-inter-bold text-base text-gray-900">
                      {qrBankData.account_number}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(qrBankData.account_number)}>
                    <Copy size={20} color="#2B7BBE" />
                  </TouchableOpacity>
                </View>

                {/* Số tiền */}
                <View className="mt-3 flex-row items-center justify-between border-b border-gray-200 pb-3">
                  <View>
                    <Text className="mb-1 text-xs text-gray-500">{t('payment.total_payment')}</Text>
                    <Text className="font-inter-bold text-lg text-[#2B7BBE]">
                      {formatBalance(qrBankData.amount)} đ
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(qrBankData.amount.toString())}>
                    <Copy size={20} color="#2B7BBE" />
                  </TouchableOpacity>
                </View>

                {/* Nội dung */}
                <View className="mt-3 flex-row items-center justify-between">
                  <View className="flex-1 pr-4">
                    <Text className="mb-1 text-xs text-gray-500">
                      {t('payment.description_qr_bank')}
                    </Text>
                    <Text className="mb-1 font-inter-bold text-base text-red-600">
                      {qrBankData.description}
                    </Text>
                    <Text className="text-[10px] italic text-red-500">
                      {t('payment.description_qr_bank_note')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => copyToClipboard(qrBankData.description)}>
                    <Copy size={20} color="#2B7BBE" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* STATUS LOADING */}
              <View className="mb-6 flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#2B7BBE" />
                <Text className="font-inter-medium text-[#2B7BBE]">
                  {t('payment.waiting_payment')}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

// QR Wechat

interface WeChatPaymentModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WeChatPaymentModal = ({ visible, onClose }: WeChatPaymentModalProps) => {
  const { t } = useTranslation();
  const qrWechatData = useWalletStore((state) => state.qrWechatData);
  const copyToClipboard = useCopyClipboard();
  const { saveURLImage } = useSaveFileImage();

  if (!qrWechatData) return null;

  const { qr_image, amount, description, amount_cny } = qrWechatData as QRWechatData;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="max-h-[85%] w-full rounded-t-[32px] bg-white shadow-2xl">
          {/* --- HEADER --- */}
          <View className="flex-row items-center justify-between border-b border-gray-100 p-6">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#07C160]">
                <Image
                  source={require('@/assets/icon/wechat.png')}
                  style={{ width: 20, height: 20, tintColor: 'white' }}
                />
              </View>
              <Text className="font-inter-bold text-xl text-gray-900">WeChat Pay</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-gray-100 p-2">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
            {/* --- QR CODE SECTION --- */}
            <View className="items-center">
              <View className="mb-4 rounded-3xl border-4 border-[#07C160]/10 bg-white p-4">
                <View className="rounded-2xl border border-gray-100 bg-white p-2">
                  <Image
                    source={{ uri: qr_image }}
                    style={{ width: 220, height: 220 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => saveURLImage(qr_image)}
                className="flex-row items-center gap-2 rounded-full bg-[#07C160]/10 px-6 py-2.5">
                <Download size={18} color="#07C160" />
                <Text className="font-inter-bold text-sm text-[#07C160]">
                  {t('common.save_qr_code')}
                </Text>
              </TouchableOpacity>

              <Text className="mt-4 px-10 text-center text-sm text-gray-500">
                {t('payment.wechat_scan_instruction')}
              </Text>
            </View>

            {/* --- DETAILS SECTION --- */}
            <View className="mt-8 space-y-4 rounded-2xl bg-gray-50 p-5">
              {/* Số tiền */}
              <View className="flex-row items-center justify-between border-b border-gray-200 pb-4">
                <View>
                  <Text className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                    {t('payment.amount')}
                  </Text>
                  <Text className="font-inter-bold text-2xl mb-2 text-gray-900">
                    {formatBalance(amount_cny)} <Text className="font-inter-medium text-sm"> CNY</Text>
                  </Text>
                  <Text className="font-inter-bold text-sm text-slate-500">
                    {formatBalance(amount)} {t('common.currency')}
                  </Text>
                </View>
                <CircleDollarSign size={28} color="#07C160" />
              </View>

              {/* Nội dung chuyển khoản */}
              <View className="pt-2">
                <Text className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                  {t('payment.transfer_note')}
                </Text>
                <View className="flex-row items-center justify-between rounded-xl border border-dashed border-gray-300 bg-white p-3">
                  <Text className="mr-2 flex-1 font-inter-bold text-sm text-red-600">
                    {description}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(description)}
                    className="rounded-lg bg-gray-100 p-2">
                    <Copy size={18} color="#374151" />
                  </TouchableOpacity>
                </View>
                <Text className="mt-2 text-[11px] italic text-red-400">
                  * {t('payment.note_important')}
                </Text>
              </View>
            </View>

            {/* --- WAITING STATUS --- */}
            <View className="mt-8 flex-row items-center justify-center gap-3 py-4">
              <Text className="font-inter-medium text-gray-600">
                {t('payment.processing_transaction')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
