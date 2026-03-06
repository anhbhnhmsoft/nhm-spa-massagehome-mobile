import React, { useState } from 'react';
import { View, TextInput, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react-native';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  description?: string;
  // Thêm prop để xác định đây là textarea
  isTextArea?: boolean;
  numberOfLines?: number;
}
export const FormLabel = ({ label, required, description }: Pick<FormInputProps, 'label' | 'required' | 'description'>) => {
  return (
    <View>
      <Label className="text-slate-700 font-inter-bold">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Label>
      {description && (
        <Text className="text-[12px] text-slate-500 mt-0.5 font-inter-italic">
          {description}
        </Text>
      )}
    </View>
  )
}

export const FormError = ({ error }: Pick<FormInputProps, 'error'>) => {
  if (!error) return null;
  return (
    <Text className="text-red-500 text-[12px] font-inter-italic">
      {error}
    </Text>
  )
}

export const FormInput = React.forwardRef<TextInput, FormInputProps>(
  ({
     label,
     description,
     error,
     required,
     isPassword,
     rightIcon,
     containerClassName,
     className,
     isTextArea,
     numberOfLines = 4,
     ...props
   }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isSecure = isPassword ? !isPasswordVisible : props.secureTextEntry;

    return (
      <View className={cn('gap-2', containerClassName)}>
        {/* Label Section */}
        {label && (
          <FormLabel label={label} required={required} description={description} />
        )}

        <View className="relative w-full justify-center">
          <TextInput
            ref={ref}
            secureTextEntry={isSecure}
            placeholderTextColor="#94a3b8"
            multiline={isTextArea}
            numberOfLines={isTextArea ? numberOfLines : 1}
            // textAlignVertical cực kỳ quan trọng cho Android TextArea
            textAlignVertical={isTextArea ? 'top' : 'center'}
            // Thêm includeFontPadding: false để tránh lệch dòng trên Android
            style={{ includeFontPadding: false }}
            className={cn(
              'w-full rounded-2xl bg-white px-4 border font-inter-medium text-slate-900',
              // h-12 cho input thường, min-h cho textarea. py-0 giúp căn giữa chuẩn hơn.
              isTextArea ? 'min-h-[100px] py-4' : 'h-12 py-0',
              error ? 'border-red-500' : 'border-slate-100',
              (isPassword || rightIcon) ? 'pr-12' : '',
              className
            )}
            {...props}
          />

          {/* Icon Container: Đảm bảo luôn nằm giữa chiều cao h-12 */}
          {!isTextArea && (
            <View className="absolute right-4 h-12 items-center justify-center">
              {isPassword ? (
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isPasswordVisible ?
                    <EyeOff size={20} color="#64748b" /> :
                    <Eye size={20} color="#64748b" />
                  }
                </TouchableOpacity>
              ) : rightIcon}
            </View>
          )}
        </View>

        <FormError error={error} />
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';