import {  useRef } from 'react';
import { throttle } from 'lodash';

export const useSingleTouch = (callback: (...args: any[]) => void, wait = 1000) => {
  const throttledAction = useRef(
    throttle(callback, wait, { trailing: false, leading: true })
  );
  return throttledAction.current;
};