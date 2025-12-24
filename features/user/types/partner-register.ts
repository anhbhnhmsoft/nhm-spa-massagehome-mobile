import { _UserRole } from '@/features/auth/const';

export type PartnerRegisterForm = {
  name: string;
  city: string;
  location: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  agency_id?: string;
};

export type PartnerRegisterIndividualForm = PartnerRegisterForm;

export type PartnerRegisterAgencyForm = PartnerRegisterForm;

export type PartnerFileUpload = {
  type: number;
  file_path: string;
  is_public?: boolean;
};

export type PartnerRegisterSubmitData = {
  name: string;
  role: _UserRole;
  reviewApplication?: {
    agency_id?: string;
    province_code?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    bio?: string;
  };
  files: PartnerFileUpload[];
};

