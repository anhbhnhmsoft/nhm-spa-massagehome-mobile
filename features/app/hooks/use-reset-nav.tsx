import { router, Href } from 'expo-router';

const useResetNav = () => {
  return (back_to_path: Href) => {
    // Cách chuẩn Expo Router: Xóa stack và thay thế bằng path
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace(back_to_path);
  }
}

export default useResetNav;
