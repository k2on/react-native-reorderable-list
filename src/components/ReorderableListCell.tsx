import React, {useEffect, useMemo} from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated, {cancelAnimation, useSharedValue, useWorkletCallback} from 'react-native-reanimated';

import DragContext from '@library/context/DragContext';
import DraggedContext from '@library/context/DraggedContext';
import useAnimatedCellStyle from '@library/hooks/useAnimatedCellStyle';
import {ItemOffset} from '@library/types/misc';

interface ReorderableListCellProps {
  index: number;
  startDrag: (index: number) => void;
  itemOffset: Animated.SharedValue<ItemOffset | undefined>;
  dragY: Animated.SharedValue<number>,
  itemDragged: Animated.SharedValue<boolean>,
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
}) => {
  const drag = useWorkletCallback(() => startDrag(index), [index]);
  const draggedContextValue = useMemo(
    () => ({index}),
    [index],
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
    <DragContext.Provider value={drag}>
      <DraggedContext.Provider value={draggedContextValue}>
        <Animated.View style={style} onLayout={handleLayout}>
          {children}
        </Animated.View>
      </DraggedContext.Provider>
    </DragContext.Provider>
  );
};

export default React.memo(
  ReorderableListCell,
  (prev, next) => prev.item === next.item && prev.extraData === next.extraData,
);
