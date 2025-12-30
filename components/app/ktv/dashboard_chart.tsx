import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DashboardTab } from '@/features/service/const';
import { ChartDataItem } from '@/features/ktv/types';
import { useDashboardChart } from '@/features/ktv/hooks/useDashboardChart';
import { BarChart3 } from 'lucide-react-native';

interface Props {
  type: DashboardTab;
  data: ChartDataItem[];
}

const formatLabel = (t: any, type: DashboardTab, date: string) => {
  if (!date) return '';
  if (type === 'day' || type === 'month') return date;

  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  if (type === 'week') {
    const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(`enum.week_day.${names[d.getDay()]}`);
  }

  if (type === 'year') {
    return `T${d.getMonth() + 1}`;
  }

  return date;
};

const DashboardChart: React.FC<Props> = ({ type, data }) => {
  const { t } = useTranslation();
  const { chartData, maxValue } = useDashboardChart(type, data);

  if (!data || data.length === 0) {
    return (
      <View className="px-4 py-3">
        <View className="h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
          <BarChart3 size={40} color="#9ca3af" strokeWidth={1.5} />
          <Text className="mt-2 font-medium text-gray-400">{t('dashboard.no_chart_data')}</Text>
        </View>
      </View>
    );
  }

  // Tạo các mốc giá trị (ví dụ: 0, 50%, 100% của maxValue)
  const yAxisTicks = [maxValue, maxValue / 2, 0];

  return (
    <View className="mt-4 px-4 py-3">
      <View className="flex-row">
        {/* 1. Cột Y-Axis (Các mốc chỉ số) */}
        <View className="mr-2 justify-between pb-6">
          {/* pb-6 để khớp với chiều cao label ngày tháng bên dưới */}
          {yAxisTicks.map((tick, i) => (
            <Text key={i} className="text-right text-[10px] text-gray-400">
              {Math.round(tick)}
            </Text>
          ))}
        </View>

        {/* 2. Vùng chứa biểu đồ và Đường kẻ ngang */}
        <View className="relative flex-1">
          {/* Các đường kẻ ngang (Grid lines) nằm dưới cột */}
          <View className="absolute inset-0 justify-between pb-6">
            {[1, 2, 3].map((_, i) => (
              <View key={i} className="h-0 w-full border-b border-gray-100" />
            ))}
          </View>

          {/* Các cột biểu đồ */}
          <View className="h-40 flex-row items-end justify-between">
            {chartData.map((item, index) => {
              const hasValue = maxValue > 0;
              const height = hasValue ? (Number(item.total) / maxValue) * 100 : 0;

              return (
                <View key={index} className="flex-1 items-center">
                  {/* Tooltip hoặc giá trị trên đầu cột (tùy chọn) */}
                  {Number(item.total) > 0 && (
                    <Text className="mb-1 text-[8px] font-bold text-blue-600">{item.total}</Text>
                  )}

                  <View
                    className={`w-5 rounded-t-sm ${hasValue && Number(item.total) > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                    style={{
                      height: hasValue ? `${Math.max(height, 2)}%` : '4%',
                    }}
                  />

                  {/* Label ngày tháng */}
                  <View className="h-8 justify-center">
                    <Text className="mt-1 w-10 text-center text-[10px] font-medium text-gray-500">
                      {formatLabel(t, type, item.date)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default DashboardChart;
