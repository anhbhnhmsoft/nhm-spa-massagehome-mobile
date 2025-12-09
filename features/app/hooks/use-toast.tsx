import { Toast } from 'toastify-react-native'
import {useCallback} from "react";
import {ToastShowParams} from "toastify-react-native/utils/interfaces";

type SetMessage = {
  title?: string,
  message: string,
}
type ToastOptions = Omit<ToastShowParams, 'type' | 'text1' | 'text2' >;

const useToast = () => {
  const success = useCallback((set: SetMessage, option?: ToastOptions) => {
    Toast.show({
      type:"success",
      text1: set.title,
      text2: set.message,
      position:'top',
      visibilityTime:3000,
      autoHide: true,
      onPress: () => Toast.hide(),
      ...option
    })
  },[]);
  const error = useCallback((set: SetMessage, option?: ToastOptions) => {
    Toast.show({
      type:"error",
      text1: set.title,
      text2: set.message,
      position:'top',
      visibilityTime:3000,
      autoHide: true,
      onPress: () => Toast.hide(),
      ...option
    })
  },[]);

  const warning = useCallback((set: SetMessage, option?: ToastOptions) => {
    Toast.show({
      type:"warn",
      text1: set.title,
      text2: set.message,
      position:'top',
      visibilityTime:3000,
      autoHide: true,
      onPress: () => Toast.hide(),
      ...option
    })
  },[]);

  const info = useCallback((set: SetMessage, option?: ToastOptions) => {
    Toast.show({
      type:"info",
      text1: set.title,
      text2: set.message,
      position:'top',
      visibilityTime:3000,
      autoHide: true,
      onPress: () => Toast.hide(),
      ...option
    })
  },[]);

  return {
    success,
    error,
    warning,
    info
  }
}

export default useToast;