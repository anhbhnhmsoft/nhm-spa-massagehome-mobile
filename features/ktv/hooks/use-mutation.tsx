import { useMutation } from '@tanstack/react-query';
import ktvApi from '@/features/ktv/api';
import {
  CancelBookingRequest,
  DetailServiceRequest,
  EditConfigScheduleRequest,
  EditProfileKtvRequest, SendDangerSupportRequest,
  UpdateVerificationRequest,
} from '@/features/ktv/types';



// Cập nhật dịch vụ
export const useSetServiceMutation = () => {
  return useMutation({
    mutationFn: (id:string) => ktvApi.setService(id),
  });
};


export const useStartBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.startBooking(id),
  });
};

export const useApplyApplicationBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.applyApplicationBooking(id),
  });
};

export const useConfirmApplicationBookingMutation = () => {
  return useMutation({
    mutationFn: (id: string) => ktvApi.confirmBooking(id),
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


// gửi hỗ trợ khẩn cấp
export const useSendDangerSupportMutation = () => {
  return useMutation({
    mutationFn: (data: SendDangerSupportRequest) => ktvApi.sendDangerSupport(data),
  });
};

// Cập nhật thông tin xác thực & chuyên môn KTV
export const useUpdateKtvVerificationMutation = () => {
  return useMutation({
    mutationFn: (data: UpdateVerificationRequest) => ktvApi.updateVerification(data),
  });
};

// Upload chứng chỉ chuyên môn
export const useUploadKtvCertificateMutation = () => {
  return useMutation({
    mutationFn: (data: FormData) => ktvApi.uploadCertificate(data),
  });
};
