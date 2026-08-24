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

export type CustomerCrmPreferences = {
  languages: string[];
  province_id?: string | null;
  district_id?: string | null;
  ward_id?: string | null;
  address_detail?: string | null;
  preferred_services: string[];
  preferred_techniques: string[];
  preferred_time_slots: number[];
  demand_status: number;
};

export type CustomerCrmPreferencesResponse = ResponseDataSuccessType<CustomerCrmPreferences>;
