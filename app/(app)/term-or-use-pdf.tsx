import DefaultColor from '@/components/styles/color';
import HeaderBack from '@/components/header-back';
import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useGetFileQuery } from '@/features/file/hooks/use-query';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';

let PdfComponent: any = null;
try {
  PdfComponent = require('react-native-pdf')?.default || require('react-native-pdf');
} catch (e) {
  PdfComponent = null;
}

export default function TermOrUsePdf() {
  const { t } = useTranslation();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const insets = useSafeAreaInsets();
  const [pdfLoading, setPdfLoading] = useState(true);

  const contractType = Number(type);
  const { data, isLoading } = useGetFileQuery(contractType);

  const source = {
    cache: true,
    uri: data?.file,
  };

  const handleOpenBrowser = async () => {
    if (data?.file) {
      await WebBrowser.openBrowserAsync(data.file);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-base-color-2">
        <ActivityIndicator color={DefaultColor.base['primary-color-2']} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <HeaderBack />
      {PdfComponent ? (
        <>
          <PdfComponent
            onError={() => setPdfLoading(false)}
            onLoadComplete={() => setPdfLoading(false)}
            source={source}
            style={{ backgroundColor: DefaultColor.white, flex: 1 }}
            trustAllCerts={false}
          />
          {pdfLoading && (
            <View className="absolute inset-0 items-center justify-center bg-white">
              <ActivityIndicator color={DefaultColor.base['primary-color-2']} size="large" />
            </View>
          )}
        </>
      ) : (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-gray-700 text-center mb-4">
            {t('auth.terms_document_title')}
          </Text>
          {data?.file && (
            <TouchableOpacity
              className="bg-primary-color-2 px-6 py-3 rounded-xl active:opacity-80"
              onPress={handleOpenBrowser}
            >
              <Text className="text-white font-medium text-center">
                {t('auth.open_document')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
