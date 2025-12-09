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

export type ResponsePagingSuccessType<T> = {
  message: string;
  data: T;
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
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

