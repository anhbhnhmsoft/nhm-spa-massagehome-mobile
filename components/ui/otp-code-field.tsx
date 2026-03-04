import { FC } from 'react';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { CELL_OTP_COUNT } from '@/lib/const';
import { View } from 'react-native';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui/text';


type Props = {
  value: string;
  setValue: (text: string) => void;
}
const OtpCodeField: FC<Props> = ({ value, setValue }) => {
  // Hook của thư viện: Tự động ẩn bàn phím khi nhập đủ
  const ref = useBlurOnFulfill({ value, cellCount: CELL_OTP_COUNT });

  // Hook của thư viện: Xử lý logic focus vào từng ô
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: value,
    setValue: (text) => setValue(text),
  });


  return (
    <CodeField
      ref={ref}
      {...props}
      value={value}
      onChangeText={(text) => setValue(text)}
      cellCount={CELL_OTP_COUNT}
      rootStyle={{ marginTop: 0, width: '100%' }}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoFocus={true}
      renderCell={({ index, symbol, isFocused }) => (
        <View
          key={index}
          onLayout={getCellOnLayoutHandler(index)}
          className={cn(
            "w-[14%] aspect-square rounded-xl border justify-center items-center bg-white",
            isFocused ? "border-primary-color-2 border-[1.5px]" : "border-gray-300"
          )}
        >
          <Text className="text-2xl font-inter-medium text-black">
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        </View>
      )}
    />
  )
}

export default OtpCodeField;
