import useDebounce from '@/features/app/hooks/use-debounce';
import {
  useMutationDeleteAddress,
  useMutationDetailLocation,
  useMutationEditAddress,
  useMutationSaveAddress,
  useMutationSearchLocation,
} from '@/features/location/hooks/use-mutation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAndFormatLocation, useLocationAddress } from '@/features/app/hooks/use-location';
import {
  AddressItem,
  DetailLocation,
  ListAddressRequest,
  SaveAddressRequest,
  SearchLocation,
} from '@/features/location/types';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useApplicationStore from '@/lib/store';
import { useInfinityAddressList } from '@/features/location/hooks/use-query';
import { useTranslation } from 'react-i18next';
import { useCheckAuth, useGetProfile } from '@/features/auth/hooks';
import { router } from 'expo-router';
import useStoreLocation from '@/features/location/stores';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert } from 'react-native';
import { getMessageError } from '@/lib/utils';

// Hook quản lý tìm kiếm location
export const useSearchLocation = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [results, setResults] = useState<SearchLocation[]>([]);
  const handleError = useErrorToast();
  const { location } = useLocationAddress();

  const {
    mutate: mutateSearchLocation,
    isPending: isSearching, // Đổi tên isPending thành isSearching để dễ dùng
  } = useMutationSearchLocation();

  const { mutate: mutateDetailLocation, isPending: isLoadingDetail } = useMutationDetailLocation();

  // Hàm clear keyword
  const clearKeyword = useCallback(() => {
    setKeyword('');
    setResults([]);
  }, []);

  // Hàm search thực tế
  const performSearch = useCallback(
    (text: string) => {
      if (!text || text.length < 2) {
        setResults([]);
        return;
      }

      mutateSearchLocation(
        {
          keyword: text,
          // Dùng optional chaining cẩn thận hoặc fallback undefined
          latitude: location?.location?.coords?.latitude ?? undefined,
          longitude: location?.location?.coords?.longitude ?? undefined,
        },
        {
          onSuccess: (res) => {
            // React Query trả về data, ta set vào state
            // Lưu ý: Đảm bảo res.data đúng format array
            setResults(res.data || []);
          },
        }
      );
    },
    [location, mutateSearchLocation]
  );

  // Debounce:
  const debouncedSearch = useDebounce(performSearch, 600, [performSearch]);

  // Xử lý khi text thay đổi
  const handleChangeText = (text: string) => {
    setKeyword(text);

    if (text.length === 0) {
      setResults([]);
      return;
    }

    // Gọi debounce
    debouncedSearch(text);
  };

  // Xử lý khi chọn 1 location từ kết quả
  const handleSelect = (data: SearchLocation, callback: (detail: DetailLocation) => void) => {
    mutateDetailLocation(
      { place_id: data.place_id },
      {
        onSuccess: (res) => {
          clearKeyword();
          callback(res.data);
        },
        onError: (err) => {
          handleError(err);
        },
      }
    );
  };

  return {
    keyword,
    results,
    loading: isSearching || isLoadingDetail,
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
  const checkAuth = useCheckAuth();
  const handleError = useErrorToast();
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    // Nếu không auth, quay lại trang trước
    if (!checkAuth) {
      router.back();
      return;
    }
  }, [checkAuth]);

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
  };
};

// Hook cho trang thêm/sửa location
export const useSaveLocation = (onSuccess: () => void) => {
  const item_address = useStoreLocation((s) => s.item_address);
  const setRefreshList = useStoreLocation((s) => s.setRefreshList);
  const setItemAddress = useStoreLocation((s) => s.setItemAddress);
  const getProfile = useGetProfile();

  const { t } = useTranslation();

  // Mutation lưu địa chỉ
  const { mutate: mutateSaveAddress, isPending: isSaving } = useMutationSaveAddress();

  // Mutation sửa địa chỉ
  const { mutate: mutateEditAddress, isPending: isEditing } = useMutationEditAddress();

  const form = useForm<SaveAddressRequest>({
    defaultValues: {
      address: item_address?.address || '',
      latitude: Number(item_address?.latitude) || undefined,
      longitude: Number(item_address?.longitude) || undefined,
      desc: item_address?.desc || '',
      is_primary: item_address?.is_primary || false,
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
        is_primary: z.boolean(),
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
      is_primary: item_address?.is_primary || false,
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
      const location = await fetchAndFormatLocation();
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
