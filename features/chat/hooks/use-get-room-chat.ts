// Hook để lấy thông tin phòng chat
import { useMutationGetRoomId, useMutationSeenMessages } from '@/features/chat/hooks/use-mutation';
import { useApplicationStore } from '@/features/app/stores';
import useChatStore from '@/features/chat/stores';
import useErrorToast from '@/features/app/hooks/use-error-toast';
import { useCheckAuthToRedirect } from '@/features/auth/hooks';
import { JoinRoomRequest } from '@/features/chat/types';
import { router } from 'expo-router';

export const useGetRoomChat = () => {
  const { mutate: getRoomId } = useMutationGetRoomId();
  const { mutate: seenMessages } = useMutationSeenMessages();
  const setLoading = useApplicationStore((state) => state.setLoading);
  const setRoom = useChatStore((state) => state.setRoom);
  const handleError = useErrorToast();
  const checkRedirect = useCheckAuthToRedirect();

  // Hàm tham gia phòng chat
  return (params: JoinRoomRequest, forWho: 'ktv' | 'customer' = 'customer') => {
    checkRedirect(() => {
      setLoading(true);
      getRoomId(params, {
        onSuccess: (res) => {
          const data = res.data;
          setRoom(data);
          // Đánh dấu tin nhắn đọc trong phòng chat
          seenMessages(data.id, {
            onSuccess: () => {
              setLoading(false);
              if (forWho === 'customer') {
                router.push('/(app)/(customer)/(service)/chat');
              } else {
                router.push('/(app)/(ktv)/(service)/chat');
              }
            },
            onError: (error) => {
              setLoading(false);
              handleError(error);
            },
          });
        },
        onError: (error) => {
          setLoading(false);
          handleError(error);
        },
      });
    });
  };
};
