import {useContext, useEffect} from 'react';
import {useWorkletCallback} from 'react-native-reanimated';

import DraggedContext from '@library/context/DraggedContext';
import HandlersContext from '@library/context/HandlersContext';

interface UseAnimatedDragHandlers {
  onStart?: () => void;
  onRelease?: () => void;
  onEnd?: () => void;
}

const emptyWorklet = () => {
  'worklet';
};

const useAnimatedDrag = (
  {onStart, onRelease, onEnd}: UseAnimatedDragHandlers,
  deps?: ReadonlyArray<any>,
) => {
  const {index} = useContext(DraggedContext);
  const {setHandlers, removeHandlers} = useContext(HandlersContext);

  // TODO: can be improved?
  const start = useWorkletCallback(onStart || emptyWorklet, deps);
  const release = useWorkletCallback(onRelease || emptyWorklet, deps);
  const end = useWorkletCallback(onEnd || emptyWorklet, deps);

  useEffect(() => {
    const handlersRef = setHandlers(index, {start, release, end});
    return () => removeHandlers(index, handlersRef);
  }, [setHandlers, removeHandlers, index, start, release, end]);
};

export default useAnimatedDrag;
