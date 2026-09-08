import useDebounce from '@/features/app/hooks/use-debounce';
import {
  useMutationDeleteAddress,
  useMutationDetailLocation,
  useMutationEditAddress,
  useMutationSaveAddress,
  useMutationSearchLocation,
} from '@/features/location/hooks/use-mutation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetLocation } from '@/features/app/hooks/use-location';
import {
  AddressItem,
  DetailLocation,
  ListAddressRequest,
  SaveAddressRequest,
  SearchLocation,
} from '@/features/location/types';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useApplicationStore } from '@/features/app/stores';
import { useInfinityAddressList } from '@/features/location/hooks/use-query';
import { useTranslation } from 'react-i18next';
import { useGetProfile } from '@/features/auth/hooks';
import useStoreLocation from '@/features/location/stores';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert } from 'react-native';
import { getMessageError, goBack } from '@/lib/utils';
import { _AuthStatus } from '@/features/auth/const';
import { useAuthStore } from '@/features/auth/stores';
import { debounce } from 'lodash';

// Hook quản lý tìm kiếm location
// Hook quản lý tìm kiếm location
export const useSearchLocation = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [searchedKeyword, setSearchedKeyword] = useState<string>('');
  const [results, setResults] = useState<SearchLocation[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const handleError = useErrorToast();
  const location = useApplicationStore((s) => s.location);

  // Ref lưu giữ location để tránh recreate performSearch/debounce khi GPS cập nhật
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Ref lưu giữ từ khóa mới nhất để chống Race Condition khi gõ phím nhanh
  const latestKeywordRef = useRef<string>('');
  const debouncedSearchRef = useRef<any>(null);

  const {
    mutate: mutateSearchLocation,
    isPending: isSearching,
  } = useMutationSearchLocation();

  const { mutate: mutateDetailLocation, isPending: isLoadingDetail } = useMutationDetailLocation();

  // Hàm clear keyword
  const clearKeyword = useCallback(() => {
    latestKeywordRef.current = '';
    setKeyword('');
    setSearchedKeyword('');
    setResults([]);
    setSelectedPlaceId(null);
    debouncedSearchRef.current?.cancel();
  }, []);

  // Hàm search thực tế
  const performSearch = useCallback(
    (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText || trimmedText.length < 2) {
        setResults([]);
        setSearchedKeyword('');
        return;
      }

      latestKeywordRef.current = trimmedText;

      // Không gửi latitude/longitude khi tìm kiếm theo từ khóa để đảm bảo kết quả nhất quán 100%
      // trên mọi thiết bị và vị trí (tránh việc API lọc bán kính gây mất kết quả ở tỉnh/thành khác)
      mutateSearchLocation(
        {
          keyword: trimmedText,
        },
        {
          onSuccess: (res: any) => {
            // Chống Race Condition: Chỉ chấp nhận kết quả nếu từ khóa vẫn là từ khóa mới nhất
            if (latestKeywordRef.current !== trimmedText) return;

            let dataItems: SearchLocation[] = [];
            if (Array.isArray(res)) {
              dataItems = res;
            } else if (Array.isArray(res?.data)) {
              dataItems = res.data;
            } else if (Array.isArray(res?.data?.data)) {
              dataItems = res.data.data;
            }
            setResults(dataItems);
            setSearchedKeyword(trimmedText);
          },
          onError: () => {
            // Chống Race Condition
            if (latestKeywordRef.current !== trimmedText) return;
            setSearchedKeyword(trimmedText);
          },
        }
      );
    },
    [mutateSearchLocation]
  );

  // Khởi tạo Debounce ổn định hoàn toàn không bị reset/cancel khi re-render hoặc vị trí thay đổi
  useEffect(() => {
    debouncedSearchRef.current = debounce((text: string) => {
      performSearch(text);
    }, 400);

    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, [performSearch]);

  // Xử lý khi text thay đổi
  const handleChangeText = (text: string) => {
    setKeyword(text);
    const trimmed = text.trim();
    latestKeywordRef.current = trimmed;

    if (trimmed.length < 2) {
      debouncedSearchRef.current?.cancel();
      setResults([]);
      setSearchedKeyword('');
      return;
    }

    debouncedSearchRef.current?.(trimmed);
  };

  // Xử lý khi chọn 1 location từ kết quả
  const handleSelect = (data: SearchLocation, callback: (detail: DetailLocation) => void) => {
    setSelectedPlaceId(data.place_id);
    mutateDetailLocation(
      { place_id: data.place_id },
      {
        onSuccess: (res: any) => {
          setSelectedPlaceId(null);
          clearKeyword();
          const detail = res?.data?.formatted_address
            ? res.data
            : res?.formatted_address
            ? res
            : null;
          if (detail) {
            callback(detail);
          } else {
            callback({
              place_id: data.place_id,
              formatted_address: data.formatted_address,
              latitude: 0,
              longitude: 0,
            });
          }
        },
        onError: (err) => {
          setSelectedPlaceId(null);
          clearKeyword();
          handleError(err);
          // Fallback để người dùng không bị kẹt ở màn hình tìm kiếm
          callback({
            place_id: data.place_id,
            formatted_address: data.formatted_address,
            latitude: 0,
            longitude: 0,
          });
        },
      }
    );
  };

  return {
    keyword,
    searchedKeyword,
    results,
    loading: isSearching || isLoadingDetail,
    isSearching,
    isLoadingDetail,
    selectedPlaceId,
    setKeyword,
    handleChangeText,
    clearKeyword,
    handleSelect,
  };
};

