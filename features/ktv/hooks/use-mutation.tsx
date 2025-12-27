import { useMutation } from '@tanstack/react-query';
import ktvApi from '@/features/ktv/api';
import { DetailServiceRequest } from '@/features/ktv/types';

// Thêm dịch vụ
export const useAddServiceMutation = () => {
  return useMutation({
    mutationFn: (data: FormData) => ktvApi.addService(data),
  });
};

// Cập nhật dịch vụ
export const useUpdateServiceMutation = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => ktvApi.updateService(data, id),
  });
};
// Xóa dịch vụ
export const useDeleteServiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.deleteService(id),
  });
};

// chi tiết dịch vụ
export const useDetailServiceMutation = () => {
  return useMutation({
    mutationFn: (params: DetailServiceRequest) => ktvApi.detailService(params),
  });
};
