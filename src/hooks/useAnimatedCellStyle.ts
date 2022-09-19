import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import ReorderableListContext from '@library/context/ReorderableListContext';
import useLibraryContext from '@library/hooks/useLibraryContext';

interface UseAnimatedCellStyleArgs {
  index: number;
  dragY: Animated.SharedValue<number>;
  itemDragged: Animated.SharedValue<boolean>;
}

const useAnimatedCellStyle = ({
  index,
  dragY,
  itemDragged,
}: UseAnimatedCellStyleArgs) => {
  const {animationDuration, currentIndex, draggedIndex, draggedHeight} =
    useLibraryContext(ReorderableListContext);

  const itemZIndex = useSharedValue(0);
  const itemPositionY = useSharedValue(0);
  const itemDragY = useSharedValue(0);
  const itemIndex = useSharedValue(index);

  useAnimatedReaction(
    () => dragY.value,
    () => {
      if (
        itemIndex.value === draggedIndex.value &&
        currentIndex.value >= 0 &&
        draggedIndex.value >= 0
      ) {
        itemDragY.value = dragY.value;
      }
    },
  );

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

        if (newValue !== itemPositionY.value) {
          itemPositionY.value = withTiming(newValue, {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
          });
        }
      }
    },
  );

  useAnimatedReaction(
    () => itemDragged.value,
    () => {
      itemZIndex.value = itemDragged.value ? 999 : 0;
    },
  );

  return useAnimatedStyle(
    () => ({
      zIndex: itemZIndex.value,
      transform: [
        {translateY: itemDragY.value},
        {translateY: itemPositionY.value},
      ],
    }),
  );
};

export default useAnimatedCellStyle;
