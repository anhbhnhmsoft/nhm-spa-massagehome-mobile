export enum _ConfigKey {
  SP_ZALO = 'SP_ZALO',
  SP_FACEBOOK = 'SP_FACEBOOK',
  SP_PHONE = 'SP_PHONE',
  SP_WECHAT = 'SP_WECHAT',
}

export const _ConfigKeyLabel: Record<_ConfigKey, string> = {
  [_ConfigKey.SP_ZALO]: 'enum.config.SP_ZALO',
  [_ConfigKey.SP_FACEBOOK]: 'enum.config.SP_FACEBOOK',
  [_ConfigKey.SP_PHONE]: 'enum.config.SP_PHONE',
  [_ConfigKey.SP_WECHAT]: 'enum.config.SP_WECHAT',
}
