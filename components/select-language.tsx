import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback } from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import { _LanguageCode, _LanguagesMap } from '@/lib/const';
import { X } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useSetLanguageUser } from '@/features/auth/hooks';

const SelectLanguage = forwardRef<BottomSheetModal, any>((props, ref) => {
  const { setLanguage, selectedLang } = useSetLanguageUser(ref);
  return (
    <SelectLanguageModal ref={ref} value={selectedLang} onChange={(value) => setLanguage(value)} />
  );
});

export const SelectLanguageModal = forwardRef<
  BottomSheetModal,
  {
    value: _LanguageCode;
    onChange: (lang: _LanguageCode) => void;
    loading?: boolean;
    closeOnSelect?: boolean;
  }
>(({ value, onChange, loading, closeOnSelect}, ref) => {
  const { t } = useTranslation();

  // Cấu hình Backdrop (Lớp nền mờ đen phía sau)
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0} // Mở ở snap point đầu tiên (50%)
      snapPoints={[]}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#f5f5f5' }}
      handleIndicatorStyle={{ backgroundColor: 'white' }} // Màu cái thanh ngang nhỏ ở trên
    >
      <BottomSheetView className="flex-1 pb-5">
        {/* --- HEADER --- */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-2 pb-4">
          {/* Nút đóng (X) */}
          <TouchableOpacity onPress={() => (ref as any)?.current?.dismiss()} className="p-1">
            <X size={24} color="#374151" />
          </TouchableOpacity>

          {/* Tiêu đề */}
          <Text className="absolute left-0 right-0 z-[-1] text-center text-lg font-inter-bold text-gray-900">
            {t('common.select_language')}
          </Text>

          {/* View rỗng để cân bằng layout flex (nếu cần) */}
          <View className="w-6" />
        </View>

        <View className="mt-2 px-5">
          {_LanguagesMap.map((lang) => {
            const isSelected = value === lang.code;

            return (
              <TouchableOpacity
                key={lang.code}
                disabled={loading}
                onPress={() => {
                  onChange(lang.code);
                  if (closeOnSelect) {
                    (ref as any)?.current?.dismiss();
                  }
                }}
                className="flex-row items-center border-b border-gray-50 py-4">
                {/* Cờ + Tên */}
                <View className="flex-1 flex-row items-center">
                  <Image source={lang.icon} className="mr-2 h-6 w-6" />
                  <Text
                    className={cn(
                      'text-base font-inter-medium',
                      isSelected ? 'text-primary-color-1' : 'text-gray-700'
                    )}>
                    {lang.label}
                  </Text>
                </View>

                {/* Radio Button */}
                <View
                  className={cn(
                    'h-6 w-6 items-center justify-center rounded-full border',
                    isSelected
                      ? 'border-primary-color-2 bg-primary-color-2' // Màu xanh Spa khi chọn
                      : 'border-gray-300 bg-white' // Màu xám khi chưa chọn
                  )}>
                  {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default SelectLanguage;