// Hook lấy danh sách địa chỉ phân trang
export const useGetListAddress = (params: ListAddressRequest) => {
  const query = useInfinityAddressList(params);
  const data = useMemo(() => {
    return query.data?.pages.flatMap((page) => page.data.data) || [];
  }, [query.data]);
  const pagination = useMemo(() => {
    return query.data?.pages[0].data || null;
  }, [query.data]);

  return {
    ...query,
    data,
    pagination,
  };
};

// Hook cho trang danh sách location
export const useListLocation = () => {
  const setItemAddress = useStoreLocation((s) => s.setItemAddress);
  const refresh_list = useStoreLocation((s) => s.refresh_list);
  const setRefreshList = useStoreLocation((s) => s.setRefreshList);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { mutate: mutateDeleteAddress } = useMutationDeleteAddress();
  const status = useAuthStore((s) => s.status);
  const handleError = useErrorToast();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const location = useApplicationStore((s) => s.location);

  useEffect(() => {
    // Nếu không auth, quay lại trang trước
    if (status === _AuthStatus.UNAUTHORIZED) {
      goBack();
      return;
    }
  }, [status]);

  useEffect(() => {
    // Nếu cần refresh danh sách
    if (refresh_list) {
      queryList.refetch();
      setRefreshList(false);
    }
  }, [refresh_list]);

  // Lấy danh sách địa chỉ
  const queryList = useGetListAddress({
    filter: {},
    page: 1,
    per_page: 20,
  });

  // Xử lý thêm
  const createHandler = () => {
    setItemAddress(null); // Clear dữ liệu cũ
    setShowSaveModal(true);
  };

  // Xử lý sửa
  const editHandler = (item: AddressItem) => {
    setItemAddress(item); // Set dữ liệu cũ
    setShowSaveModal(true);
  };

  // Xử lý đóng modal
  const closeSaveModal = () => {
    setItemAddress(null); // Clear dữ liệu cũ
    setShowSaveModal(false);
  };

  // Xử lý xóa
  const deleteHandler = (item: AddressItem) => {
    setLoading(true);
    mutateDeleteAddress(
      { id: item.id },
      {
        onSuccess: () => {
          // Xóa thành công, refresh lại danh sách
          queryList.refetch();
        },
        onError: (err) => {
          handleError(err);
        },
        onSettled: () => {
          setLoading(false);
        },
      }
    );
  };

  const getCurrentLocation = useGetLocation();

  return {
    queryList,
    createHandler,
    editHandler,
    deleteHandler,
    showSaveModal,
    closeSaveModal,
    location,
    getCurrentLocation
  };
};

