import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';


export type JoinRoomRequest = {
  user_id: string; // ID của người dùng định chat
}

export type RoomItem = {
  id: string; // ID của phòng chat
  partner_id: string; // ID của đối tượng chat (như KTV)
  partner_name: string; // Tên đối tượng chat (như KTV)
}

export type JoinRoomResponse = ResponseDataSuccessType<RoomItem>

export type SendMessageRequest = {
  room_id: string; // ID của phòng chat
  content: string; // Nội dung tin nhắn
  temp_id?: string; // ID của tin nhắn tạm thời (nếu có)
}

// Payload khi nhận tin nhắn mới
export type PayloadNewMessage = {
  id: string; // ID tin nhắn
  room_id: string; // ID phòng chat
  content: string; // Nội dung tin nhắn
  sender_id: string; // ID người gửi
  sender_name: string; // Tên người gửi
  sender_avatar?: string; // URL avatar người gửi (có thể null)
  created_at: string; // Thời gian tạo tin nhắn (ISO string)
  temp_id?: string; // ID tạm thời (nếu có)
  status_sent?: 'pending' | 'sent' | 'failed'; // Trạng thái gửi (nếu là tin tạm thời) (ko có trong response)
};


export type ListMessageRequest = BaseSearchRequest<object>

export type ListMessageResponse = ResponseDataSuccessType<Paginator<PayloadNewMessage>>


export type KTVConversationRequest = BaseSearchRequest<object>


export type KTVConversationItem = {
  id: string; // ID của phòng chat
  customer: {
    id: string; // ID của khách hàng
    name: string; // Tên của khách hàng
    avatar: string | null; // URL avatar của khách hàng (có thể null)
  };
  unread_count: number; // Số tin nhắn chưa đọc
  latest_message: {
    id: string; // ID của tin nhắn mới nhất
    content: string; // Nội dung tin nhắn mới nhất
    created_at: string; // Thời gian tạo tin nhắn mới nhất (ISO string)
  } | null; // Tin nhắn mới nhất (có thể null)
}

export type KTVConversationResponse = ResponseDataSuccessType<Paginator<KTVConversationItem>>
