import { ResponseDataSuccessType } from '@/lib/types';

export type SearchLocationRequest = {
  keyword: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
};

export type SearchLocation = {
  place_id: string;
  formatted_address: string;
}

export type SearchLocationResponse = ResponseDataSuccessType<SearchLocation[]>;


export type DetailLocationRequest = {
  place_id: string;
}

export type DetailLocation  = {
  place_id: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
}

export type DetailLocationResponse = ResponseDataSuccessType<DetailLocation>;
