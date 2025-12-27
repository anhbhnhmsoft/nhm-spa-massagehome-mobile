import { _LanguageCode } from '@/lib/const';

export interface IValidationErrors {
  [field: string]: string[];
}

interface IErrorAPIServer {
  statusCode: number;
  message: string;
  validateError: IValidationErrors | null;
  rawError: any;
}

export default class ErrorAPIServer implements IErrorAPIServer {
  public statusCode: number;
  public message: string;
  public validateError: IValidationErrors | null;
  public rawError: any;

  constructor(
    statusCode: number,
    message: string,
    rawError: any,
    validateError: IValidationErrors | null = null
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.rawError = rawError;
    this.validateError = validateError;
  }
}

export type ResponseDataSuccessType<T> = {
  message: string;
  data: T;
};


export type ResponseSuccessType = {
  message: string;
};

export type BaseSearchRequest<TFilter> = {
  filter: TFilter;
  sort_by?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
};

export type Paginator<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
  meta: {
    links: {
      url: string | null;
      label: string;
      active: boolean;
      page: number | null;
    }[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  }
}

export interface IDeviceInfo {
  platform: 'ios' | 'android';
  deviceId: string;
  deviceName: string;
}

export interface IMultiLangField {
  [_LanguageCode.VI]: string;
  [_LanguageCode.EN]?: string;
  [_LanguageCode.CN]?: string;
}

export interface IFileUpload {
  uri: string;
  type: string; // vd: 'image/jpeg'
  name: string; // vd: 'photo.jpg'
}