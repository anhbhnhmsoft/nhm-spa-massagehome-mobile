import useDebounce from '@/features/app/hooks/use-debounce';
import {
  useMutationDeleteAddress,
  useMutationDetailLocation,
  useMutationEditAddress,
  useMutationSaveAddress,
  useMutationSearchLocation,
} from '@/features/location/hooks/use-mutation';
import locationApi from '@/features/location/api';
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
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const handleError = useErrorToast();
  const location = useApplicationStore((s) => s.location);

  // Ref lưu giữ location để tránh recreate performSearch/debounce khi GPS cập nhật
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Ref lưu giữ AbortController của request tìm kiếm đang chạy để huỷ khi có request mới
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref lưu giữ từ khóa mới nhất để chống Race Condition khi gõ phím nhanh
  const latestKeywordRef = useRef<string>('');

  const { mutate: mutateDetailLocation, isPending: isLoadingDetail } = useMutationDetailLocation();

  // Hàm thực thi tìm kiếm thực tế với API
  const executeSearch = useCallback(async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setSearchedKeyword('');
      setIsSearching(false);
      return;
    }

    // Huỷ request cũ đang chạy (nếu có)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);

    const userLat = locationRef.current?.location?.coords?.latitude;
    const userLng = locationRef.current?.location?.coords?.longitude;

    const isValidVNLocation =
      typeof userLat === 'number' &&
      typeof userLng === 'number' &&
      userLat >= 8.0 &&
      userLat <= 24.0 &&
      userLng >= 102.0 &&
      userLng <= 110.0;

    const lat = isValidVNLocation ? userLat : 21.0285;
    const lng = isValidVNLocation ? userLng : 105.8542;

    const fetchQuery = async (searchStr: string, isFallback = false): Promise<void> => {
      try {
        const res = await locationApi.search(
          {
            keyword: searchStr,
            latitude: lat,
            longitude: lng,
          },
          controller.signal
        );

        // Nếu keyword đã thay đổi (user gõ tiếp từ khác), bỏ qua kết quả này
        if (latestKeywordRef.current !== trimmed) {
          return;
        }

        let dataItems: SearchLocation[] = [];
        if (Array.isArray(res)) {
          dataItems = res;
        } else if (Array.isArray((res as any)?.data)) {
          dataItems = (res as any).data;
        } else if (Array.isArray((res as any)?.data?.data)) {
          dataItems = (res as any).data.data;
        }

        // Lọc bỏ các địa chỉ rác/không phù hợp với từ khóa người dùng gõ
        const relevantItems = dataItems.filter((item) =>
          isResultRelevant(item?.formatted_address, trimmed)
        );

        // Nếu tìm có dấu bị 0 kết quả hoặc kết quả không khớp, tự động fallback sang từ khóa không dấu
        const unaccented = removeVietnameseTones(trimmed);
        if (!isFallback && relevantItems.length === 0 && unaccented !== trimmed.toLowerCase()) {
          return await fetchQuery(unaccented, true);
        }

        setResults(relevantItems.length > 0 ? relevantItems : dataItems);
        setSearchedKeyword(trimmed);
        setIsSearching(false);
      } catch (err: any) {
        // Nếu là do huỷ request (Abort) thì bỏ qua
        if (controller.signal.aborted || err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
          return;
        }

        // Nếu là lỗi khác, thử fallback không dấu nếu chưa thử
        const unaccented = removeVietnameseTones(trimmed);
        if (!isFallback && unaccented !== trimmed.toLowerCase()) {
          return await fetchQuery(unaccented, true);
        }

        if (latestKeywordRef.current === trimmed) {
          setResults([]);
          setSearchedKeyword(trimmed);
          setIsSearching(false);
        }
      }
    };

    await fetchQuery(trimmed);
  }, []);

  // Debounced search ổn định, không bao giờ bị re-create hay cancel oan uổng khi state re-render
  const debouncedSearch = useMemo(
    () =>
      debounce((text: string) => {
        executeSearch(text);
      }, 300),
    [executeSearch]
  );

  // Huỷ debounce và abort request khi unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedSearch]);

  // Hàm clear keyword
  const clearKeyword = useCallback(() => {
    latestKeywordRef.current = '';
    debouncedSearch.cancel();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setKeyword('');
    setSearchedKeyword('');
    setResults([]);
    setSelectedPlaceId(null);
    setIsSearching(false);
  }, [debouncedSearch]);

  // Xử lý khi text thay đổi
  const handleChangeText = useCallback(
    (text: string) => {
      setKeyword(text);
      const trimmed = text.trim();
      latestKeywordRef.current = trimmed;

      if (trimmed.length < 2) {
        debouncedSearch.cancel();
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        setResults([]);
        setSearchedKeyword('');
        setIsSearching(false);
        return;
      }

      // Xóa ngay kết quả cũ nếu từ khóa đã thay đổi để tránh hiển thị sai lệch data của từ khóa cũ
      if (trimmed !== searchedKeyword) {
        setResults([]);
      }

      debouncedSearch(trimmed);
    },
    [debouncedSearch, searchedKeyword]
  );

  // Xử lý khi chọn 1 location từ kết quả
  const handleSelect = useCallback(
    (data: SearchLocation, callback: (detail: DetailLocation) => void) => {
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
    },
    [clearKeyword, handleError, mutateDetailLocation]
  );

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
export const useListLocation = (visible: boolean = true) => {
  const setItemAddress = useStoreLocation((s) => s.setItemAddress);
  const refresh_list = useStoreLocation((s) => s.refresh_list);
  const setRefreshList = useStoreLocation((s) => s.setRefreshList);
  const setLoading = useApplicationStore((s) => s.setLoading);
  const { mutate: mutateDeleteAddress } = useMutationDeleteAddress();
  const status = useAuthStore((s) => s.status);
  const handleError = useErrorToast();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const location = useApplicationStore((s) => s.location);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const getCurrentLocation = useGetLocation();

  useEffect(() => {
    // Nếu không auth, quay lại trang trước
    if (status === _AuthStatus.UNAUTHORIZED) {
      goBack();
      return;
    }
  }, [status]);

  // Ngay khi mở modal / màn hình "Địa chỉ đã lưu" (visible === true):
  // Chủ động lấy/làm mới vị trí GPS hiện tại ngay lập tức để sẵn sàng từ sớm
  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          if (!location) {
            setIsLocating(true);
          }
          await getCurrentLocation();
        } catch {
          // Bỏ qua lỗi ngầm khi dò vị trí
        } finally {
          setIsLocating(false);
        }
      })();
    }
  }, [visible]);

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

  return {
    queryList,
    createHandler,
    editHandler,
    deleteHandler,
    showSaveModal,
    closeSaveModal,
    location,
    isLocating,
    getCurrentLocation,
  };
};

