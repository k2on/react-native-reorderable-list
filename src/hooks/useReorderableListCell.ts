import {useMemo} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  useWorkletCallback,
  withTiming,
} from 'react-native-reanimated';

import ReorderableListContext from '../contexts/ReorderableListContext';
import useLibraryContext from '../hooks/useLibraryContext';
import type {ItemOffset} from '../types/misc';

interface UseReorderableListCellArgs {
  index: number;
  startDrag: (index: number) => void;
  itemOffset: Animated.SharedValue<ItemOffset | undefined>;
  dragY: Animated.SharedValue<number>;
  itemDragged: Animated.SharedValue<boolean>;
  itemReleased: Animated.SharedValue<boolean>;
  onLayout?: (e: LayoutChangeEvent) => void;
  // animation duration as a shared value allows to avoid re-renders on value change
  animationDuration: Animated.SharedValue<number>;
}

const useReorderableListCell = ({
  index,
  startDrag,
  itemOffset,
  dragY,
  itemDragged,
  itemReleased,
  onLayout,
  // animation duration as a shared value allows to avoid re-renders on value change
  animationDuration,
}: UseReorderableListCellArgs) => {
  const dragHandler = useWorkletCallback(() => startDrag(index), [index]);
  const contextValue = useMemo(
    () => ({
      index,
      dragHandler,
      dragged: itemDragged,
      released: itemReleased,
    }),
    [index, dragHandler, itemDragged, itemReleased],
  );
  const {currentIndex, draggedIndex, draggedHeight} = useLibraryContext(
    ReorderableListContext,
  );

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
            duration: animationDuration.value,
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

  const animatedStyle = useAnimatedStyle(() => ({
    zIndex: itemZIndex.value,
    transform: [
      {translateY: itemDragY.value},
      {translateY: itemPositionY.value},
    ],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    itemOffset.value = {
      offset: e.nativeEvent.layout.y,
      length: e.nativeEvent.layout.height,
    };

    if (onLayout) {
      onLayout(e);
    }
  };

  return {contextValue, animatedStyle, handleLayout};
};

export default useReorderableListCell;
