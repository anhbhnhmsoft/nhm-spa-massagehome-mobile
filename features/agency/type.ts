import { Paginator, ResponseDataSuccessType } from '@/lib/types';
import { ListKTVItem } from '../user/types';

export type ListKtvResponse = ResponseDataSuccessType<Paginator<ListKTVItem>>;

export type ReferralAffiliateSummary = {
  /** Tổng chiết khấu lợi nhuận của mời KTV trong khoảng thời gian */
  total_profit_referral_ktv: number;

  /** Tổng chiết khấu lợi nhuận Affiliate trong khoảng thời gian */
  total_profit_affiliate: number;

  /** Số lượng Khách hàng đã giới thiệu trong khoảng thời gian */
  total_referral_customer: number;

  /** Tổng số lượng đơn đặt hàng mà user đang quản lý KTV trong khoảng thời gian */
  total_customer_order_ktv: number;

  /** Tổng số khách hàng Affiliate đã đặt trong khoảng thời gian */
  total_customer_affiliate_order: number;
};

export type KtvPerformance = {
  id: number;
  name: string;
  avatar_url: string | null;
  phone: string;
  total_reviews: number;
  total_finished_bookings: number;
  total_revenue: number;
  total_unique_customers: number;
};

export type DashboardAgencyResponse = ResponseDataSuccessType<ReferralAffiliateSummary>;

export type ListKtvPerformanceResponse = ResponseDataSuccessType<Paginator<KtvPerformance>>;
