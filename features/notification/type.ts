import { Paginator, ResponseDataSuccessType } from '@/lib/types';
import { NotificationStatus, NotificationType } from './const';

export type Notification = {
  id: number;
  user_id: string;

  title: string;
  description: string;

  type: NotificationType; // loại notification
  status: NotificationStatus; // trạng thái

  data?: Record<string, any>; // dữ liệu kèm theo (bookingId, orderId...)

  created_at: string;
  updated_at: string;
};

export type ListNotificationResponse = ResponseDataSuccessType<Paginator<Notification>>;
