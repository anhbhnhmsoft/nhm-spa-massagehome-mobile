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

export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

const isResultRelevant = (formattedAddress: string, query: string): boolean => {
  if (!formattedAddress || !query) return false;
  const normAddress = removeVietnameseTones(formattedAddress);
  const normQuery = removeVietnameseTones(query);
  const queryTokens = normQuery.split(/\s+/).filter((t) => t.length >= 2);

  if (queryTokens.length === 0) return true;

  // Lọc bỏ các từ đệm quá phổ biến để so sánh chính xác hơn
  const stopWords = new Set(['duong', 'ngo', 'ngach', 'pho', 'phuong', 'quan', 'tinh', 'thanh']);
  const keyTokens = queryTokens.filter((t) => !stopWords.has(t));
  const targetTokens = keyTokens.length > 0 ? keyTokens : queryTokens;

  const matchedCount = targetTokens.filter((token) => normAddress.includes(token)).length;

  if (targetTokens.length >= 2) {
    return matchedCount >= Math.ceil(targetTokens.length * 0.5);
  }
  return matchedCount > 0;
};

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

      const userLat = locationRef.current?.location?.coords?.latitude;
      const userLng = locationRef.current?.location?.coords?.longitude;

      // Kiểm tra xem vị trí người dùng có nằm trong lãnh thổ Việt Nam hay không
      const isValidVNLocation =
        typeof userLat === 'number' &&
        typeof userLng === 'number' &&
        userLat >= 8.0 &&
        userLat <= 24.0 &&
        userLng >= 102.0 &&
        userLng <= 110.0;

      // Tọa độ định vị: Ưu tiên GPS thực tế của user (nếu ở VN). Nếu ở Simulator hoặc GPS chưa load, mặc định tọa độ Hà Nội (21.0285, 105.8542)
      const lat = isValidVNLocation ? userLat : 21.0285;
      const lng = isValidVNLocation ? userLng : 105.8542;

      const executeQuery = (queryStr: string, isFallback = false) => {
        mutateSearchLocation(
          {
            keyword: queryStr,
            latitude: lat,
            longitude: lng,
          },
          {
            onSuccess: (res: any) => {
              if (latestKeywordRef.current !== trimmedText) return;

              let dataItems: SearchLocation[] = [];
              if (Array.isArray(res)) {
                dataItems = res;
              } else if (Array.isArray(res?.data)) {
                dataItems = res.data;
              } else if (Array.isArray(res?.data?.data)) {
                dataItems = res.data.data;
              }

              // Lọc bỏ các địa chỉ rác/không phù hợp với từ khóa người dùng gõ
              const relevantItems = dataItems.filter((item) =>
                isResultRelevant(item?.formatted_address, trimmedText)
              );

              // Nếu tìm có dấu bị API trả kết quả lạc đề (như Chu Văn An khi gõ Văn Tiến Dũng) hoặc 0 kết quả,
              // tự động thử lại bằng từ khóa không dấu (dùng index rộng hơn của Goong API)
              const unaccented = removeVietnameseTones(trimmedText);
              if (!isFallback && relevantItems.length === 0 && unaccented !== trimmedText.toLowerCase()) {
                executeQuery(unaccented, true);
                return;
              }

              setResults(relevantItems.length > 0 ? relevantItems : dataItems);
              setSearchedKeyword(trimmedText);
            },
            onError: () => {
              if (latestKeywordRef.current !== trimmedText) return;
              const unaccented = removeVietnameseTones(trimmedText);
              if (!isFallback && unaccented !== trimmedText.toLowerCase()) {
                executeQuery(unaccented, true);
                return;
              }
              setSearchedKeyword(trimmedText);
            },
          }
        );
      };

      executeQuery(trimmedText);
    },
    [mutateSearchLocation]
  );

  // Khởi tạo Debounce 300ms ổn định hoàn toàn không bị reset/cancel khi re-render
  useEffect(() => {
    debouncedSearchRef.current = debounce((text: string) => {
      performSearch(text);
    }, 300);

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

    // Xóa ngay kết quả cũ nếu từ khóa đã thay đổi để tránh hiển thị sai lệch data của từ khóa cũ
    if (trimmed !== searchedKeyword) {
      setResults([]);
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
