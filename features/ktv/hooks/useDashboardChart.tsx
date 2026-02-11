import { useMemo } from 'react';
import { ChartDataItem } from '@/features/ktv/types';
import { DashboardTab } from '@/features/service/const';

/* =======================
   Utils
======================= */

const DAY_TIME_SLOTS = ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-00:00'];

const isValidDate = (d: Date) => !isNaN(d.getTime());

const toYMD = (d: Date) => d.toISOString().slice(0, 10);
const toYM = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const formatDM = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

const isSameDay = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (!isValidDate(d1) || !isValidDate(d2)) return false;
  return toYMD(d1) === toYMD(d2);
};

const isSameMonth = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (!isValidDate(d1) || !isValidDate(d2)) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

const isDateInRange = (date: string, start: Date, end: Date) => {
  const d = new Date(date);
  if (!isValidDate(d)) return false;
  return d >= start && d <= end;
};

const getLast7Days = () =>
  Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toYMD(d);
  });

const getLast7Months = () =>
  Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(1); // 👈 QUAN TRỌNG
    d.setMonth(d.getMonth() - (6 - i));
    return toYMD(d);
  });

const getWeekRanges = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const lastDay = new Date(y, m + 1, 0);

  const points = [1, 8, 15, 22];

  return points.map((startDay) => {
    const start = new Date(y, m, startDay);
    const end = startDay === 22 ? lastDay : new Date(y, m, startDay + 6);

    return {
      start,
      end,
      label: `${formatDM(start)}-${formatDM(end)}`,
    };
  });
};

/* =======================
   % CHANGE (SAFE)
======================= */

export const computePercentChange = (type: DashboardTab, rawData: ChartDataItem[]) => {
  const today = new Date();

  const sumBy = (predicate: (d: Date) => boolean) =>
    rawData.reduce((acc, item) => {
      const dt = new Date(item.date);
      if (!isValidDate(dt)) return acc;
      return predicate(dt) ? acc + Number(item.total || 0) : acc;
    }, 0);

  let currentTotal = 0;
  let previousTotal = 0;

  /* ===== DAY ===== */
  if (type === 'day') {
    const prev = new Date(today);
    prev.setDate(prev.getDate() - 1);

    currentTotal = sumBy((d) => toYMD(d) === toYMD(today));
    previousTotal = sumBy((d) => toYMD(d) === toYMD(prev));
  }

  /* ===== WEEK ===== */
  if (type === 'week') {
    const startCur = new Date();
    startCur.setDate(startCur.getDate() - 6);

    const startPrev = new Date(startCur);
    startPrev.setDate(startPrev.getDate() - 7);
    const endPrev = new Date(startCur);
    endPrev.setDate(endPrev.getDate() - 1);

    currentTotal = sumBy((d) => d >= startCur && d <= today);
    previousTotal = sumBy((d) => d >= startPrev && d <= endPrev);
  }

  /* ===== MONTH (by week) ===== */
  if (type === 'month') {
    const today = new Date();
    const ranges = getWeekRanges();

    const idx = ranges.findIndex((r) => today >= r.start && today <= r.end);

    const cur = idx >= 0 ? ranges[idx] : null;
    const prev = idx > 0 ? ranges[idx - 1] : null;

    currentTotal = cur ? sumBy((d) => d >= cur.start && d <= cur.end) : 0;

    previousTotal = prev ? sumBy((d) => d >= prev.start && d <= prev.end) : 0;
  }

  /* ===== YEAR (by month) ===== */
  if (type === 'year') {
    const curMonth = new Date();
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    currentTotal = sumBy(
      (d) => d.getFullYear() === curMonth.getFullYear() && d.getMonth() === curMonth.getMonth()
    );

    previousTotal = sumBy(
      (d) => d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth()
    );
  }

  const diff = currentTotal - previousTotal;

  const percent = previousTotal === 0 ? null : Math.round((diff / previousTotal) * 1000) / 10;

  return {
    currentTotal,
    previousTotal,
    percent,
    isIncrease: diff > 0 ? true : diff < 0 ? false : null,
  };
};

/* =======================
   CHART DATA
======================= */

export const useDashboardChart = (type: DashboardTab, data: ChartDataItem[]) => {
  const chartData = useMemo<ChartDataItem[]>(() => {
    /* ===== DAY ===== */
    if (type === 'day') {
      return DAY_TIME_SLOTS.map((slot) => {
        const found = data.find((d) => d.date === slot);
        return { date: slot, total: found?.total ?? '0' };
      });
    }

    /* ===== WEEK ===== */
    if (type === 'week') {
      return getLast7Days().map((date) => {
        const found = data.find((d) => isSameDay(d.date, date));
        return { date, total: found?.total ?? '0' };
      });
    }

    /* ===== MONTH ===== */
    if (type === 'month') {
      return getWeekRanges().map((range) => {
        const total = data.reduce((sum, d) => {
          return isDateInRange(d.date, range.start, range.end) ? sum + Number(d.total || 0) : sum;
        }, 0);

        return {
          date: range.label,
          total: String(total),
        };
      });
    }

    /* ===== YEAR ===== */
    if (type === 'year') {
      const months = getLast7Months();
      return months.map((monthDate) => {
        const ym = monthDate.slice(0, 7); // yyyy-MM

        // Use isSameMonth to handle different date formats (yyyy-MM vs yyyy-MM-dd)
        const found = data.find((d) => isSameMonth(d.date, monthDate));

        return {
          date: ym,
          total: found?.total ?? '0',
        };
      });
    }

    return [];
  }, [type, data]);


  const maxValue = useMemo(
    () => Math.max(...chartData.map((i) => Number(i.total)), 1),
    [chartData]
  );

  return { chartData, maxValue };
};
