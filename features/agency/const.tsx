// Enum định nghĩa các mốc thời gian
export enum _TimeFilter {
  ALL = 'all',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

// Map để hiển thị Text tiếng Việt tương ứng
export const TimeFilterMap: Record<_TimeFilter, string> = {
  [_TimeFilter.ALL]: 'agency.page.dashboard.tabs.all',
  [_TimeFilter.DAY]: 'agency.page.dashboard.tabs.day',
  [_TimeFilter.WEEK]: 'agency.page.dashboard.tabs.week',
  [_TimeFilter.MONTH]: 'agency.page.dashboard.tabs.month',
  [_TimeFilter.QUARTER]: 'agency.page.dashboard.tabs.quarter',
  [_TimeFilter.YEAR]: 'agency.page.dashboard.tabs.year',
};
