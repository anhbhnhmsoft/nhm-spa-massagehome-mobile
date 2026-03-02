import { _BookingStatus } from '@/features/service/const';
import { ResponseDataSuccessType } from '@/lib/types';

export type DashboardBookingStatus =
  | _BookingStatus.PENDING
  | _BookingStatus.CONFIRMED
  | _BookingStatus.ONGOING
  | _BookingStatus.WAITING_CANCEL;

export type DashboardProfileCustomer = {
  booking_count: Record<DashboardBookingStatus, number>;
  wallet_balance: string;
  coupon_user_count: number;
};

export type DashboardProfileResponse = ResponseDataSuccessType<DashboardProfileCustomer>;
