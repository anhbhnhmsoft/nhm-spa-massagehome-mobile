import { client } from '@/lib/axios-client';
import { ResponseDataSuccessType } from '@/lib/types';
import {
  _CreateServiceRequestInput,
  _ServiceRequestInfo,
  _ServiceRequestProposalInfo,
} from '@/features/service-request/types';

export const serviceRequestApi = {
  /**
   * Khách hàng tạo Yêu cầu dịch vụ nhờ CSKH hỗ trợ
   */
  createServiceRequest: async (
    data: _CreateServiceRequestInput
  ): Promise<ResponseDataSuccessType<_ServiceRequestInfo>> => {
    const response = await client.post('/service-requests', data);
    return response.data;
  },

  /**
   * Lấy danh sách Yêu cầu dịch vụ của Khách hàng
   */
  getCustomerRequests: async (): Promise<
    ResponseDataSuccessType<_ServiceRequestInfo[]>
  > => {
    const response = await client.get('/service-requests');
    return response.data;
  },

  /**
   * Khách hàng Phản hồi đề xuất KTV từ CSKH
   */
  respondProposalByCustomer: async (
    proposalId: number | string,
    accept: boolean
  ): Promise<ResponseDataSuccessType<{ proposal: _ServiceRequestProposalInfo }>> => {
    const response = await client.post(
      `/service-requests/proposals/${proposalId}/respond`,
      { accept }
    );
    return response.data;
  },

  /**
   * KTV Lấy danh sách Lượt đề xuất dành cho mình
   */
  getKtvProposals: async (): Promise<
    ResponseDataSuccessType<_ServiceRequestProposalInfo[]>
  > => {
    const response = await client.get('/ktv/service-request-proposals');
    return response.data;
  },

  /**
   * KTV Phản hồi Lời mời đề xuất từ CSKH
   */
  respondProposalByKtv: async (
    proposalId: number | string,
    accept: boolean
  ): Promise<ResponseDataSuccessType<_ServiceRequestProposalInfo>> => {
    const response = await client.post(
      `/ktv/service-request-proposals/${proposalId}/respond`,
      { accept }
    );
    return response.data;
  },
};
