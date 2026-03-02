import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useDetailKtv } from '@/features/user/hooks';
import { useTranslation } from 'react-i18next';
import Empty from '@/components/empty';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CarouselImageKtvSection,
  FistReviewKtvSection,
  InfoKtvSection,
  SchedulesKtvSection,
  ServiceCardDetailKtv,
  ServicesBottomSheet,
} from '@/components/app/customer';

const MasseurDetailScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const {
    detail,
    refreshPage,
    loading,
    bottomServiceRef,
    serviceData,
    handleOpenServiceSheet,
    handleDismissServiceSheet,
    handlePrepareBooking,
  } = useDetailKtv();

  return (
    <>
      <View className={`flex-1 bg-slate-50`}>
        <FlatList
          keyExtractor={(item, index) => `service-${item.id}-${index}`}
          data={detail.service_categories}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{}}
          onEndReachedThreshold={0.5}
          overScrollMode="never"
          ListHeaderComponent={
            <View className="flex-1">
              {/* --- HEADER CAROUSEL --- */}
              <CarouselImageKtvSection images={detail.display_image} t={t} ktvId={detail.id} />

              {/* --- INFO SECTION  --- */}
              <InfoKtvSection t={t} detail={detail} />

              {/* --- Header: DANH SÁCH DỊCH VỤ --- */}
              <View className="mt-2 bg-white px-4 pt-4">
                <Text className="mb-4 border-l-4 border-primary-color-2 pl-2 font-inter-bold text-lg text-gray-800">
                  {t('masseurs_detail.service_list')}
                </Text>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => refreshPage()}
            />
          }
          renderItem={({ item }) => {
            return (
              <View
                key={item.id}
                className="bg-white px-5 pb-4"
              >
                <ServiceCardDetailKtv item={item} t={t} setItem={handleOpenServiceSheet} />
              </View>
            );
          }}
          ListEmptyComponent={<Empty className={'bg-white'} />}
          ListFooterComponent={
            <>
              {/* Lịch làm việc */}
              {detail.schedule && (
                <SchedulesKtvSection schedule={detail.schedule} t={t} />
              )}

              {/* --- Review Section --- */}
              <FistReviewKtvSection
                t={t}
                review_count={detail.review_count}
                first_review={detail.first_review}
                ktv_id={detail.id}
              />

              {/* --- Footer padding --- */}
              <View
                style={{
                  backgroundColor: 'white',
                  paddingBottom: insets.bottom,
                }}
              />
            </>
          }
        />
      </View>
      {/* --- DANH SÁCH DỊCH VỤ --- */}
      <ServicesBottomSheet
        ref={bottomServiceRef}
        serviceData={serviceData}
        onDismiss={handleDismissServiceSheet}
        handlePrepareBooking={handlePrepareBooking}
        t={t}
      />
    </>
  );
};

export default MasseurDetailScreen;
