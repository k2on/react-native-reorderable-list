import {useEffect, useRef} from 'react';
import Animated, {cancelAnimation, makeMutable} from 'react-native-reanimated';

function useSharedValuesArray<T>(
  initFunc: (index: number) => T,
  size: number,
): Animated.SharedValue<T>[] {
  const ref = useRef<Animated.SharedValue<T>[]>([]);
  const initFuncRef = useRef(initFunc);

  if (size !== 0 && ref.current.length === 0) {
    ref.current = [];
    for (let i = 0; i < size; i++) {
      ref.current[i] = makeMutable(initFunc(i));
    }
  }

  useEffect(() => {
    if (size > ref.current.length) {
      for (let i = ref.current.length; i < size; i++) {
        ref.current[i] = makeMutable(initFuncRef.current(i));
      }
    } else if (size < ref.current.length) {
      for (let i = size; i < ref.current.length; i++) {
        cancelAnimation(ref.current[i]);
      }

      ref.current.splice(size, ref.current.length - size);
    }
  }, [size]);

  useEffect(() => {
    return () => {
      for (let i = 0; i < ref.current.length; i++) {
        cancelAnimation(ref.current[i]);
      }
    };
  }, []);

  return ref.current;
}

export default useSharedValuesArray;
