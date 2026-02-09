import { BaseSearchRequest, Paginator, ResponseDataSuccessType } from '@/lib/types';

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


export type ListAddressRequest = BaseSearchRequest<object>;

export type SelectAddress = {
  address: string;
  latitude: string;
  longitude: string;
  desc: string;
};

export type AddressItem = {
  id: string;
  user_id: string;
  address: string;
  latitude: string;
  longitude: string;
  desc: string;
}
export type ListAddressResponse = ResponseDataSuccessType<Paginator<AddressItem>>;


export type SaveAddressRequest = {
  address: string;
  latitude: number;
  longitude: number;
  desc?: string;
}

export type SetDefaultAddressRequest = {
  address: string;
  latitude: number;
  longitude: number;
}

export type EditAddressRequest = SaveAddressRequest & {
  id: string;
}

export type DeleteAddressRequest = {
  id: string;
}

// Provinces
export type ListProvincesRequest = {
  keyword?: string;
}

export type ProvinceItem = {
  id: string;
  code: string;
  name: string;
}

export type ListProvincesResponse = ResponseDataSuccessType<ProvinceItem[]>;

export type LocationPrimaryUser = {
  lat: number,
  lng: number,
  address: string
}