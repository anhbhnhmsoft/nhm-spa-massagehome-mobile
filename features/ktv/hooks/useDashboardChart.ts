import { useMemo } from 'react';
import { ChartDataItem } from '@/features/ktv/types';
import { DashboardTab } from '@/features/service/const';

const DAY_TIME_SLOTS = ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-24:00'];

const toYMD = (d: Date) => d.toISOString().slice(0, 10);

const formatDM = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

const isSameDay = (a: string, b: string) => toYMD(new Date(a)) === toYMD(new Date(b));

const isSameMonth = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

const isDateInRange = (date: string, start: Date, end: Date) => {
  const d = new Date(date).getTime();
  return d >= start.getTime() && d <= end.getTime();
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
    d.setMonth(d.getMonth() - (6 - i));
    d.setDate(1);
    return toYMD(d);
  });

const getMonthRanges = (count = 2) => {
  const ranges: {
    start: Date;
    end: Date;
    label: string;
  }[] = [];

  let end = new Date();

  for (let i = 0; i < count; i++) {
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    ranges.unshift({
      start,
      end,
      label: `${formatDM(start)}-${formatDM(end)}`,
    });

    end = start;
  }

  return ranges;
};

// computePercentChange chỉ trả về số
export const computePercentChange = (type: DashboardTab, rawData: ChartDataItem[]) => {
  const today = new Date();
  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

  const sumByPredicate = (rawData: ChartDataItem[], predicate: (dateStr: string) => boolean) =>
    rawData.reduce((acc, item) => (predicate(item.date) ? acc + Number(item.total || 0) : acc), 0);

  const getCurrentPrevious = () => {
    if (type === 'day') {
      const cur = toDateStr(today);
      const prevDate = new Date(today);
      prevDate.setDate(prevDate.getDate() - 1);
      return [
        sumByPredicate(rawData, (d) => toDateStr(new Date(d)) === cur),
        sumByPredicate(rawData, (d) => toDateStr(new Date(d)) === toDateStr(prevDate)),
      ];
    }

    if (type === 'week') {
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return toDateStr(d);
      });
      const curTotal = sumByPredicate(rawData, (d) => days.includes(toDateStr(new Date(d))));
      const prevDays = days.map((d) => {
        const dt = new Date(d);
        dt.setDate(dt.getDate() - 7);
        return toDateStr(dt);
      });
      const prevTotal = sumByPredicate(rawData, (d) => prevDays.includes(toDateStr(new Date(d))));
      return [curTotal, prevTotal];
    }

    // Month theo tuần
    if (type === 'month') {
      const ranges = Array.from({ length: 7 }).map((_, i) => {
        const end = new Date();
        end.setDate(end.getDate() - 7 * (6 - i));
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return { start, end };
      });
      const curRange = ranges[ranges.length - 1];
      const prevRange = ranges[ranges.length - 2];
      const curTotal = sumByPredicate(rawData, (d) => {
        const dt = new Date(d);
        return dt >= curRange.start && dt <= curRange.end;
      });
      const prevTotal = sumByPredicate(rawData, (d) => {
        const dt = new Date(d);
        return dt >= prevRange.start && dt <= prevRange.end;
      });
      return [curTotal, prevTotal];
    }

    // Year theo tháng
    if (type === 'year') {
      const months = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (6 - i));
        d.setDate(1);
        return d;
      });
      const curMonth = months[months.length - 1];
      const prevMonth = months[months.length - 2];
      const curTotal = sumByPredicate(rawData, (d) => {
        const dt = new Date(d);
        return dt.getFullYear() === curMonth.getFullYear() && dt.getMonth() === curMonth.getMonth();
      });
      const prevTotal = sumByPredicate(rawData, (d) => {
        const dt = new Date(d);
        return (
          dt.getFullYear() === prevMonth.getFullYear() && dt.getMonth() === prevMonth.getMonth()
        );
      });
      return [curTotal, prevTotal];
    }

    return [0, 0];
  };

  const [currentTotal, previousTotal] = getCurrentPrevious();
  const diff = currentTotal - previousTotal;
  const percent = previousTotal === 0 ? null : Math.round((diff / previousTotal) * 100 * 10) / 10;
  const isIncrease = diff > 0 ? true : diff < 0 ? false : null;

  return { currentTotal, previousTotal, percent, isIncrease };
};

export const useDashboardChart = (type: DashboardTab, data: ChartDataItem[]) => {
  const chartData = useMemo<ChartDataItem[]>(() => {
    /* ===== DAY ===== */
    if (type === 'day') {
      return DAY_TIME_SLOTS.map((slot) => {
        const found = data.find((d) => d.date === slot);
        return {
          date: slot,
          total: found ? found.total : '0',
        };
      });
    }

    /* ===== WEEK ===== */
    if (type === 'week') {
      const days = getLast7Days();

      return days.map((date) => {
        const found = data.find((d) => isSameDay(d.date, date));

        return {
          date,
          total: found ? found.total : '0',
        };
      });
    }

    /* ===== MONTH ===== */
    if (type === 'month') {
      const ranges = getMonthRanges(5);

      return ranges.map((range) => {
        const found = data.find((d) => isDateInRange(d.date, range.start, range.end));

        return {
          date: range.label,
          total: found ? found.total : '0',
        };
      });
    }

    /* ===== YEAR ===== */
    if (type === 'year') {
      const months = getLast7Months();

      return months.map((month) => {
        const found = data.find((d) => isSameMonth(d.date, month));

        return {
          date: month,
          total: found ? found.total : '0',
        };
      });
    }

    return [];
  }, [type, data]);

  const maxValue = useMemo(
    () => Math.max(...chartData.map((i) => Number(i.total)), 1),
    [chartData]
  );

  return {
    chartData,
    maxValue,
  };
};
