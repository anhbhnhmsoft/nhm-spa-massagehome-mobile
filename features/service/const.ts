import DefaultColor from '@/components/styles/color';

export enum _BookingStatus {
  ALL = 0, // Ngoài luồng, ko có trong thực tế, dùng để set tìm kiếm tất cả
  PENDING = 1,
  CONFIRMED = 2,
  ONGOING = 3,
  COMPLETED = 4,
  CANCELED = 5,
  PAYMENT_FAILED = 6,
  WAITING_CANCEL = 7,
}

export const _BookingStatusMap = {
  [_BookingStatus.ALL]: 'enum.booking_status.ALL',
  [_BookingStatus.PENDING]: 'enum.booking_status.PENDING',
  [_BookingStatus.CONFIRMED]: 'enum.booking_status.CONFIRMED',
  [_BookingStatus.ONGOING]: 'enum.booking_status.ONGOING',
  [_BookingStatus.COMPLETED]: 'enum.booking_status.COMPLETED',
  [_BookingStatus.CANCELED]: 'enum.booking_status.CANCELED',
  [_BookingStatus.PAYMENT_FAILED]: 'enum.booking_status.PAYMENT_FAILED',
  [_BookingStatus.WAITING_CANCEL]: 'enum.booking_status.WAITING_CANCEL',
} as const;

export const getBookingStatusStyle = (status: _BookingStatus) => {
  switch (status) {
    case _BookingStatus.PENDING:
      return {
        background: DefaultColor.yellow[100],
        text_color: DefaultColor.white[700],
        label: _BookingStatusMap[status],
      };
    case _BookingStatus.CONFIRMED:
      return {
        background: DefaultColor.blue[100],
        text_color: DefaultColor.blue[700],
        label: _BookingStatusMap[status],
      };
    case _BookingStatus.ONGOING:
      return {
        background: DefaultColor.purple[100],
        text_color: DefaultColor.purple[700],
        label: _BookingStatusMap[status],
      };
    case _BookingStatus.COMPLETED:
      return {
        background: DefaultColor.green[100],
        text_color: DefaultColor.green[500],
        label: _BookingStatusMap[status],
      };
    case _BookingStatus.CANCELED:
    case _BookingStatus.PAYMENT_FAILED:
      return {
        background: DefaultColor.red[100],
        text_color: DefaultColor.red[700],
        label: _BookingStatusMap[status],
      };
    default:
      return {
        background: DefaultColor.gray[100],
        text_color: DefaultColor.gray[700],
        label: _BookingStatusMap[status],
      };
  }
}

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
