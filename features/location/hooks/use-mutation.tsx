import { useMutation } from '@tanstack/react-query';
import {
  SearchLocationRequest,
  DetailLocationRequest,
  SaveAddressRequest,
  EditAddressRequest,
} from '@/features/location/types';
import locationApi from '@/features/location/api';

/**
 * Mutation tìm kiếm địa điểm
 */
export const useMutationSearchLocation = () => {
  return useMutation({
    mutationFn: (params: SearchLocationRequest) => locationApi.search(params),
  });
}

/**
 * Mutation lấy chi tiết địa điểm
 */
export const useMutationDetailLocation = () => {
  return useMutation({
    mutationFn: (params: DetailLocationRequest) => locationApi.detail(params),
  });
}

export const useMutationSaveAddress = () => {
  return useMutation({
    mutationFn: (params: SaveAddressRequest) => locationApi.saveAddress(params),
  });
}

export const useMutationEditAddress = () => {
  return useMutation({
    mutationFn: (params: EditAddressRequest) => locationApi.editAddress(params),
  });
}

export const useMutationDeleteAddress = () => {
  return useMutation({
    mutationFn: (params: { id: string }) => locationApi.deleteAddress(params),
  });
}