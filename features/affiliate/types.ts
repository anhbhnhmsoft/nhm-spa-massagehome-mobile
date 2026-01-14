import { _UserRole } from '@/features/auth/const';
import { ResponseDataSuccessType } from '@/lib/types';

export type ConfigAffiliate = {
  target_role: _UserRole;
  commission_rate: string;
  min_commission: string;
  max_commission: string;
};

export type UserReferral = {
  id: string;
  name: string;
};

export type ConfigAffiliateResponse = ResponseDataSuccessType<ConfigAffiliate>;
export type MatchAffiliateResponse = ResponseDataSuccessType<{
  status: boolean;
  need_register?: boolean;
  user_referral?: UserReferral;
}>;
