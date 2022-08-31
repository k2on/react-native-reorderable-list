import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import ReorderableCellContext from '@library/context/ReorderableCellContext';
import useLibraryContext from '@library/hooks/useLibraryContext';

interface UseAnimatedCellStyleArgs {
  index: number;
  draggedIndex: Animated.SharedValue<number>;
}

const useAnimatedCellStyle = ({
  index,
  draggedIndex,
}: UseAnimatedCellStyleArgs) => {
  const {animationDuration, currentIndex, itemsY, draggedHeight, dragged} =
    useLibraryContext(ReorderableCellContext);

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

  return useAnimatedStyle(() => {
    return {
      zIndex: zIndex.value,
      transform: [{translateY: dragY.value}, {translateY: positionY.value}],
    };
  });
};

export default useAnimatedCellStyle;
