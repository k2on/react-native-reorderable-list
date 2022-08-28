import React, {useMemo} from 'react';
import {LayoutChangeEvent} from 'react-native';
import Animated, {useWorkletCallback} from 'react-native-reanimated';

import ScaleOpacityCell from '@library/components/ScaleOpacityCell';
import {DragContext} from '@library/hooks/useDragHandler';
import {DraggedContext} from '@library/hooks/useDragSharedValue';
import {ItemOffset} from '@library/types/misc';

interface ReorderableListCellProps {
  index: number;
  CellRendererComponent: React.ComponentType<any> | undefined;
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
  CellRendererComponent,
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

  const handleLayout = (e: LayoutChangeEvent) => {
    itemOffsets[index].value = {
      offset: e.nativeEvent.layout.y,
      length: e.nativeEvent.layout.height,
    };

    if (onLayout) {
      onLayout(e);
    }
  };

  const CellRenderer = CellRendererComponent || ScaleOpacityCell;

  return (
    <DragContext.Provider value={drag}>
      <DraggedContext.Provider value={draggedContextValue}>
        <CellRenderer onLayout={handleLayout} children={children} />
      </DraggedContext.Provider>
    </DragContext.Provider>
  );
};

export default React.memo(
  ReorderableListCell,
  (prev, next) => prev.item === next.item && prev.extraData === next.extraData,
);
