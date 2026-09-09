export enum _UrgencyLevel {
  NEED_NOW = 1,
  TODAY = 2,
  SCHEDULED = 3,
}

export enum _ServiceRequestStatus {
  NEW = 1,
  ASSIGNED = 2,
  SEARCHING_KTV = 3,
  PROPOSAL_SENT = 4,
  WAITING_CUSTOMER_CONFIRM = 5,
  MATCHED = 6,
  BOOKING_CREATED = 7,
  CLOSED = 8,
  CANCELED = 9,
}

export enum _ProposalStatus {
  PROPOSED = 1,
  KTV_ACCEPTED = 2,
  KTV_DECLINED = 3,
  CUSTOMER_ACCEPTED = 4,
  CUSTOMER_DECLINED = 5,
  EXPIRED = 6,
}

export interface _CreateServiceRequestInput {
  service_id: string | number;
  preferred_techniques?: string[];
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  preferred_date?: string;
  time_slot?: string;
  urgency_level?: _UrgencyLevel;
  preferred_ktv_ids?: string[];
  note?: string;
}

export interface _ServiceRequestProposalInfo {
  id: number;
  request_id: number;
  ktv_id: string;
  cskh_id?: string;
  status: _ProposalStatus;
  expires_at?: string;
  ktv?: {
    id: string;
    name: string;
    phone: string;
    avatar_url?: string;
  };
}

export interface _ServiceRequestInfo {
  id: number;
  customer_id: string;
  cskh_id?: string;
  service_id: number;
  preferred_techniques?: string[];
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  preferred_date?: string;
  time_slot?: string;
  urgency_level: _UrgencyLevel;
  preferred_ktv_ids?: string[];
  note?: string;
  status: _ServiceRequestStatus;
  expires_at?: string;
  created_at: string;
  service?: {
    id: number;
    title: string | Record<string, string>;
    price?: number;
  };
  proposals?: _ServiceRequestProposalInfo[];
}
