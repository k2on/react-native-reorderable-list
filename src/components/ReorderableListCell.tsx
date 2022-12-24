import React from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated from 'react-native-reanimated';

import ReorderableCellContext from '@library/contexts/ReorderableCellContext';
import {ItemOffset} from '@library/types/misc';
import useReorderableListCell from '@library/hooks/useReorderableListCell';

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
  const {contextValue, animatedStyle, handleLayout} = useReorderableListCell({
    index,
    startDrag,
    onLayout,
    itemOffset,
    dragY,
    itemDragged,
    itemReleased,
    animationDuration,
  });

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
