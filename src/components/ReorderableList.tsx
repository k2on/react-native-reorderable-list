import React, {useRef, useCallback} from 'react';
import {FlatList, FlatListProps} from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import ReorderableListCell from '@library/components/ReorderableListCell';
import ReorderableListContext from '@library/contexts/ReorderableListContext';
import {CellProps, ReorderableListProps} from '@library/types/props';
import {AUTOSCROLL_DELAY} from '@library/consts';
import useReorderableList from '@library/hooks/useReorderableList';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref?: React.Ref<FlatList<T>>},
) => React.ReactElement;

const ReorderableList = <T,>(
  {
    data,
    containerStyle,
    safeAreaTopInset = 0,
    autoscrollArea = 50,
    autoscrollSpeed = 1,
    autoscrollDelay = AUTOSCROLL_DELAY,
    animationDuration = 200,
    onLayout,
    onReorder,
    onScroll,
    ...rest
  }: ReorderableListProps<T>,
  ref: React.ForwardedRef<FlatList<T>>,
) => {
  const nativeHandler = useRef<NativeViewGestureHandler>(null);
  const {
    handleGestureEvent,
    handleScroll,
    handleContainerLayout,
    handleFlatListLayout,
    handleRef,
    startDrag,
    containerRef,
    listContextValue,
    itemOffsets,
    dragged,
    itemsY,
    released,
    duration,
  } = useReorderableList({
    ref,
    data,
    safeAreaTopInset,
    autoscrollArea,
    autoscrollSpeed,
    autoscrollDelay,
    animationDuration,
    onLayout,
    onReorder,
    onScroll,
  });

  const renderAnimatedCell = useCallback(
    ({
      index,
      children,
      item,
      onLayout: onCellLayout,
      parentProps,
      keyExtractor,
    }: CellProps<T>) => (
      <ReorderableListCell
        // forces remount of components with key change
        key={keyExtractor ? keyExtractor(item, index) : index}
        item={item}
        extraData={parentProps?.extraData}
        index={index}
        itemOffset={itemOffsets[index]}
        dragY={itemsY[index]}
        itemDragged={dragged[index]}
        itemReleased={released[index]}
        animationDuration={duration}
        startDrag={startDrag}
        children={children}
        onLayout={onCellLayout}
      />
    ),
    [itemOffsets, startDrag, dragged, itemsY, released, duration],
  );

  return (
    <ReorderableListContext.Provider value={listContextValue}>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureEvent}
        simultaneousHandlers={nativeHandler}>
        <Animated.View
          ref={containerRef}
          style={containerStyle}
          onLayout={handleContainerLayout}>
          <NativeViewGestureHandler ref={nativeHandler}>
            <AnimatedFlatList
              {...rest}
              ref={handleRef}
              data={data}
              CellRendererComponent={renderAnimatedCell}
              onLayout={handleFlatListLayout}
              onScroll={handleScroll}
              scrollEventThrottle={1}
              horizontal={false}
              removeClippedSubviews={false}
            />
          </NativeViewGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </ReorderableListContext.Provider>
  );
};

export default React.memo(React.forwardRef(ReorderableList)) as <T>(
  props: ReorderableListProps<T> & {
    ref?: React.ForwardedRef<FlatListProps<T>>;
  },
) => React.ReactElement;
