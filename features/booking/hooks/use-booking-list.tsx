import { useInfiniteBookingList } from '@/features/booking/hooks/use-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BookingItem, ListBookingRequest } from '@/features/booking/types';
import { useImmer } from 'use-immer';
import { useTranslation } from 'react-i18next';
import { _BookingStatus } from '@/features/service/const';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Lấy danh sách đặt lịch
export const useBookingList = () => {
  const { t } = useTranslation();
  const [params, setParams] = useImmer<ListBookingRequest>({
    filter: {
      status: _BookingStatus.ALL
    },
    page: 1,
    per_page: 10,
  });
  const setFilter = useCallback(
    (filterPatch: Partial<ListBookingRequest['filter']>) => {
      setParams((draft) => {
        // 🚨 QUAN TRỌNG: Reset page về 1 khi filter thay đổi
        draft.page = 1;
        // Merge filter mới vào draft.filter (sử dụng logic Immer)
        draft.filter = {
          ...draft.filter,
          ...filterPatch,
        };
      });
    },
    [setParams]
  );
  const query = useInfiniteBookingList(params);

  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);

  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  const [detail,setDetail] = useState<BookingItem | null>(null);

  const bottomDetailBookingRef = useRef<BottomSheetModal>(null);

  const openDetail = useCallback((item: BookingItem) => {
    bottomDetailBookingRef.current?.present();
    setDetail(item);
  },[]);

  const closeDetail = useCallback(() => {
    bottomDetailBookingRef.current?.close();
    setDetail(null);
  },[]);




  return {
    ...query,
    data,
    pagination,
    params, // Trả về params hiện tại để dễ debug/hiển thị
    setFilter, // Trả về hàm setFilter để component sử dụng
    detail,
    openDetail,
    closeDetail,
    refDetail: bottomDetailBookingRef
  };
};