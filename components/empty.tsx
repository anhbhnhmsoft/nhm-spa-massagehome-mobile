import { useTranslation } from 'react-i18next';
import { View, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Định nghĩa type cho props rõ ràng hơn
type EmptyProps = {
  icon?: ReactNode; // 1. Prop cho icon
  title?: string;
  description?: string; // 2. Prop cho mô tả
  renderAction?: () => ReactNode;
  className?: string; // 3. Prop cho className
  style?: StyleProp<ViewStyle>; // 3. Prop cho style (quan trọng cho layout)
};

const Empty: FC<EmptyProps> = ({
                                 title,
                                 description,
                                 icon,
                                 renderAction,
                                 className,
                                 style,
                               }) => {
  const { t } = useTranslation();
  return (
    <View
      className={cn('items-center justify-center p-6', className || '')}
      style={style} // Truyền style vào
    >
      {/* Ưu tiên icon truyền vào, nếu không có thì dùng icon mặc định */}
      {icon || <FontAwesome6 name="inbox" size={40} color={DefaultColor.slate[500]} />}

      <Text className={'mt-4 text-center text-lg font-inter-bold text-slate-500'}>
        {title || t('common.empty')}
      </Text>
      {/* Chỉ render description nếu nó tồn tại */}
      {description && (
        <Text className={'mt-2 text-center text-sm text-slate-400'}>{description}</Text>
      )}

      <View className={'mt-4'}>{renderAction && renderAction()}</View>
    </View>
  );
};
export default Empty;
