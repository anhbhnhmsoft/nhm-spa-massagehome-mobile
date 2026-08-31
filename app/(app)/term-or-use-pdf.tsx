import React, { useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import HeaderBack from '@/components/header-back';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetFileQuery } from '@/features/file/hooks/use-query';
import { useLocalSearchParams } from 'expo-router';
import DefaultColor from '@/components/styles/color';
import * as WebBrowser from 'expo-web-browser';

let PdfComponent: any = null;
try {
  PdfComponent = require('react-native-pdf')?.default || require('react-native-pdf');
} catch (e) {
  PdfComponent = null;
}

export default function TermOrUsePdf() {
  const { type } = useLocalSearchParams<{ type?: string }>();

  const contractType = Number(type);

  const { data, isLoading } = useGetFileQuery(contractType);
  const [pdfLoading, setPdfLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const source = {
    uri: data?.file,
    cache: true,
  };

  const handleOpenBrowser = async () => {
    if (data?.file) {
      await WebBrowser.openBrowserAsync(data.file);
    }
  };

  // Loading API
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-base-color-2">
        <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <HeaderBack />
      {PdfComponent ? (
        <>
          <PdfComponent
            source={source}
            trustAllCerts={false}
            style={{ flex: 1, backgroundColor: DefaultColor.white }}
            onLoadComplete={() => setPdfLoading(false)}
            onError={() => {
              setPdfLoading(false);
            }}
          />
          {pdfLoading && (
            <View className="absolute inset-0 items-center justify-center bg-white">
              <ActivityIndicator size="large" color={DefaultColor.base['primary-color-2']} />
            </View>
          )}
        </>
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-gray-700 text-center mb-4">
            Tài liệu điều khoản và chính sách sử dụng
          </Text>
          {data?.file && (
            <TouchableOpacity
              onPress={handleOpenBrowser}
              style={{ backgroundColor: DefaultColor.base['primary-color-2'] }}
              className="px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-medium">Mở xem tài liệu</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

