import { ResponseDataSuccessType } from '@/lib/types';
import { BookingItem } from '@/features/booking/types';
import { ReviewItem } from '@/features/service/types';

export type DashboardKtvResponse = ResponseDataSuccessType<{
  booking: BookingItem | null;
  total_revenue_today: number;
  total_revenue_yesterday: number;
  total_booking_completed_today: number;
  total_booking_pending_today: number;
  review_today: ReviewItem | null;
}>;
export type StartBookingResponse = ResponseDataSuccessType<{
  status: number;
  start_time: string;
  duration: number;
  booking: BookingItem;
}>;
export type BookingDetailsResponse = ResponseDataSuccessType<{ data: BookingItem }>;
