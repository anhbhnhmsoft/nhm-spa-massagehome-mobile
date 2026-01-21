import { client } from '@/lib/axios-client';
import {
  CheckTransactionRequest,
  CheckTransactionResponse,
  ConfigPaymentResponse,
  CreateWithdrawInfoRequest,
  DeleteWithdrawInfoRequest,
  DepositRequest,
  DepositResponse,
  InfoWithdrawResponse,
  ListBankInfoResponse,
  ListTransactionRequest,
  ListTransactionResponse,
  RequestWithdrawRequest,
  WalletResponse,
} from '@/features/payment/types';
import { ResponseSuccessType } from '@/lib/types';

const defaultUri = '/payment';

const paymentApi = {
  // Lấy thông tin ví
  myWallet: async (): Promise<WalletResponse> => {
    const response = await client.get(`${defaultUri}/wallet`);
    return response.data;
  },
  // Lấy lịch sử giao dịch
  listTransaction: async (params: ListTransactionRequest): Promise<ListTransactionResponse> => {
    const response = await client.get(`${defaultUri}/transactions`, { params });
    return response.data;
  },
  // Lấy thông tin cấu hình thanh toán
  configPayment: async (): Promise<ConfigPaymentResponse> => {
    const response = await client.get(`${defaultUri}/config`);
    return response.data;
  },
  // Nạp tiền
  deposit: async (data: DepositRequest): Promise<DepositResponse> => {
    const response = await client.post(`${defaultUri}/deposit`, data);
    return response.data;
  },
  // Kiểm tra trạng thái giao dịch
  checkTransaction: async (data: CheckTransactionRequest): Promise<CheckTransactionResponse> => {
    const response = await client.get(`${defaultUri}/check-transaction`, { params: { ...data } });
    return response.data;
  },
  // Lấy thông tin tài khoản rút tiền
  infoWithdraw: async (): Promise<InfoWithdrawResponse> => {
    const response = await client.get(`${defaultUri}/info-withdraw`);
    return response.data;
  },
  // Tạo thông tin tài khoản rút tiền
  createWithdrawInfo: async (data: CreateWithdrawInfoRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/info-withdraw`, data);
    return response.data;
  },
  // Xóa thông tin tài khoản rút tiền
  deleteWithdrawInfo: async (data: DeleteWithdrawInfoRequest): Promise<ResponseSuccessType> => {
    const response = await client.delete(`${defaultUri}/info-withdraw/${data.id}`);
    return response.data;
  },
  // Lấy danh sách ngân hàng hỗ trợ rút tiền
  listBankInfo: async (): Promise<ListBankInfoResponse> => {
    const response = await client.get(`${defaultUri}/bank-info`);
    return response.data;
  },
  // Yêu cầu rút tiền
  requestWithdraw: async (data: RequestWithdrawRequest): Promise<ResponseSuccessType> => {
    const response = await client.post(`${defaultUri}/request-withdraw`, data);
    return response.data;
  },
};

export default paymentApi;
