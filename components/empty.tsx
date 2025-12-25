import { useTranslation } from 'react-i18next';
import { View, StyleProp, ViewStyle } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import DefaultColor from '@/components/styles/color';
import { Text } from '@/components/ui/text';
import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type EmptyProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
  renderAction?: () => ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
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
      style={style}
    >
      {icon || <FontAwesome6 name="inbox" size={40} color={DefaultColor.slate[500]} />}

      <Text className={'mt-4 text-center text-lg font-inter-bold text-slate-500'}>
        {title || t('common.empty')}
      </Text>
      {description && (
        <Text className={'mt-2 text-center text-sm text-slate-400'}>{description}</Text>
      )}

      <View className={'mt-4'}>{renderAction && renderAction()}</View>
    </View>
  );
};
export default Empty;
