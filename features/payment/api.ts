import { client } from '@/lib/axios-client';
import {
  ConfigPaymentResponse,
  WalletResponse,
  DepositRequest,
  DepositResponse,
  CheckTransactionRequest,
  CheckTransactionResponse,
  ListTransactionRequest,
  ListTransactionResponse,
} from '@/features/payment/types';

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
    const response = await client.get(`${defaultUri}/deposit/check`, { params: { ...data } });
    return response.data;
  },
};

export default paymentApi;
