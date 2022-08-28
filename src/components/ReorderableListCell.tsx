import React, {useMemo} from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated, {useWorkletCallback} from 'react-native-reanimated';

import DragContext from '@library/context/DragContext';
import DraggedContext from '@library/context/DraggedContext';
import useAnimatedCellStyle from '@library/hooks/useAnimatedCellStyle';
import {ItemOffset} from '@library/types/misc';

interface ReorderableListCellProps {
  index: number;
  startDrag: (index: number) => void;
  draggedIndex: Animated.SharedValue<number>;
  itemOffsets: Animated.SharedValue<ItemOffset>[];
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  // TODO: set type
  item: any;
  extraData: any;
}

const ReorderableListCell: React.FC<ReorderableListCellProps> = ({
  index,
  draggedIndex,
  itemOffsets,
  children,
  startDrag,
  onLayout,
}) => {
  const drag = useWorkletCallback(() => startDrag(index), [index]);
  const draggedContextValue = useMemo(
    () => ({index, draggedIndex}),
    [index, draggedIndex],
  );

  const style = useAnimatedCellStyle({
    index,
    draggedIndex,
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    itemOffsets[index].value = {
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
