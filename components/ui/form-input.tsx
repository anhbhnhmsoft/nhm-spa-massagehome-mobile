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
        {label && (
          <View>
            <Label>
              {label} {required && <Text className="text-red-500">*</Text>}
            </Label>
            {description && (
              <Text className="text-[12px] text-slate-500 mt-0.5 font-inter-italic">
                {description}
              </Text>
            )}
          </View>
        )}

        <View className="relative justify-center">
          <TextInput
            ref={ref}
            secureTextEntry={isSecure}
            placeholderTextColor="#94a3b8"
            // Logic Text Area
            multiline={isTextArea || props.multiline}
            numberOfLines={isTextArea ? numberOfLines : undefined}
            textAlignVertical={isTextArea ? 'top' : 'center'}
            className={cn(
              'w-full rounded-2xl bg-white px-4 border font-inter-medium text-slate-900',
              // Nếu là TextArea thì để chiều cao tự động + padding top/bottom, ngược lại để h-12
              isTextArea ? 'min-h-[50px] py-4' : 'h-12',
              error ? 'border-red-500' : 'border-slate-100',
              (isPassword || rightIcon) ? 'pr-12' : '',
              className
            )}
            {...props}
          />

          {/* Icon chỉ hiển thị khi không phải là TextArea hoặc được cấu hình riêng */}
          {!isTextArea && (
            <View className="absolute right-4 items-center justify-center">
              {isPassword ? (
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  {isPasswordVisible ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                </TouchableOpacity>
              ) : rightIcon}
            </View>
          )}
        </View>

        {error && (
          <Text className="text-sm font-inter-medium text-red-500">
            {error}
          </Text>
        )}
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';