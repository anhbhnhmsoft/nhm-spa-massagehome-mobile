import { useMutation } from '@tanstack/react-query';
import ktvApi from '@/features/ktv/api';
import {
  CancelBookingRequet,
  DetailServiceRequest,
  EditConfigScheduleRequest,
  EditProfileKtvRequest,
} from '@/features/ktv/types';

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

export const useStartBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.startBooking(id),
  });
};

//  hủy booking
export const useCancelBookingMutation = () => {
  return useMutation({
    mutationFn: (data: CancelBookingRequet) => ktvApi.cancelBooking(data),
  });
};

//  hoàn thành booking
export const useFinishBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.finishBooking(id),
  });
};

// upload hình ảnh dịch vụ
export const useUploadImageMutation = () => {
  return useMutation({
    mutationFn: (data: FormData) => ktvApi.uploadImage(data),
  });
};

// xóa hình ảnh dịch vụ
export const useDeleteImageMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.deleteImage(id),
  });
};

// cập nhật profile ktv
export const useUpdateProfileKtvMutation = () => {
  return useMutation({
    mutationFn: (data: EditProfileKtvRequest) => ktvApi.updateProfile(data),
  });
};

// lấy link qr giới thiệu agency
export const useLinkQrAgencyMutation = () => {
  return useMutation({
    mutationFn: (agency_id: string) => ktvApi.linkQrAgency(agency_id),
  });
};

// cập nhật
export const useUpdateConfigScheduleMutation = () => {
  return useMutation({
    mutationFn: (data: EditConfigScheduleRequest) => ktvApi.updateConfigSchedule(data),
  });
};

//
export const useLinkReferrerMutation = () => {
  return useMutation({
    mutationFn: (referrer_id: string) => ktvApi.linkReferrer(referrer_id),
  });
};
