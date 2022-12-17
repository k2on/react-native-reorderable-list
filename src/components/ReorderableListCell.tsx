import React, {useMemo} from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated, {useWorkletCallback} from 'react-native-reanimated';

import ReorderableCellContext from '@library/contexts/ReorderableCellContext';
import useAnimatedCellStyle from '@library/hooks/useAnimatedCellStyle';
import {ItemOffset} from '@library/types/misc';

interface ReorderableListCellProps {
  index: number;
  startDrag: (index: number) => void;
  itemOffset: Animated.SharedValue<ItemOffset | undefined>;
  dragY: Animated.SharedValue<number>;
  itemDragged: Animated.SharedValue<boolean>;
  itemReleased: Animated.SharedValue<boolean>;
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  // TODO: set type
  item: any;
  extraData: any;
}

const ReorderableListCell: React.FC<ReorderableListCellProps> = ({
  index,
  startDrag,
  children,
  onLayout,
  itemOffset,
  dragY,
  itemDragged,
  itemReleased,
}) => {
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

  const style = useAnimatedCellStyle({
    index,
    dragY,
    itemDragged,
  });

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
      <Animated.View style={style} onLayout={handleLayout}>
        {children}
      </Animated.View>
    </ReorderableCellContext.Provider>
  );
};

export default React.memo(
  ReorderableListCell,
  (prev, next) => prev.item === next.item && prev.extraData === next.extraData,
);
