import {useState} from 'react';
import {useAnimatedReaction, runOnJS} from 'react-native-reanimated';

import useDragSharedValue from '@library/hooks/useDragSharedValue';

const useDragState = () => {
  const [isDraggedState, setIsDraggedState] = useState(false);
  const isDragged = useDragSharedValue();

  useAnimatedReaction(
    () => isDragged.value,
    (newValue) => {
      if (newValue !== isDraggedState) {
        runOnJS(setIsDraggedState)(newValue);
      }
    },
    [isDraggedState],
  );

  return isDraggedState;
};

export default useDragState;
