import useDebounce from '@/features/app/hooks/use-debounce';
import {
  useMutationDetailLocation,
  useMutationSearchLocation,
} from '@/features/location/hooks/use-mutation';
import { useCallback, useState } from 'react';
import { useLocationAddress } from '@/features/app/hooks/use-location';
import { DetailLocation, SearchLocation } from '@/features/location/types';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import useApplicationStore from '@/lib/store';

export const useSearchLocation = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [results, setResults] = useState<SearchLocation[]>([]);
  const setLoadingApp = useApplicationStore((s) => s.setLoading);
  const handleError = useErrorToast();
  const { location } = useLocationAddress();

  const {
    mutate: mutateSearchLocation,
    isPending: isSearching // Đổi tên isPending thành isSearching để dễ dùng
  } = useMutationSearchLocation();

  const { mutate: mutateDetailLocation } = useMutationDetailLocation();

  // Hàm clear keyword
  const clearKeyword = useCallback(() => {
    setKeyword('');
    setResults([]);
  }, []);

  // Hàm search thực tế
  const performSearch = useCallback((text: string) => {
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
  }, [location, mutateSearchLocation]);

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
    setLoadingApp(true); // Loading toàn app (Overlay)

    mutateDetailLocation(
      { place_id: data.place_id },
      {
        onSuccess: (res) => {
          callback(res.data);
        },
        onError: (err) => {
          handleError(err);
        },
        onSettled: () => {
          setLoadingApp(false);
        },
      }
    );
  };

  return {
    keyword,
    results,
    loading: isSearching,
    setKeyword,
    handleChangeText,
    clearKeyword,
    handleSelect,
  };
};
