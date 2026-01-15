import { _ConfigKey } from '@/features/config/consts';
import { ResponseDataSuccessType } from '@/lib/types';

export type SupportChanel = [
  {
    key: _ConfigKey.SP_ZALO;
    value: string;
  },
  {
    key: _ConfigKey.SP_FACEBOOK;
    value: string;
  },
  {
    key: _ConfigKey.SP_WECHAT;
    value: string;
  },
  {
    key: _ConfigKey.SP_PHONE;
    value: string;
  },
];

export type SupportChanelResponse = ResponseDataSuccessType<SupportChanel>;
