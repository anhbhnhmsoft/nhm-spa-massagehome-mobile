import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';
import { _LanguageCode } from '@/lib/const';

export type SupportCategory = {
  id: string;
  name: Record<_LanguageCode | string, string>;
  description: Record<_LanguageCode | string, string>;
  message: Record<_LanguageCode | string, string>;
  position: number;
  is_active: boolean;
};

export type SupportCategoryResponse = ResponseDataSuccessType<SupportCategory[]>;

export type SupportTicketStatus = 'pending' | 'assigned' | 'in_progress' | 'closed';

export type SupportMessageSenderType = 'customer' | 'staff' | 'system';

export type SupportMessage = {
  id: string;
  support_ticket_id: string;
  content: string;
  sender_type: SupportMessageSenderType;
  sender_user_id?: string | null;
  sender_admin_id?: string | null;
  temp_id?: string | null;
  seen_at?: string | null;
  created_at: string;
  sender_name?: string | null;
  sender_avatar?: string | null;
};

export type SupportSocketMessagePayload = {
  ticket: SupportTicket;
  message: SupportMessage | null;
};

export type SupportTicket = {
  id: string;
  room_id: string;
  status: SupportTicketStatus;
  customer: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  assigned_staff: {
    id: string;
    name: string | null;
  } | null;
  category: SupportCategory | null;
  latest_booking: {
    id: string;
    booking_time: string | null;
    status: string | null;
    service_name: string | null;
  } | null;
  last_message_at: string | null;
  unread_count?: number;
  latest_message: SupportMessage | null;
  created_at: string;
  updated_at: string;
};

export type SupportTicketResponse = ResponseDataSuccessType<SupportTicket>;
export type SupportTicketListResponse = ResponseDataSuccessType<Paginator<SupportTicket>>;
export type SupportMessageListResponse = ResponseDataSuccessType<Paginator<SupportMessage>>;

export type CreateSupportTicketRequest = {
  support_category_id: string | number;
  content?: string;
};

export type SendSupportMessageRequest = {
  support_ticket_id: string | number;
  content: string;
  temp_id?: string;
};

export type SupportSeenRequest = {
  support_ticket_id: string | number;
};
