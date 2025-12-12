export enum _ServiceDuration {
  FIFTEEN_MINUTE = 15,
  HALF_HOUR = 30,
  ONE_HOUR = 60,
  ONE_AND_HALF_HOUR = 90,
  TWO_HOUR = 120,
  TWO_AND_HALF_HOUR = 150,
  THREE_HOUR = 180,
  FOUR_HOUR = 240,
}


export enum _StepFormBooking {
  MAP = 0,
  FORM = 1,
}

export enum _BookingStatus{
  PENDING = 1,
  CONFIRMED = 2,
  ONGOING = 3,
  COMPLETED = 4,
  CANCELED = 5,
}

export const _BookingStatusMap = {
  [_BookingStatus.PENDING]: 'enum.order_status.PENDING',
  [_BookingStatus.CONFIRMED]: 'enum.order_status.CONFIRMED',
  [_BookingStatus.ONGOING]: 'enum.order_status.ONGOING',
  [_BookingStatus.COMPLETED]: 'enum.order_status.COMPLETED',
  [_BookingStatus.CANCELED]: 'enum.order_status.CANCELED',
} as const