// Hook cho trang thêm/sửa location
export const useSaveLocation = (onSuccess: () => void) => {
  const item_address = useStoreLocation((s) => s.item_address);
  const setRefreshList = useStoreLocation((s) => s.setRefreshList);
  const setItemAddress = useStoreLocation((s) => s.setItemAddress);
  const getProfile = useGetProfile();
  const currentLocation = useApplicationStore((s) => s.location);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const getCurrentLocation = useGetLocation();

  const { t } = useTranslation();

  // Mutation lưu địa chỉ
  const { mutate: mutateSaveAddress, isPending: isSaving } = useMutationSaveAddress();

  // Mutation sửa địa chỉ
  const { mutate: mutateEditAddress, isPending: isEditing } = useMutationEditAddress();

  // Form validation
  const form = useForm<SaveAddressRequest>({
    defaultValues: {
      address: item_address?.address || currentLocation?.address || '',
      latitude:
        Number(item_address?.latitude) ||
        (currentLocation?.location?.coords?.latitude
          ? Number(currentLocation.location.coords.latitude)
          : undefined),
      longitude:
        Number(item_address?.longitude) ||
        (currentLocation?.location?.coords?.longitude
          ? Number(currentLocation.location.coords.longitude)
          : undefined),
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
    if (item_address) {
      form.reset({
        address: item_address.address || '',
        latitude: Number(item_address.latitude) || undefined,
        longitude: Number(item_address.longitude) || undefined,
        desc: item_address.desc || '',
      });
    } else {
      // Khi thêm địa chỉ mới (!item_address)
      if (currentLocation?.address && currentLocation.location?.coords) {
        form.reset({
          address: currentLocation.address,
          latitude: Number(currentLocation.location.coords.latitude),
          longitude: Number(currentLocation.location.coords.longitude),
          desc: '',
        });
      } else {
        // Tự động lấy vị trí hiện tại ngầm nếu chưa có trong store
        form.reset({
          address: '',
          latitude: undefined,
          longitude: undefined,
          desc: '',
        });
        (async () => {
          try {
            setIsLocating(true);
            const loc = await getCurrentLocation();
            if (loc?.address && loc.location?.coords) {
              form.setValue('address', loc.address, { shouldValidate: true });
              form.setValue('latitude', Number(loc.location.coords.latitude), { shouldValidate: true });
              form.setValue('longitude', Number(loc.location.coords.longitude), { shouldValidate: true });
            }
          } catch {
            // Im lặng khi tự động dò vị trí lần đầu
          } finally {
            setIsLocating(false);
          }
        })();
      }
    }
  }, [item_address]);

  // Cập nhật nếu currentLocation trong store vừa load xong
  useEffect(() => {
    if (
      !item_address &&
      !form.getValues('address') &&
      currentLocation?.address &&
      currentLocation.location?.coords
    ) {
      form.setValue('address', currentLocation.address, { shouldValidate: true });
      form.setValue('latitude', Number(currentLocation.location.coords.latitude), { shouldValidate: true });
      form.setValue('longitude', Number(currentLocation.location.coords.longitude), { shouldValidate: true });
    }
  }, [currentLocation]);

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
      setIsLocating(true);
      const location = await getCurrentLocation();
      if (location?.address && location.location?.coords) {
        form.setValue('address', location.address, { shouldValidate: true });
        form.setValue('latitude', Number(location.location.coords.latitude), { shouldValidate: true });
        form.setValue('longitude', Number(location.location.coords.longitude), { shouldValidate: true });
      }
    } catch {
      Alert.alert(
        t('location.error.title'),
        t('location.error.current_location_failed')
      );
    } finally {
      setIsLocating(false);
    }
  };

  return {
    item_address,
    form,
    submit,
    isEdit: Boolean(item_address),
    setLocationCurrent,
    isLocating,
    loading: isSaving || isEditing,
  };
};
