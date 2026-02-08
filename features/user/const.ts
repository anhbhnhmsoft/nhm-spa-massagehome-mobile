
export enum _PartnerFileType {
  IDENTITY_CARD_FRONT = 1,
  IDENTITY_CARD_BACK = 2,
  LICENSE = 3,
  KTV_IMAGE_DISPLAY = 5,
  FACE_WITH_IDENTITY_CARD = 6,
}

export enum _ReviewApplicationStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export const _ReviewApplicationStatusMap = {
  [_ReviewApplicationStatus.PENDING]: 'enum.review_application_status.PENDING',
  [_ReviewApplicationStatus.APPROVED]: 'enum.review_application_status.APPROVED',
  [_ReviewApplicationStatus.REJECTED]: 'enum.review_application_status.REJECTED',
} as const;