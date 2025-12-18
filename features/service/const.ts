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
  PAYMENT_FAILED = 6,
}

export const _BookingStatusMap = {
  [_BookingStatus.PENDING]: 'enum.booking_status.PENDING',
  [_BookingStatus.CONFIRMED]: 'enum.booking_status.CONFIRMED',
  [_BookingStatus.ONGOING]: 'enum.booking_status.ONGOING',
  [_BookingStatus.COMPLETED]: 'enum.booking_status.COMPLETED',
  [_BookingStatus.CANCELED]: 'enum.booking_status.CANCELED',
  [_BookingStatus.PAYMENT_FAILED]: 'enum.booking_status.PAYMENT_FAILED',
} as const

export const getStatusColor = (status: _BookingStatus) => {
  switch (status) {
    case _BookingStatus.PENDING:
      return 'bg-yellow-100 text-yellow-700';
    case _BookingStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-700';
    case _BookingStatus.ONGOING:
      return 'bg-purple-100 text-purple-700';
    case _BookingStatus.COMPLETED:
      return 'bg-green-100 text-green-700';
    case _BookingStatus.CANCELED:
    case _BookingStatus.PAYMENT_FAILED:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};