import React, { useEffect, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { Headphones } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import SupportModal from '@/components/app/support-modal';
import { useGetSupport } from '@/features/config/hooks';
import { useAuthStore } from '@/features/auth/stores';
import SocketService from '@/features/chat/socket-service';
import useConfigStore from '@/features/config/stores';
import { SupportSocketMessagePayload } from '@/features/support/types';
import { useSupportTicketsQuery } from '@/features/support/hooks/use-query';
import { queryClient } from '@/lib/provider/query-provider';

/**
 * Floating Action Button hiển thị nút hỗ trợ cố định ở góc phải dưới màn hình.
 * Mount vào tab layout để hiển thị trên tất cả các tab.
 */
const SupportFab = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?.id);
  const supportUnreadCount = useConfigStore((s) => s.support_unread_count);
  const activeSupportRoomId = useConfigStore((s) => s.active_support_room_id);
  const { visible, openSupportModal, closeSupportModal, supportChanel } = useGetSupport();
  const supportTicketParams = useMemo(
    () => ({
      filter: {},
      per_page: 20,
    }),
    []
  );
  const supportTicketsQuery = useSupportTicketsQuery(supportTicketParams, !!token && !!userId);
  const apiUnreadCount = useMemo(() => {
    return (
      supportTicketsQuery.data?.pages
        .flatMap((page) => page.data.data)
        .reduce((total, ticket) => {
          if (typeof ticket.unread_count === 'number') {
            return total + ticket.unread_count;
          }

          const message = ticket.latest_message;
          if (!message) return total;

          return message.sender_type === 'staff' && !message.seen_at ? total + 1 : total;
        }, 0) ?? 0
    );
  }, [supportTicketsQuery.data]);
  const displayUnreadCount = Math.max(supportUnreadCount, apiUnreadCount);

  // Đặt FAB ngay trên tab bar (tab bar cao ~70px + safe area bottom)
  const bottomOffset = 70 + insets.bottom + 12;

  useEffect(() => {
    if (!token || !userId) {
      return;
    }

    const handleSupportMessage = (payload: SupportSocketMessagePayload) => {
      const ticket = payload?.ticket;
      const message = payload?.message;
      if (!ticket || !message) return;

      if (String(ticket.customer?.id ?? '') !== String(userId)) return;
      if (message.sender_type !== 'staff') return;

      const roomId = ticket.room_id ?? `support-ticket:${ticket.id}`;
      if (activeSupportRoomId && activeSupportRoomId === roomId) return;

      queryClient.invalidateQueries({ queryKey: ['supportApi-tickets'] });
    };

    SocketService.connect(token);
    SocketService.onSupportMessageNew(handleSupportMessage);

    return () => {
      SocketService.offSupportMessageNew(handleSupportMessage);
    };
  }, [token, userId, activeSupportRoomId]);

  return (
    <>
      <TouchableOpacity
        onPress={openSupportModal}
        activeOpacity={0.85}
        style={[styles.fab, { bottom: bottomOffset }]}
        accessibilityLabel={t('profile.support')}
        accessibilityRole="button"
      >
        <Headphones size={20} color="#fff" strokeWidth={2.2} />
        {displayUnreadCount > 0 ? (
          <View style={styles.badge}>
            <Text className="text-[10px] font-inter-bold text-white" numberOfLines={1}>
              {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <SupportModal
        isVisible={visible}
        onClose={closeSupportModal}
        supportChanel={supportChanel}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2b7bc4',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#1e40af',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default SupportFab;
