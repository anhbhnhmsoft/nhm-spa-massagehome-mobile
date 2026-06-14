import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import dayjs from 'dayjs';

import { Text } from '@/components/ui/text';
import BaseBottomModal from '@/components/ui/base-bottom-modal';
import useCopyClipboard from '@/features/app/hooks/use-copy-clipboard';
import { _ConfigKey, _ConfigKeyLabel } from '@/features/config/consts';
import { useSupportCategoriesQuery, useSupportTicketsQuery } from '@/features/support/hooks/use-query';
import { useMutationCreateSupportTicket } from '@/features/support/hooks/use-mutation';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { SupportCategory, SupportTicket } from '@/features/support/types';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  supportChanel: Array<{
    key: _ConfigKey;
    value: string;
  }> | undefined | null;
};

/** Badge màu tương ứng với status ticket */
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef9c3', text: '#a16207' },
  assigned: { bg: '#dbeafe', text: '#1d4ed8' },
  in_progress: { bg: '#dcfce7', text: '#15803d' },
  closed: { bg: '#f1f5f9', text: '#64748b' },
};

const SupportModal = ({ isVisible, onClose, supportChanel }: Props) => {
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const copyClipboard = useCopyClipboard();
  const handleError = useErrorToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const { data: categories = [], isLoading: loadingCategories } = useSupportCategoriesQuery(isVisible);
  const { mutate: createTicket, isPending } = useMutationCreateSupportTicket();

  // Query ticket chưa đóng của user
  const ticketsQuery = useSupportTicketsQuery(
    { per_page: 10 },
    isVisible
  );

  const openTickets = useMemo<SupportTicket[]>(() => {
    const allTickets =
      ticketsQuery.data?.pages.flatMap((p) => p.data?.data ?? []) ?? [];
    return allTickets.filter((tk) => tk.status !== 'closed');
  }, [ticketsQuery.data]);

  const hasOpenTickets = openTickets.length > 0;
  const isLoadingTickets = ticketsQuery.isLoading;

  const locale = useMemo(() => {
    const lang = i18n.language?.toLowerCase() ?? 'vi';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('zh') || lang.startsWith('cn')) return 'cn';
    return 'vi';
  }, [i18n.language]);

  const getInfo = useCallback(
    (key: _ConfigKey) => {
      switch (key) {
        case _ConfigKey.SP_ZALO:
          return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/zalo.png') };
        case _ConfigKey.SP_FACEBOOK:
          return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/facebook.png') };
        case _ConfigKey.SP_WECHAT:
          return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/wechat.png') };
        case _ConfigKey.SP_PHONE:
          return { label: t(_ConfigKeyLabel[key]), icon: require('@/assets/icon/phone.png') };
        default:
          return { label: '', icon: null };
      }
    },
    [t]
  );

  const handlePress = useCallback(
    async (key: _ConfigKey, value: string) => {
      switch (key) {
        case _ConfigKey.SP_PHONE:
          await Linking.openURL(`tel:${value}`);
          break;
        case _ConfigKey.SP_ZALO:
        case _ConfigKey.SP_FACEBOOK: {
          const supported = await Linking.canOpenURL(value);
          if (supported) {
            await Linking.openURL(value);
          } else {
            Alert.alert(t('common_error.error_alert_linking_message'));
          }
          break;
        }
        case _ConfigKey.SP_WECHAT:
          await copyClipboard(value);
          break;
      }
    },
    [t, copyClipboard]
  );

  const handleJoinTicket = useCallback(
    (ticket: SupportTicket) => {
      onClose();
      router.push({
        pathname: '/(app)/(customer)/(service)/support-chat',
        params: { ticketId: ticket.id },
      });
    },
    [onClose]
  );

  const handleCreateTicket = useCallback(() => {
    if (!selectedCategoryId) return;

    createTicket(
      {
        support_category_id: selectedCategoryId,
        content: note.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          const ticket = res.data;
          setSelectedCategoryId(null);
          setNote('');
          onClose();
          router.push({
            pathname: '/(app)/(customer)/(service)/support-chat',
            params: { ticketId: ticket.id },
          });
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  }, [createTicket, note, onClose, selectedCategoryId, handleError]);

  const renderCategory = useCallback(
    (item: SupportCategory) => {
      const name = item.name?.[locale] ?? item.name?.vi ?? Object.values(item.name ?? {})[0] ?? '';
      const description =
        item.description?.[locale] ??
        item.description?.vi ??
        Object.values(item.description ?? {})[0] ??
        '';
      const message =
        item.message?.[locale] ??
        item.message?.vi ??
        Object.values(item.message ?? {})[0] ??
        '';
      const active = selectedCategoryId === item.id;

      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            setSelectedCategoryId(item.id);
            if (!note.trim() && message) {
              setNote(message);
            }
          }}
          activeOpacity={0.8}
          style={[styles.categoryCard, active && styles.categoryCardActive]}
        >
          <View className="flex-1 pr-3">
            <Text className="text-base font-inter-bold text-slate-800">{name}</Text>
            <Text className="mt-1 text-xs leading-5 text-slate-500" numberOfLines={2}>
              {description}
            </Text>
          </View>
          <View style={[styles.badge, active && styles.badgeActive]}>
            <Text className={active ? 'text-white text-[10px] font-inter-bold' : 'text-primary-color-2 text-[10px] font-inter-bold'}>
              {active ? t('common.selected') : t('common.select')}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [locale, note, selectedCategoryId, t]
  );

  /** Render một ticket đang mở */
  const renderOpenTicket = useCallback(
    (ticket: SupportTicket) => {
      const categoryName =
        ticket.category?.name?.[locale] ??
        ticket.category?.name?.vi ??
        Object.values(ticket.category?.name ?? {})[0] ??
        t('support.title');

      const statusStyle = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.pending;
      const statusLabel = t(`support.status_${ticket.status}` as any, ticket.status);

      const lastMsg = ticket.latest_message?.content ?? '';
      const lastTime = ticket.last_message_at
        ? dayjs(ticket.last_message_at).format('DD/MM HH:mm')
        : dayjs(ticket.created_at).format('DD/MM HH:mm');

      return (
        <TouchableOpacity
          key={ticket.id}
          onPress={() => handleJoinTicket(ticket)}
          activeOpacity={0.8}
          style={styles.openTicketCard}
        >
          <View className="flex-1 pr-2">
            {/* Category + Status badge */}
            <View className="flex-row items-center gap-2">
              <Text className="flex-1 font-inter-bold text-slate-800" numberOfLines={1}>
                {categoryName}
              </Text>
            </View>

            {/* Nhân viên phụ trách */}
            {ticket.assigned_staff?.name ? (
              <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={1}>
                {t('common.assigned_user')}: {ticket.assigned_staff.name}
              </Text>
            ) : (
              <Text className="mt-0.5 text-xs text-slate-400">{t('common.pending')}</Text>
            )}

            {/* Tin nhắn cuối */}
            {!!lastMsg && (
              <Text className="mt-1 text-xs text-slate-400" numberOfLines={1}>
                {lastMsg}
              </Text>
            )}
          </View>

          {/* Thời gian + nút vào */}
          <View className="items-end gap-1">
            <Text className="text-[10px] text-slate-400">{lastTime}</Text>
            <View style={styles.joinBadge}>
              <Text style={{ color: '#2b7bc4', fontSize: 10, fontWeight: '700' }}>
                {t('support.continue_chat')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [locale, t, handleJoinTicket]
  );

  return (
    <BaseBottomModal
      visible={isVisible}
      onClose={onClose}
      title={t('support.title')}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>

        {/* ── Đang tải danh sách ticket ── */}
        {isLoadingTickets ? (
          <View className="items-center justify-center py-4">
            <ActivityIndicator />
          </View>
        ) : hasOpenTickets ? (
          /* ── Có ticket chưa đóng: hiển thị danh sách, không cho tạo mới ── */
          <View>
            <Text className="mb-2 text-sm font-inter-bold text-slate-800">
              {t('support.open_tickets')}
            </Text>
            <View style={[styles.ticketList, { maxHeight: Math.max(200, height * 0.4) }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {openTickets.map(renderOpenTicket)}
              </ScrollView>
            </View>

            {/* Banner giải thích lý do không thể tạo mới */}
            <View style={styles.noCreateBanner}>
              <Text className="text-center text-xs text-amber-700">
                {t('support.cannot_create_new', {
                  tickets: openTickets.length
                })}
              </Text>
            </View>
          </View>
        ) : (
          /* ── Không có ticket mở: hiển thị form tạo mới ── */
          <>
            <View>
              {loadingCategories ? (
                <View className="items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <View style={[styles.categoryList, { maxHeight: Math.max(180, height * 0.32) }]}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {categories.map(renderCategory)}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="gap-1">
              <Text className="text-sm font-inter-bold text-slate-800">{t('common.note')}</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('support.description')}
                multiline
                textAlignVertical="top"
                style={styles.noteInput}
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateTicket}
              disabled={!selectedCategoryId || isPending}
              activeOpacity={0.8}
              style={[
                styles.submitButton,
                (!selectedCategoryId || isPending) && styles.submitButtonDisabled,
              ]}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-sm font-inter-bold text-white">
                  {t('common.create')}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Kênh liên hệ khác */}
        {supportChanel?.length ? (
          <View className="gap-3 pt-2">
            <Text className="text-sm font-inter-bold text-slate-800">{t('support.contact')}</Text>
            {supportChanel.map((item) => {
              if (!item.value?.trim()) return null;
              const info = getInfo(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => handlePress(item.key, item.value)}
                  activeOpacity={0.7}
                  style={styles.itemShadow}
                  className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-50"
                >
                  <Image source={info.icon} style={styles.iconImage} />
                  <View className="flex-1">
                    <Text className="text-base font-inter-bold text-slate-700">{info.label}</Text>
                    <Text className="text-slate-400 text-xs" numberOfLines={1}>
                      {item.value}
                    </Text>
                  </View>
                  <View className="bg-blue-50 px-3 py-1.5 rounded-lg">
                    <Text className="text-[10px] font-inter-bold text-primary-color-2 uppercase">
                      {t('common.open')}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </BaseBottomModal>
  );
};

const styles = StyleSheet.create({
  itemShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  categoryCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCardActive: {
    borderColor: '#2b7bc4',
    backgroundColor: '#eff6ff',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
  },
  badgeActive: {
    backgroundColor: '#2b7bc4',
  },
  noteInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#172033',
    backgroundColor: '#fff',
  },
  submitButton: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#2b7bc4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  categoryList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 8,
  },
  // Styles cho danh sách ticket đang mở
  ticketList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 8,
  },
  openTicketCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  joinBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  noCreateBanner: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 10,
  },
});

export default SupportModal;
