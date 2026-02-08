import { useMutation } from '@tanstack/react-query';
import {
  SearchLocationRequest,
  DetailLocationRequest,
  SaveAddressRequest,
  EditAddressRequest, SetDefaultAddressRequest,
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

/**
 * Mutation lưu địa chỉ
 */
export const useMutationSaveAddress = () => {
  return useMutation({
    mutationFn: (params: SaveAddressRequest) => locationApi.saveAddress(params),
  });
}
/**
 * Mutation cập nhật địa chỉ
 */
export const useMutationEditAddress = () => {
  return useMutation({
    mutationFn: (params: EditAddressRequest) => locationApi.editAddress(params),
  });
}

/**
 * Mutation xóa địa chỉ
 */
export const useMutationDeleteAddress = () => {
  return useMutation({
    mutationFn: (params: { id: string }) => locationApi.deleteAddress(params),
  });
}
/**
 * Mutation đặt địa chỉ mặc định
 */
export const useMutationSetDefaultAddress = () => {
  return useMutation({
    mutationFn: (params: SetDefaultAddressRequest) => locationApi.setDefaultAddress(params),
  });
}
