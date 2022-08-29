import {useContext, useEffect} from 'react';
import {useWorkletCallback} from 'react-native-reanimated';

import DraggedContext from '@library/context/DraggedContext';
import SetHandlersContext from '@library/context/SetHandlersContext';

interface UseAnimatedDragHandlers {
  onStart?: () => void;
  onRelease?: () => void;
  onEnd?: () => void;
}

const useAnimatedDrag = (
  {onStart, onRelease, onEnd}: UseAnimatedDragHandlers,
  deps?: ReadonlyArray<any>,
) => {
  const {index} = useContext(DraggedContext);
  const {setHandlers, removeHandlers} = useContext(SetHandlersContext);

  const start = useWorkletCallback(onStart || (() => null), deps);
  const release = useWorkletCallback(onRelease || (() => null), deps);
  const end = useWorkletCallback(onEnd || (() => null), deps);

  useEffect(() => {
    const handlersRef = setHandlers(index, {start, release, end});
    return () => removeHandlers(index, handlersRef);
  }, [setHandlers, removeHandlers, index, start, release, end]);
};

export default useAnimatedDrag;
