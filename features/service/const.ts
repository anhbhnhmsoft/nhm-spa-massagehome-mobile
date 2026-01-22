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

export enum _BookingStatus {
  PENDING = 1,
  CONFIRMED = 2,
  ONGOING = 3,
  COMPLETED = 4,
  CANCELED = 5,
  PAYMENT_FAILED = 6,
  WAITING_CANCEL = 7,
}

export const _BookingStatusMap = {
  [_BookingStatus.PENDING]: 'enum.booking_status.PENDING',
  [_BookingStatus.CONFIRMED]: 'enum.booking_status.CONFIRMED',
  [_BookingStatus.ONGOING]: 'enum.booking_status.ONGOING',
  [_BookingStatus.COMPLETED]: 'enum.booking_status.COMPLETED',
  [_BookingStatus.CANCELED]: 'enum.booking_status.CANCELED',
  [_BookingStatus.PAYMENT_FAILED]: 'enum.booking_status.PAYMENT_FAILED',
  [_BookingStatus.WAITING_CANCEL]: 'enum.booking_status.WAITING_CANCEL',
} as const;

export const getStatusColor = (status: _BookingStatus) => {
  switch (status) {
    case _BookingStatus.PENDING:
      return 'bg-yellow-100 text-yellow-700';
    case _BookingStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-700';
    case _BookingStatus.ONGOING:
      return 'bg-purple-100 text-purple-700';
    case _BookingStatus.COMPLETED:
      return 'bg-green-100 text-green-500';
    case _BookingStatus.CANCELED:
    case _BookingStatus.PAYMENT_FAILED:
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export enum DashboardTab {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export const _DashboardTabMap = {
  [DashboardTab.DAY]: 'enum.dashboard_tab.DAY',
  [DashboardTab.WEEK]: 'enum.dashboard_tab.WEEK',
  [DashboardTab.MONTH]: 'enum.dashboard_tab.MONTH',
  [DashboardTab.YEAR]: 'enum.dashboard_tab.YEAR',
} as const;
export const DASHBOARD_TABS = Object.values(DashboardTab);

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}
export const _WeekDayMap = {
  [WeekDay.MONDAY]: 'enum.week_day.monday',
  [WeekDay.TUESDAY]: 'enum.week_day.tuesday',
  [WeekDay.WEDNESDAY]: 'enum.week_day.wednesday',
  [WeekDay.THURSDAY]: 'enum.week_day.thursday',
  [WeekDay.FRIDAY]: 'enum.week_day.friday',
  [WeekDay.SATURDAY]: 'enum.week_day.saturday',
  [WeekDay.SUNDAY]: 'enum.week_day.sunday',
} as const;
export const WEEK_DAYS: readonly WeekDay[] = [
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
  WeekDay.SUNDAY,
];
