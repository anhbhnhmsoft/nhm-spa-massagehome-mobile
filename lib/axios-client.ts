import axios from 'axios';
import { _BackendURL, _HTTPStatus, _LanguageCode } from '@/lib/const';
import { SecureStorage, Storage } from '@/lib/storages';
import { _StorageKey } from '@/lib/storages/key';
import ErrorAPIServer, { IValidationErrors } from '@/lib/types';
import i18next from 'i18next';
import useAuthStore from '@/features/auth/store';



export const client = axios.create({
  baseURL: `${_BackendURL}/api`,
  timeout: 30000, // Set a timeout for requests (30 seconds)
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  },
});


client.interceptors.request.use(
  async (config) => {
    // Add an authorization token if available
    const token = await SecureStorage.getItem<string>(_StorageKey.SECURE_AUTH_TOKEN);
    const lang = await Storage.getItem<_LanguageCode>(_StorageKey.LANGUAGE);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Thêm tham số ngôn ngữ vào mỗi request nếu có
    if (lang) {
      config.params = {
        ...config.params,
        locate: lang,
      };
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);


client.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = error.response;
    const errorData = error.response?.data;
    //Nếu có lỗi trả ra từ server
    if (errorResponse && errorData) {
      let messageError: string | null | undefined = errorData.message;
      let statusCodeResponse: number | null | undefined = errorResponse?.status;

      if (!messageError) messageError = i18next.t("common_error.request_error");
      if (!statusCodeResponse) statusCodeResponse = 0;
      if (statusCodeResponse === _HTTPStatus.VALIDATE_FAILED_REQUEST) {
        const errorValidate: IValidationErrors = errorData.errors;
        return Promise.reject(new ErrorAPIServer(statusCodeResponse, messageError, errorResponse, errorValidate));
      } else if (statusCodeResponse === _HTTPStatus.UNAUTHORIZED) {
        //Xử lý khi token không hợp lệ
        // Gọi hàm logout từ store (dùng getState vì đang ở ngoài React Component)
        useAuthStore.getState().logout();
        return Promise.reject(new ErrorAPIServer(
          _HTTPStatus.UNAUTHORIZED,
          i18next.t("common_error.invalid_or_expired_token"),
          errorResponse
        ));
      }else{
        return Promise.reject(new ErrorAPIServer(statusCodeResponse, messageError, errorResponse));
      }
    } else if (error.request) {
      return Promise.reject(
        new ErrorAPIServer(
          _HTTPStatus.BAD_REQUEST,
          i18next.t("common_error.request_error"),
          errorResponse
        )
      );
    } else {
      return Promise.reject(
        new ErrorAPIServer(
          _HTTPStatus.INTERNAL_SERVER_ERROR,
          i18next.t("common_error.server_error"),
          errorResponse
        )
      );
    }
  }
);