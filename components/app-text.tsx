import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export type FontWeight =
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | 'normal' | 'bold';

export interface AppTextProps extends TextProps {
  weight?: FontWeight;
  italic?: boolean;
}

const getFontFamily = (weight: FontWeight = 'normal', italic: boolean = false): string => {
  let baseWeight = weight;

  // Chuẩn hóa 'normal' và 'bold'
  if (weight === 'normal') baseWeight = '400';
  if (weight === 'bold') baseWeight = '700';

  const fontMap: Record<string, string> = {
    '100': 'Inter_100Thin',
    '200': 'Inter_200ExtraLight',
    '300': 'Inter_300Light',
    '400': 'Inter_400Regular',
    '500': 'Inter_500Medium',
    '600': 'Inter_600SemiBold',
    '700': 'Inter_700Bold',
    '800': 'Inter_800ExtraBold',
    '900': 'Inter_900Black',
  };

  const fontFamily = fontMap[baseWeight] || 'Inter_400Regular';

  return italic ? `${fontFamily}_Italic` : fontFamily;
};

const AppText: React.FC<AppTextProps> = ({
                                           style,
                                           weight = 'normal',
                                           italic = false,
                                           children,
                                           ...rest
                                         }) => {
  const fontFamily = getFontFamily(weight, italic);

  return (
    <Text
      style={[
        styles.defaultText,
        { fontFamily },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: '#333333',
    fontSize: 14,
  },
});

export default AppText;