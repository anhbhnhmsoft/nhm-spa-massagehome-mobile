import FocusAwareStatusBar from '@/components/focus-aware-status-bar';
import HeaderBack from '@/components/header-back';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';
import { _UserRole } from '@/features/auth/const';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import useSaveFileImage from '@/features/app/hooks/use-save-image';
import { useTransactionStatusScreen } from '@/features/payment/hooks';
import {
  _TransactionStatus,
  _TransactionStatusColor,
  _TransactionStatusMap,
  _TransactionTypeMap,
} from '@/features/payment/consts';
import { cn, formatBalance, generateQRCodeImageUrl } from '@/lib/utils';
import dayjs from 'dayjs';
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Download,
  ReceiptText,
  ShieldAlert,
  XCircle,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';

const statusIconMap = {
  [_TransactionStatus.PENDING]: ShieldAlert,
  [_TransactionStatus.COMPLETED]: CheckCircle2,
  [_TransactionStatus.FAILED]: XCircle,
  [_TransactionStatus.CANCELLED]: XCircle,
  [_TransactionStatus.REFUNDED]: CircleDollarSign,
};

const statusCardClassMap = {
  [_TransactionStatus.PENDING]: 'bg-yellow-50 border-yellow-200',
  [_TransactionStatus.COMPLETED]: 'bg-green-50 border-green-200',
  [_TransactionStatus.FAILED]: 'bg-red-50 border-red-200',
  [_TransactionStatus.CANCELLED]: 'bg-slate-100 border-slate-200',
  [_TransactionStatus.REFUNDED]: 'bg-blue-50 border-blue-200',
} as const;