// Hook cho trang thêm/sửa location
export const useSaveLocation = (onSuccess: () => void) => {
  const item_address = useStoreLocation((s) => s.item_address);
  const setRefreshList = useStoreLocation((s) => s.setRefreshList);
  const setItemAddress = useStoreLocation((s) => s.setItemAddress);
  const getProfile = useGetProfile();

  const getCurrentLocation = useGetLocation();

  const { t } = useTranslation();

  // Mutation lưu địa chỉ
  const { mutate: mutateSaveAddress, isPending: isSaving } = useMutationSaveAddress();

  // Mutation sửa địa chỉ
  const { mutate: mutateEditAddress, isPending: isEditing } = useMutationEditAddress();

  // Form validation
  const form = useForm<SaveAddressRequest>({
    defaultValues: {
      address: item_address?.address || '',
      latitude: Number(item_address?.latitude) || undefined,
      longitude: Number(item_address?.longitude) || undefined,
      desc: item_address?.desc || '',
    },
    resolver: zodResolver(
      z.object({
        address: z
          .string({ error: t('location.error.invalid_address') })
          .min(5, { error: t('location.error.invalid_address') })
          .max(255, { error: t('location.error.invalid_address') }),
        latitude: z
          .number({ error: t('location.error.invalid_location') })
          .min(-90)
          .max(90),
        longitude: z
          .number({ error: t('location.error.invalid_location') })
          .min(-180)
          .max(180),
        desc: z.string().optional(),
      })
    ),
  });

  useEffect(() => {
    // Cập nhật lại default values khi item_address thay đổi
    form.reset({
      address: item_address?.address || '',
      latitude: Number(item_address?.latitude) || undefined,
      longitude: Number(item_address?.longitude) || undefined,
      desc: item_address?.desc || '',
    });
  }, [item_address]);

  const submit = (data: SaveAddressRequest) => {
    if (item_address) {
      // Sửa địa chỉ
      mutateEditAddress(
        { id: item_address.id, ...data },
        {
          onSuccess: () => {
            // Sửa thành công, refresh lại danh sách
            setRefreshList(true);
            setItemAddress(null); // Clear dữ liệu cũ
            getProfile(); // Cập nhật lại thông tin user để luôn lấy địa chỉ mới nhất
            onSuccess();
          },
          onError: (err) => {
            const message = getMessageError(err, t);
            if (message){
              Alert.alert(
                t('location.error.title'),
                message
              );
            }
          },
        }
      );
    } else {
      // Lưu địa chỉ
      mutateSaveAddress(data, {
        onSuccess: () => {
          // Lưu thành công, refresh lại danh sách
          setRefreshList(true);
          setItemAddress(null); // Clear dữ liệu cũ
          getProfile(); // Cập nhật lại thông tin user để luôn lấy địa chỉ mới nhất
          onSuccess();
        },
        onError: (err) => {
          const message = getMessageError(err, t);
          if (message){
            Alert.alert(
              t('location.error.title'),
              message
            );
          }
        },
      });
    }
  };

  const setLocationCurrent = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        form.setValue('address', location.address);
        form.setValue('latitude', location.location.coords.latitude);
        form.setValue('longitude', location.location.coords.longitude);
      }
    } catch  {
      Alert.alert(
        t('location.error.title'),
        t('location.error.current_location_failed')
      );
    }
  }

  return {
    item_address,
    form,
    submit,
    isEdit: Boolean(item_address),
    setLocationCurrent,
    loading: isSaving || isEditing,
  };
};
