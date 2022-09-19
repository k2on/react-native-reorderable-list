import {useEffect} from 'react';
import {useWorkletCallback} from 'react-native-reanimated';

import HandlersContext from '@library/contexts/HandlersContext';
import useLibraryContext from '@library/hooks/useLibraryContext';
import ReorderableCellContext from '@library/contexts/ReorderableCellContext';

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
  deps: ReadonlyArray<any> = [],
) => {
  const {index} = useLibraryContext(ReorderableCellContext);
  const {setHandlers, removeHandlers} = useLibraryContext(HandlersContext);

  // TODO: can it be improved?
  const start = useWorkletCallback(onStart || emptyWorklet, deps);
  const release = useWorkletCallback(onRelease || emptyWorklet, deps);
  const end = useWorkletCallback(onEnd || emptyWorklet, deps);

  useEffect(() => {
    const handlersRef = setHandlers(index, {start, release, end});
    return () => removeHandlers(index, handlersRef);
  }, [setHandlers, removeHandlers, index, start, release, end]);
};

export default useAnimatedDrag;