const DetailRow = ({
  label,
  value,
  onCopy,
  valueClassName,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  valueClassName?: string;
}) => {
  return (
    <View className="flex-row items-start justify-between gap-2 border-b border-slate-100 py-2">
      <View className="flex-1">
        <Text className="text-[11px] text-slate-500">{label}</Text>
        <Text
          className={cn('mt-0.5 font-inter-semibold text-[13px] text-slate-900', valueClassName)}>
          {value}
        </Text>
      </View>
      {onCopy ? (
        <TouchableOpacity onPress={onCopy} className="rounded-full bg-slate-100 p-1.5">
          <Copy size={14} color={DefaultColor.slate[600]} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const PaymentImageCard = ({ uri, onSave }: { uri: string; onSave: () => void }) => {
  const { t } = useTranslation();
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    if (!uri) {
      setLoadingImage(false);
      return;
    }

    setLoadingImage(true);

    let active = true;
    const fallbackTimer = setTimeout(() => {
      if (active) {
        setLoadingImage(false);
      }
    }, 4000);

    Image.prefetch(uri)
      .catch(() => null)
      .finally(() => {
        if (active) {
          setLoadingImage(false);
        }
      });

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, [uri]);

  if (!uri) {
    return null;
  }

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <View className="items-center">
        <View className="relative rounded-xl border border-slate-100 bg-white p-2">
          <Image
            key={uri}
            source={{ uri }}
            style={{ width: 176, height: 176 }}
            resizeMode="contain"
            onLoadStart={() => setLoadingImage(true)}
            onLoad={() => setLoadingImage(false)}
            onLoadEnd={() => setLoadingImage(false)}
            onError={() => setLoadingImage(false)}
          />
          {loadingImage ? (
            <View className="absolute inset-0 items-center justify-center rounded-xl bg-white/80">
              <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
              <Text className="mt-2 text-xs text-slate-500">{t('common.loading_data')}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={onSave}
          className="mt-3 flex-row items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2">
          <Download size={16} color={DefaultColor.slate[700]} />
          <Text className="font-inter-bold text-xs text-slate-700">{t('common.save_qr_code')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function TransactionStatus({ useFor }: { useFor: _UserRole }) {
  const { t } = useTranslation();
  const copyToClipboard = useCopyClipboard();
  const { saveURLImage } = useSaveFileImage();
  const { transactionId, transactionDetailQuery } = useTransactionStatusScreen(useFor);

  const detail = transactionDetailQuery.data?.data;
  const StatusIcon = detail ? statusIconMap[detail.status] : ShieldAlert;

  const qrBankImageUrl = useMemo(() => {
    if (detail?.detail_kind !== 'deposit_qr' || !detail.payment_data) {
      return '';
    }
    const qrData = detail.payment_data as {
      bin: string;
      account_number: string;
      account_name: string;
      amount: number;
      description: string;
    };

    return generateQRCodeImageUrl({
      bin: qrData.bin,
      numberCode: qrData.account_number,
      name: qrData.account_name,
      money: String(qrData.amount),
      desc: qrData.description,
    });
  }, [detail]);

  if (!transactionId) {
    return null;
  }

  if (!detail && transactionDetailQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        <HeaderBack title="payment.transaction_status_title" />
        <View className="flex-1 items-center justify-center px-5">
          <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
          <Text className="mt-3 text-xs text-slate-500">{t('common.loading_data')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <FocusAwareStatusBar hidden={true} />
        <HeaderBack title="payment.transaction_status_title" />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-xs text-slate-500">
            {t('common_error.data_not_found')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const crossBorderData =
    detail.detail_kind === 'deposit_wechat' || detail.detail_kind === 'deposit_alipay'
      ? (detail.payment_data as {
          qr_image: string;
          amount: string;
          amount_cny: number;
          exchange_rate: string;
          description: string;
        } | null)
      : null;

  const qrBankData =
    detail.detail_kind === 'deposit_qr'
      ? (detail.payment_data as {
          bank_name: string;
          account_name: string;
          account_number: string;
          amount: number;
          description: string;
        } | null)
      : null;

  const statusTextColor = _TransactionStatusColor[detail.status];
  const transactionTypeLabel = _TransactionTypeMap[detail.type]
    ? t(_TransactionTypeMap[detail.type])
    : t('common.unknown');
  const pendingMessage =
    detail.detail_kind === 'deposit_alipay'
      ? t('payment.processing_transaction_alipay')
      : detail.detail_kind === 'deposit_wechat'
        ? t('payment.processing_transaction')
        : t('payment.waiting_payment');

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <FocusAwareStatusBar hidden={true} />
      <HeaderBack title="payment.transaction_status_title" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 72,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}>
        {(detail.detail_kind === 'deposit_qr' ||
          detail.detail_kind === 'deposit_wechat' ||
          detail.detail_kind === 'deposit_alipay') && (
          <PaymentImageCard
            uri={
              detail.detail_kind === 'deposit_qr' ? qrBankImageUrl : crossBorderData?.qr_image || ''
            }
            onSave={() =>
              saveURLImage(
                detail.detail_kind === 'deposit_qr'
                  ? qrBankImageUrl
                  : crossBorderData?.qr_image || ''
              )
            }
          />
        )}

        <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <View className="mb-1 flex-row items-center gap-1.5">
            <ReceiptText size={16} color={DefaultColor.slate[700]} />
            <Text className="font-inter-bold text-sm text-slate-900">
              {t('payment.transaction_information')}
            </Text>
          </View>

          <DetailRow
            label={t('common.status')}
            value={t(_TransactionStatusMap[detail.status])}
            valueClassName="font-inter-bold"
          />
          <DetailRow
            label={t('common.date')}
            value={dayjs(detail.created_at).format('YYYY-MM-DD HH:mm:ss')}
          />
          <DetailRow
            label={t('payment.total_payment')}
            value={`${formatBalance(detail.money_amount)} ${t('common.currency')}`}
          />
          <DetailRow label={t('payment.point_amount')} value={formatBalance(detail.point_amount)} />
          {detail.balance_after ? (
            <DetailRow
              label={t('payment.balance_after_transaction')}
              value={formatBalance(detail.balance_after)}
            />
          ) : null}
          {detail.transaction_code ? (
            <DetailRow
              label={t('payment.transfer_note')}
              value={detail.transaction_code}
              onCopy={() => copyToClipboard(detail.transaction_code || '')}
              valueClassName="text-red-600"
            />
          ) : null}
          {detail.expired_at ? (
            <DetailRow
              label={t('payment.expired_at')}
              value={dayjs(detail.expired_at).format('YYYY-MM-DD HH:mm:ss')}
            />
          ) : null}
        </View>

        {qrBankData ? (
          <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="font-inter-bold text-sm text-slate-900">
              {t('payment.payment_instruction')}
            </Text>
            <DetailRow label={t('payment.bank_name')} value={qrBankData.bank_name} />
            <DetailRow label={t('payment.account_name')} value={qrBankData.account_name} />
            <DetailRow
              label={t('payment.account_number')}
              value={qrBankData.account_number}
              onCopy={() => copyToClipboard(qrBankData.account_number)}
            />
            <DetailRow
              label={t('payment.total_payment')}
              value={`${formatBalance(qrBankData.amount)} ${t('common.currency')}`}
              onCopy={() => copyToClipboard(String(qrBankData.amount))}
            />
            <DetailRow
              label={t('payment.description_qr_bank')}
              value={qrBankData.description}
              onCopy={() => copyToClipboard(qrBankData.description)}
              valueClassName="text-red-600"
            />
          </View>
        ) : null}

        {crossBorderData ? (
          <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="font-inter-bold text-sm text-slate-900">
              {t('payment.payment_instruction')}
            </Text>
            <DetailRow
              label={t('payment.amount')}
              value={`${formatBalance(crossBorderData.amount_cny || 0)} CNY`}
            />
            <DetailRow
              label={t('payment.total_payment')}
              value={`${formatBalance(crossBorderData.amount || 0)} ${t('common.currency')}`}
            />
            <DetailRow
              label={t('payment.transfer_note')}
              value={crossBorderData.description}
              onCopy={() => copyToClipboard(crossBorderData.description)}
              valueClassName="text-red-600"
            />
          </View>
        ) : null}

        {detail.status === _TransactionStatus.PENDING && detail.detail_kind !== 'generic' ? (
          <View className="flex-row items-center justify-center gap-2 rounded-xl bg-white px-3 py-3">
            <ActivityIndicator size="small" color={DefaultColor.base['primary-color-2']} />
            <Text className="text-xs text-slate-600">{pendingMessage}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
