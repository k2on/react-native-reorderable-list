import React, {useContext} from 'react';
import Animated, {
  withTiming,
  Easing,
  useSharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';

import {DraggedContext} from '@library/hooks/useDragSharedValue';

interface ReorderableCellContextData {
  animationDuration: number;
  draggedHeight: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  itemsY: Animated.SharedValue<number>[];
  dragged: Animated.SharedValue<boolean>[];
}

export const ReorderableCellContext =
  React.createContext<ReorderableCellContextData>(undefined as any);

const useReorderableCell = () => {
  const {draggedIndex, index} = useContext(DraggedContext);
  const {animationDuration, currentIndex, itemsY, draggedHeight, dragged} =
    useContext(ReorderableCellContext);

  const zIndex = useSharedValue(0);
  const positionY = useSharedValue(0);
  const itemIndex = useSharedValue(index);
  const dragY = itemsY[index];
  const itemDragged = dragged[index];

  useAnimatedReaction(
    () => currentIndex.value,
    () => {
      if (
        itemIndex.value !== draggedIndex.value &&
        currentIndex.value >= 0 &&
        draggedIndex.value >= 0
      ) {
        const moveDown = currentIndex.value > draggedIndex.value;
        const startMove = Math.min(draggedIndex.value, currentIndex.value);
        const endMove = Math.max(draggedIndex.value, currentIndex.value);
        let newValue = 0;

        if (itemIndex.value >= startMove && itemIndex.value <= endMove) {
          newValue = moveDown ? -draggedHeight.value : draggedHeight.value;
        }

        if (newValue !== positionY.value) {
          positionY.value = withTiming(newValue, {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
          });
        }
      } else if (positionY.value !== 0) {
        positionY.value = 0;
      }
    },
  );

  useAnimatedReaction(
    () => itemDragged.value,
    () => {
      zIndex.value = itemDragged.value ? 999 : 0;
    },
  );

  return {animationDuration, zIndex, positionY, dragY};
};

export default useReorderableCell;
