import React, {useCallback, useRef} from 'react';
import {CellRendererProps, FlatList, FlatListProps} from 'react-native';

import {
  NativeViewGestureHandler,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import ReorderableListCell from '../components/ReorderableListCell';
import {AUTOSCROLL_DELAY} from '../consts';
import ReorderableListContext from '../contexts/ReorderableListContext';
import useReorderableList from '../hooks/useReorderableList';
import type {ReorderableListProps} from '../types/props';

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
    keyExtractor,
    extraData,
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
    ({index, children, item, onLayout: onCellLayout}: CellRendererProps<T>) => (
      <ReorderableListCell
        // forces remount of components with key change
        key={keyExtractor ? keyExtractor(item, index) : index}
        item={item}
        extraData={extraData}
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
    [
      itemOffsets,
      startDrag,
      dragged,
      itemsY,
      released,
      duration,
      keyExtractor,
      extraData,
    ],
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
              keyExtractor={keyExtractor}
              extraData={extraData}
              numColumns={1}
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
