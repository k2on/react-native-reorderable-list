import React, {useContext} from 'react';
import Animated from 'react-native-reanimated';

import {ReorderableCellContext} from '@library/hooks/useReorderableCell';

interface DraggedContextData {
  index: number;
  draggedIndex: Animated.SharedValue<number>;
}

export const DraggedContext = React.createContext<DraggedContextData>(
  undefined as any,
);

const useDragSharedValue = () => {
  const {index} = useContext(DraggedContext);
  const {dragged} = useContext(ReorderableCellContext);

  return dragged[index];
};

export default useDragSharedValue;
