export type InvitationStatusType = 1 | 2 | 3 | 4 | 5;

export interface MaskedCustomerType {
  id: string;
  display_name: string;
  avatar?: string | null;
}

export interface NearbyDemandItemType {
  request_id: number | string;
  service_name: string;
  preferred_techniques?: string[];
  preferred_date?: string;
  time_slot?: string;
  urgency_level?: string;
  province_id?: string;
  district_id?: string;
  relative_address: string;
  distance_km?: number | null;
  customer: MaskedCustomerType;
  created_at: string;
}

export interface KtvProactiveInviteType {
  id: number | string;
  ktv_id: string;
  customer_id: string;
  request_id?: number | string | null;
  status: InvitationStatusType;
  note?: string | null;
  expires_at: string;
  created_at: string;
  ktv?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
}
