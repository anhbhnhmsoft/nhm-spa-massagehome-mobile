import { useMutation } from '@tanstack/react-query';
import { SearchLocationRequest, DetailLocationRequest } from '@/features/location/types';
import locationApi from '@/features/location/api';


export const useMutationSearchLocation = () => {
  return useMutation({
    mutationFn: (params: SearchLocationRequest) => locationApi.search(params),
  });
}

export const useMutationDetailLocation = () => {
  return useMutation({
    mutationFn: (params: DetailLocationRequest) => locationApi.detail(params),
  });
}
