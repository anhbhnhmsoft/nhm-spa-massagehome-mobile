import React, { FC, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Ticket,
  Trash,
  Wallet,
  X,
  History,
} from 'lucide-react-native';
import DefaultColor from '@/components/styles/color';
import { useTranslation } from 'react-i18next';
import {
  useCreateInfoWithdraw,
  useRequestWithdraw,
  useWallet,
  useWithdrawInfo,
} from '@/features/payment/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Controller } from 'react-hook-form';
import SelectModal from '@/components/select-modal';
import { cn, formatBalance, formatCurrency } from '@/lib/utils';
import {

  _QUICK_WITHDRAW_AMOUNTS,
  _TransactionInType,
  _TransactionOutType,
  _TransactionStatusColor,
  _TransactionStatusMap,
  _TransactionTypeMap,
} from '@/features/payment/consts';
import { ModalToast } from '@/components/toast-manger-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import { ListTransactionItem } from '@/features/payment/types';
import { TFunction } from 'i18next';
import GradientBackground from '@/components/styles/gradient-background';
import dayjs from 'dayjs';
import { CouponUserItem } from '@/features/service/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {Text} from '@/components/ui/text'

// Modal Rút Tiền
type WithdrawModalProps = {
  isVisible: boolean;
  onClose: () => void;
};
export const WithdrawModal = ({ isVisible, onClose }: WithdrawModalProps) => {
  const { t } = useTranslation();
  // modal tạo thông tin rút tiền ngân hàng
  const [showModalCreateInfo, setShowModalCreateInfo] = useState<boolean>(false);

  // id thông tin rút tiền ngân hàng được chọn
  const [idChoose, setIdChoose] = useState<string>('');

  const { queryListInfoWithdraw, deleteWithdrawInfoItem, isDeleting } = useWithdrawInfo(
    isVisible,
    onClose
  );

  const insets = useSafeAreaInsets();

  return (
    <ModalToast
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      {/* Overlay: Bấm ra ngoài để đóng modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-end bg-black/50">
          {/* Modal Content Wrapper - Chặn sự kiện bấm xuyên qua */}
          <TouchableWithoutFeedback>
            <View className="w-full rounded-t-3xl bg-white shadow-2xl" style={{ height: '80%' }}>
              {/* Header Modal */}
              <View className="flex-row items-center justify-between border-b border-gray-100 p-5">
                <Text className="text-lg font-inter-bold text-gray-800">
                  {t('payment.withdraw.title_modal')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                  }}
                  className="rounded-full bg-gray-100 p-1.5">
                  <X size={20} color={DefaultColor.slate[600]} />
                </TouchableOpacity>
              </View>

              {/* Body: List */}
              <View className="flex-1 px-5 pt-4">
                <FlatList
                  data={queryListInfoWithdraw.data || []}
                  refreshControl={
                    <RefreshControl
                      refreshing={queryListInfoWithdraw.isRefetching}
                      onRefresh={() => queryListInfoWithdraw.refetch()}
                    />
                  }
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => {
                    const config = item.config;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        disabled={isDeleting}
                        onPress={() => {
                          setIdChoose(item.id);
                        }}
                        className="mb-3 flex-row items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <View className="flex-1 flex-row items-center gap-1">
                          {/* Icon */}
                          <View
                            className={`h-10 w-10 items-center justify-center rounded-full bg-primary-color-2`}>
                            <Wallet size={20} color="white" />
                          </View>

                          {/* Info */}
                          <View className="ml-3 flex-1">
                            <Text className="font-inter-bold text-base text-gray-800">
                              {config.bank_name}
                            </Text>
                            <Text className="text-xs text-gray-500" numberOfLines={1}>
                              {config.bank_account} - {config.bank_holder}
                            </Text>
                          </View>
                        </View>
                        {/* Delete Button */}
                        <TouchableOpacity
                          className={'p-1'}
                          onPress={(e) => {
                            e.stopPropagation();
                            deleteWithdrawInfoItem(item.id);
                          }}>
                          {isDeleting ? (
                            <ActivityIndicator size="small" color={DefaultColor.slate[400]} />
                          ) : (
                            <Trash size={20} color={DefaultColor.red[600]} />
                          )}
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  ListEmptyComponent={() => (
                    <View className="items-center justify-center pt-10">
                      <Text className="text-sm text-gray-400">
                        {t('payment.withdraw.no_account')}
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Footer: Thêm mới */}
              <View
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                className="border-t border-gray-100 p-5"
              >
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-xl bg-primary-color-2 py-3.5"
                  onPress={() => setShowModalCreateInfo(true)}>
                  <Plus size={22} color="white" />
                  <Text className="ml-2 text-base font-inter-bold text-white">
                    {t('payment.withdraw.add_new_account')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal Liên kết Ngân hàng */}
      <CreateInfoWithdrawModal
        isVisible={showModalCreateInfo}
        onClose={() => {
          setShowModalCreateInfo(false);
        }}
        onSuccess={() => {
          // Cập nhật lại danh sách thông tin rút tiền
          queryListInfoWithdraw.refetch();
          setShowModalCreateInfo(false);
        }}
      />

      {/* Modal Tạo Request Rút Tiền */}
      <CreateWithdrawTicketModal id={idChoose} setId={setIdChoose} />
    </ModalToast>
  );
};

// Modal Liên kết Ngân hàng
type CreateInfoWithdrawModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};
const CreateInfoWithdrawModal: FC<CreateInfoWithdrawModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  // Khởi tạo React Hook Form
  const { form, loading, optionSelectBank, submitCreateWithdrawInfo } = useCreateInfoWithdraw(
    isVisible,
    onClose,
    onSuccess
  );
  const insets = useSafeAreaInsets();

  // State quản lý dropdown chọn ngân hàng
  const [openSelectBank, setOpenSelectBank] = useState<boolean>(false);

  const { t } = useTranslation();

  const {
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  const bankName = watch('config.bank_name');

  return (
    <ModalToast
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => {
        reset();
        setOpenSelectBank(false);
        onClose();
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Overlay mờ, bấm vào để đóng */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 justify-end bg-black/50">
            {/* Nội dung Modal - Chặn sự kiện bấm xuyên qua */}
            <TouchableWithoutFeedback>
              <View className="h-[85%] w-full rounded-t-3xl bg-white shadow-2xl">
                {/* Header */}
                <View className="flex-row items-center justify-between border-b border-gray-100 p-5">
                  <Text className="text-xl font-inter-bold text-gray-800">
                    {t('payment.withdraw.add_new_account')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                    }}
                    className="rounded-full bg-gray-100 p-2">
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                {/* Form Body (Scrollable) */}
                <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                  {/* BANK BIN + BANK NAME */}
                  <Controller
                    name="config.bank_bin"
                    control={control}
                    render={({ field: { value } }) => (
                      <View className={'mb-4'}>
                        <Text className="mb-1.5 font-inter-medium text-gray-700">
                          {t('payment.bank')} <Text className="text-red-500">*</Text>
                        </Text>
                        <TouchableOpacity
                          onPress={() => setOpenSelectBank(true)}
                          className={cn(
                            'flex-row items-center rounded-xl border bg-gray-50 p-3.5',
                            errors.config?.bank_bin || errors.config?.bank_name
                              ? 'border-red-500'
                              : 'border-gray-200'
                          )}>
                          {bankName ? (
                            <Text className="font-inter-bold text-gray-900">{bankName}</Text>
                          ) : (
                            <Text className="text-gray-400">{t('payment.bank')}</Text>
                          )}

                          <View className="flex-1 items-end">
                            <Ionicons name="chevron-down" size={20} color="#666" />
                          </View>
                        </TouchableOpacity>
                        <SelectModal
                          isVisible={openSelectBank}
                          value={value}
                          onClose={() => setOpenSelectBank(false)}
                          onSelect={(item) => {
                            setValue('config.bank_bin', item.value as string);
                            setValue('config.bank_name', item.label);
                          }}
                          data={optionSelectBank}
                        />
                        {(errors.config?.bank_bin || errors.config?.bank_name) && (
                          <Text className="ml-1 mt-1 text-xs text-red-500">
                            {t('payment.error.bank_bin_or_name')}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* BANK ACCOUNT */}
                  <Controller
                    name="config.bank_account"
                    control={control}
                    render={({ field: { value, onBlur, onChange } }) => (
                      <View className="mb-4">
                        <Text className="mb-1.5 font-inter-medium text-gray-700">
                          {t('payment.bank_account')} <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          className={cn(
                            'rounded-xl border bg-gray-50 p-3.5 text-base text-gray-800',
                            errors.config?.bank_account
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 focus:border-[#2B7BBE]'
                          )}
                          placeholder={t('payment.bank_account')}
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.config?.bank_account && (
                          <Text className="ml-1 mt-1 text-xs text-red-500">
                            {errors.config.bank_account?.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />

                  {/* BANK HOLDER */}
                  <Controller
                    name="config.bank_holder"
                    control={control}
                    render={({ field: { value, onBlur, onChange } }) => (
                      <View className="mb-4">
                        <Text className="mb-1.5 font-inter-medium text-gray-700">
                          {t('payment.bank_holder')} <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          className={cn(
                            'rounded-xl border bg-gray-50 p-3.5 text-base text-gray-800',
                            errors.config?.bank_holder
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 focus:border-[#2B7BBE]'
                          )}
                          placeholder={t('payment.bank_holder')}
                          placeholderTextColor="#9CA3AF"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                        />
                        {errors.config?.bank_holder && (
                          <Text className="ml-1 mt-1 text-xs text-red-500">
                            {errors.config.bank_holder?.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                  <View className="h-10" />
                </ScrollView>
                {/* Footer: Submit Button */}
                <View
                  style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                  className="border-t border-gray-100 bg-white p-5"
                >
                  <TouchableOpacity
                    onPress={submitCreateWithdrawInfo}
                    disabled={loading}
                    className={cn(
                      'w-full flex-row items-center justify-center rounded-xl py-4',
                      loading ? 'bg-gray-400' : 'bg-primary-color-2'
                    )}>
                    {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                    <Text className="font-inter-bold text-lg text-white">
                      {loading ? t('common.loading') : t('payment.add_new_withdraw_info')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ModalToast>
  );
};

// Modal Tạo Thông tin Rút Tiền Ngân Hàng
type CreateWithdrawTicketModalProps = {
  id: string;
  setId: (id: string) => void;
};
const CreateWithdrawTicketModal = ({ id, setId }: CreateWithdrawTicketModalProps) => {
  const { t } = useTranslation();

  const { form, submitRequestWithdraw, loading, configPayment } = useRequestWithdraw(id, setId);

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedAmount = watch('amount');

  const insets = useSafeAreaInsets();

  // Tính toán số tiền rút thực tế và phí
  const withdrawCalculation = useMemo(() => {
    // Chuyển đổi và xử lý fallback để tránh lỗi NaN
    const amount = Number(watchedAmount || 0);
    const exchangeRate = Number(configPayment?.currency_exchange_rate || 1);
    const feePercent = Number(configPayment?.fee_withdraw_percentage || 0);

    //  Quy đổi Point sang tiền mặt (Gross)
    const grossAmount = amount * exchangeRate;

    // Tính số tiền phí dựa trên %
    const feeAmount = (grossAmount * feePercent) / 100;

    // Số tiền thực nhận sau khi trừ phí
    const withdrawMoney = Math.floor(grossAmount - feeAmount);

    return {
      feeAmount,
      exchangeRate,
      withdrawMoney,
      feePercent
    };
  }, [watchedAmount, configPayment?.currency_exchange_rate, configPayment?.fee_withdraw_percentage]);

  return (
    <ModalToast
      animationType="slide"
      transparent={true}
      visible={id !== ''}
      onRequestClose={() => {
        setId('');
      }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Overlay mờ, bấm vào để đóng */}
        <TouchableWithoutFeedback
          onPress={() => {
            setId('');
          }}>
          <View className="flex-1 justify-end bg-black/50">
            {/* Nội dung Modal - Chặn sự kiện bấm xuyên qua */}
            <TouchableWithoutFeedback>
              <View className="h-[90%] w-full rounded-t-3xl bg-white shadow-2xl">
                {/* Header */}
                <View className="flex-row items-center justify-between border-b border-gray-100 p-5">
                  <Text className="font-inter-bold text-xl text-gray-800">
                    {t('payment.withdraw.title_modal_request')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setId('');
                    }}
                    className="rounded-full bg-gray-100 p-2">
                    <Ionicons name="close" size={24} color={DefaultColor.gray[600]} />
                  </TouchableOpacity>
                </View>
                {/* Form Body (Scrollable) */}
                <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
                  {/* Nhập số tiền */}
                  <View className="mb-6">
                    <Text className="mb-2 font-inter-bold text-gray-700">
                      {t('payment.withdraw.enter_withdraw_money')}
                    </Text>
                    <View
                      className={`flex-row items-center border-b-2 py-2 ${errors.amount ? 'border-red-500' : 'border-primary-color-2'}`}>
                      <Text className="mr-2 font-inter-bold text-base text-gray-400">
                        {t('common.currency')}
                      </Text>
                      <Controller
                        control={control}
                        name="amount"
                        render={({ field: { onChange, value, onBlur } }) => (
                          <TextInput
                            className="flex-1 font-inter-bold text-3xl text-primary-color-2"
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={DefaultColor.gray[400]}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </View>
                    {errors.amount && (
                      <Text className="mt-1 text-xs text-red-500">{errors.amount.message}</Text>
                    )}

                    {/* Các nút chọn nhanh */}
                    <View className="mt-4 flex-row flex-wrap gap-2">
                      {_QUICK_WITHDRAW_AMOUNTS.map((item) => (
                        <TouchableOpacity
                          key={item}
                          onPress={() => setValue('amount', item.toString())}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                          <Text className="font-inter-medium text-xs text-gray-600">
                            {formatBalance(item)} {t('common.currency')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View className="mt-4 flex-row flex-wrap gap-2">
                      <Text className="font-inter-bold text-base text-primary-color-1">
                        {t('payment.withdraw.withdraw_fee')}: {formatBalance(Number(withdrawCalculation.feePercent))} %
                      </Text>
                    </View>
                  </View>

                  {/* Ghi chú */}
                  <View className="mb-8">
                    <Text className="mb-2 font-inter-bold text-gray-700">
                      {t('payment.withdraw.note')}
                    </Text>
                    <Controller
                      control={control}
                      name="note"
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          className="min-h-[100px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-base text-gray-800"
                          placeholder={t('payment.withdraw.placeholder_note')}
                          multiline
                          textAlignVertical="top"
                          value={value}
                          onChangeText={onChange}
                        />
                      )}
                    />
                  </View>
                </ScrollView>

                {/* Footer Submit */}
                <View
                  style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                  className="border-t border-gray-100 bg-white p-5"
                >
                  <View className="mb-2 flex-row justify-between items-center">
                    <Text className="text-sm text-gray-500">{t('payment.withdraw.total_withdraw')}:</Text>
                    <View className="flex-row items-center justify-center gap-2">
                      <Text className="font-inter-bold text-lg text-gray-900">
                        {withdrawCalculation.withdrawMoney ? formatBalance(withdrawCalculation.withdrawMoney) : '0'} {t('common.currency')}
                      </Text>
                    </View>

                  </View>
                  <TouchableOpacity
                    onPress={submitRequestWithdraw}
                    disabled={loading}
                    className={cn(
                      'w-full flex-row items-center justify-center rounded-xl py-4',
                      loading ? 'bg-gray-300' : 'bg-primary-color-2'
                    )}>
                    {loading && <ActivityIndicator size="small" color="white" className="mr-2" />}
                    <Text className="font-inter-bold text-lg text-white">
                      {loading ? t('common.loading') : t('payment.request_withdraw')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ModalToast>
  );
};


// Header Wallet
type HeaderWalletProps = {
  queryWallet: ReturnType<typeof useWallet>['queryWallet'];
  setTab?: ReturnType<typeof useWallet>['setTab'];
  tab?: ReturnType<typeof useWallet>['tab'];
  t: TFunction;
  goToDepositScreen: ReturnType<typeof useWallet>['goToDepositScreen'];
  setVisibleWithdraw: (visibleWithdraw: boolean) => void;
};

export const HeaderWallet = ({
                        queryWallet,
                        setTab,
                        tab,
                        t,
                        goToDepositScreen,
                        setVisibleWithdraw,
                      }: HeaderWalletProps) => {


  return (
    <View>
      {/* HEADER WALLET */}
      <GradientBackground
        style={{
          padding: 20,
          borderRadius: 16,
        }}
        direction={'vertical'}>
        {/* BALANCE */}
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="mb-1 text-sm text-white">{t('wallet.balance')}</Text>
            {queryWallet.isLoading || queryWallet.isRefetching ? (
              <Skeleton className="h-8 w-[180px]" />
            ) : (
              <View>
                <View className="flex-row items-end gap-1">
                  <Text className="font-inter-bold text-3xl text-white">
                    {formatBalance(queryWallet.data?.balance || 0)}
                  </Text>
                  <Text className="font-inter-bold text-sm text-white">{t('common.currency')}</Text>
                </View>
                {queryWallet.data?.frozen_balance && Number(queryWallet.data?.frozen_balance) > 0 && (
                  <View className="flex-row items-end gap-1 mt-2">
                    <Text className="text-xs text-slate-100 font-inter-italic">
                      {t('wallet.frozen_balance')}: {formatBalance(queryWallet.data?.frozen_balance || 0)} {t('common.currency')}
                  </Text>
                </View>)}
              </View>
            )}
          </View>
        </View>
        {/* TOTAL EARNINGS & WITHDRAWN */}
        <View className="mt-4 flex-row justify-between border-t border-white pt-4">
          <View className="flex-wrap items-start">
            {/* TOTAL EARNINGS */}
            <Text className="text-xs text-teal-100">{t('wallet.total_earnings')}</Text>
            {queryWallet.isLoading || queryWallet.isRefetching ? (
              <Skeleton className="h-8 w-2/3" />
            ) : (
              <Text className="mt-0.5 font-inter-bold text-sm text-white">
                {formatBalance(queryWallet.data?.total_deposit || 0)} {t('common.currency')}
              </Text>
            )}
          </View>

          <View className={'flex-wrap items-end'}>
            <Text className="text-xs text-teal-100">{t('wallet.total_withdrawn')}</Text>
            {queryWallet.isLoading || queryWallet.isRefetching ? (
              <Skeleton className="h-8 w-2/3" />
            ) : (
              <Text className="mt-0.5 font-inter-bold text-sm text-white">
                {formatBalance(queryWallet.data?.total_withdrawal || 0)} {t('common.currency')}
              </Text>
            )}
          </View>
        </View>
        {/* Nạp Tiền & Rút Tiền */}
        <View className="mt-4 flex-row items-center gap-2">
          {/* Nạp Tiền */}
          <TouchableOpacity
            className="flex-1 rounded-xl bg-white/30 px-4 py-2"
            onPress={() => goToDepositScreen()}>
            <Text className="text-center font-inter-bold text-white">{t('wallet.deposit')}</Text>
          </TouchableOpacity>
          {/* Rút Tiền */}
          <TouchableOpacity
            className="flex-1 rounded-xl bg-white/30 px-4 py-2"
            onPress={() => setVisibleWithdraw(true)}>
            <Text className="text-center font-inter-bold text-white">{t('wallet.withdraw')}</Text>
          </TouchableOpacity>
        </View>
      </GradientBackground>

      {/* TRANSACTION & COUPON */}
      {setTab && tab && (
        <View className="mt-4 flex-row gap-2 p-2">
          <TouchableOpacity
            onPress={() => setTab('transaction')}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-2 rounded-xl p-2',
              tab === 'transaction' ? 'bg-primary-color-2' : 'bg-slate-200'
            )}>
            <Icon
              as={History}
              size={18}
              className={cn(tab === 'transaction' ? 'text-white' : 'text-slate-500')}
            />
            <Text
              className={cn(
                'font-inter-bold text-sm',
                tab === 'transaction' ? 'text-white' : 'text-slate-500'
              )}>
              {t('wallet.transactions')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTab('coupon')}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-2 rounded-xl p-2',
              tab === 'coupon' ? 'bg-primary-color-2' : 'bg-slate-200'
            )}>
            <View className="flex-row items-center gap-2">
              <Icon
                as={Ticket}
                size={18}
                className={cn(tab === 'coupon' ? 'text-white' : 'text-slate-500')}
              />
              <Text
                className={cn(
                  'font-inter-bold text-sm',
                  tab === 'coupon' ? 'text-white' : 'text-slate-500'
                )}>
                {t('wallet.coupons')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Transaction Item
export const TransactionItem = ({ item }: { item: ListTransactionItem }) => {
  const { t } = useTranslation();

  return (
    <View className="shadow-xs flex-row items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
      {/* Left: Icon & Title */}
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full',
            _TransactionInType.includes(item.type) && 'bg-green-200',
            _TransactionOutType.includes(item.type) && 'bg-red-200'
          )}>
          {_TransactionInType.includes(item.type) && (
            <Icon as={ArrowDownLeft} size={20} className="text-green-600" />
          )}
          {_TransactionOutType.includes(item.type) && (
            <Icon as={ArrowUpRight} size={20} className="text-red-600" />
          )}
        </View>
        <View className="flex-1 pr-2">
          <Text className="mb-1 font-inter-medium text-sm text-gray-900" numberOfLines={2}>
            {t(_TransactionTypeMap[item.type])}
          </Text>
          <Text className="font-inter-bold text-base text-gray-900">
            {formatBalance(item.point_amount)} {t('common.currency')}
          </Text>
        </View>
      </View>

      {/* Right: Status & Time */}
      <View className="items-end">
        <Text
          style={{ color: _TransactionStatusColor[item.status] }}
          className={'mb-1 font-inter-medium text-sm'}>
          {t(_TransactionStatusMap[item.status])}
        </Text>
        <Text className="text-[10px] text-gray-400">
          {dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      </View>
    </View>
  );
};

// Coupon Item
export const CouponItem = ({ item }: { item: CouponUserItem }) => {
  const { t } = useTranslation();

  const discountDisplay = item.coupon.is_percentage
    ? `${Number(item.coupon.discount_value)}%`
    : formatCurrency(item.coupon.discount_value);

  return (
    <View className="flex-row overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <View className="w-24 items-center justify-center border-r border-dashed border-white bg-primary-color-2 p-2">
        <Text className="font-inter-extrabold text-xl text-white">{discountDisplay}</Text>
        <Text className="mt-1 text-center text-xs text-teal-100">{t('common.discount')}</Text>
      </View>

      {/* Right Side: Info */}
      <View className="flex-1 justify-between p-3">
        <View>
          <Text className="font-inter-bold text-sm text-slate-700" numberOfLines={2}>
            {item.coupon.label}
          </Text>
        </View>
        <View className="mt-2 flex-row items-end justify-between">
          <Text className="rounded bg-blue-100 px-2 py-0.5 font-inter-medium text-xs text-primary-color-1">
            {item.coupon.code}
          </Text>
        </View>
      </View>
    </View>
  );
};