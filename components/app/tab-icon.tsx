import { View } from 'react-native';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';

export const TabIcon = ({
                   focused,
                   icon: IconComponent,
                   label,
                 }: {
  focused: boolean;
  icon: any;
  label: string;
}) => {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        top: 24, // iOS đẩy xuống 12px, Android giữ nguyên
      }}>
      {/* Khối nền của Icon */}
      <View
        className={`mb-1 h-10 w-10 items-center justify-center rounded-2xl ${
          focused ? 'bg-blue-600' : 'bg-transparent'
        }`}>
        <IconComponent
          size={20}
          color={focused ? 'white' : DefaultColor.gray['400']}
          strokeWidth={focused ? 2.5 : 2}
        />
      </View>

      {/* Label */}
      <Text
        numberOfLines={1}
        className={"font-inter-bold"}
        style={{
          fontSize: 10,
          color: focused ? DefaultColor.base['primary-color-2'] : DefaultColor.gray['400'],
          textAlign: 'center',
          width: 70,
        }}>
        {label}
      </Text>
    </View>
  );
};
