

export enum _AuthStatus {
  INITIAL = 'INITIAL',
  HYDRATE = 'HYDRATE',
  AUTHORIZED = 'AUTHORIZED',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export enum _UserRole {
  CUSTOMER = 1,
  KTV = 2,
  AGENCY = 3,
}

export enum _Gender {
  MALE = 1,
  FEMALE = 2,
}
export const _GenderMap = {
  [_Gender.MALE]: 'enum.gender.MALE',
  [_Gender.FEMALE]: 'enum.gender.FEMALE',
} as const;

