import React, {useMemo} from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  useWorkletCallback,
  withTiming,
} from 'react-native-reanimated';

import ReorderableCellContext from '@library/contexts/ReorderableCellContext';
import {ItemOffset} from '@library/types/misc';
import useLibraryContext from '@library/hooks/useLibraryContext';
import ReorderableListContext from '@library/contexts/ReorderableListContext';

interface ReorderableListCellProps<T, U> {
  index: number;
  startDrag: (index: number) => void;
  itemOffset: Animated.SharedValue<ItemOffset | undefined>;
  dragY: Animated.SharedValue<number>;
  itemDragged: Animated.SharedValue<boolean>;
  itemReleased: Animated.SharedValue<boolean>;
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  // animation duration as a shared value allows to avoid re-renders on value change
  animationDuration: Animated.SharedValue<number>;
  item: T;
  extraData: U;
}

const ReorderableListCell = <T, U>({
  index,
  startDrag,
  children,
  onLayout,
  itemOffset,
  dragY,
  itemDragged,
  itemReleased,
  animationDuration,
}: ReorderableListCellProps<T, U>) => {
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

  return (
    <ReorderableCellContext.Provider value={contextValue}>
      <Animated.View style={animatedStyle} onLayout={handleLayout}>
        {children}
      </Animated.View>
    </ReorderableCellContext.Provider>
  );
};

export default React.memo(
  ReorderableListCell,
  (prev, next) => prev.item === next.item && prev.extraData === next.extraData,
);
