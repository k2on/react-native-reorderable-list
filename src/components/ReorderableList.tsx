import React, {useRef, useCallback, useState} from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  LayoutChangeEvent,
  StatusBar,
  unstable_batchedUpdates,
} from 'react-native';
import {
  PanGestureHandlerGestureEvent,
  NativeViewGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  useAnimatedRef,
  useAnimatedScrollHandler,
  scrollTo,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import composeRefs from '@seznam/compose-react-refs';
import memoize from 'fast-memoize';

import ReorderableListItem from 'components/ReorderableListItem';
import useAnimatedSharedValues from 'hooks/useAnimatedSharedValues';
import {ItemOffset, ReorderableListState} from 'types/misc';
import {CellProps, ReorderableListProps} from 'types/props';

const version = React.version.split('.');
const hasAutomaticBatching =
  version.length > 0 ? parseInt(version[0], 10) >= 18 : false;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref: React.Ref<FlatList<T>>},
) => React.ReactElement;

const ReorderableList = <T,>(
  {
    data,
    containerStyle,
    scrollAreaSize = 0.1,
    scrollSpeed = 2,
    dragScale = 1,
    renderItem,
    onLayout,
    onReorder,
    keyExtractor,
    onScroll,
    ...rest
  }: ReorderableListProps<T>,
  ref: React.ForwardedRef<FlatList<T>>,
) => {
  const container = useAnimatedRef<any>();
  const flatList = useAnimatedRef<any>();
  const nativeHandler = useRef<NativeViewGestureHandler>(null);
  const [dragged, setDragged] = useState(false);
  const animationDuration = 100;

  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentY = useSharedValue(0);
  const containerPositionX = useSharedValue(0);
  const containerPositionY = useSharedValue(0);
  const currentScrollOffsetY = useSharedValue(0);
  const dragScrollTranslationY = useSharedValue(0);
  const dragInitialScrollOffsetY = useSharedValue(0);
  const itemOffsets = useAnimatedSharedValues<ItemOffset>(
    () => ({length: 0, offset: 0}),
    data.length,
  );
  const topAutoScrollZone = useSharedValue(0);
  const bottomAutoScrollZone = useSharedValue(0);
  const flatListHeight = useSharedValue(0);
  const draggedItemY = useSharedValue(0);
  const draggedItemScale = useSharedValue(1);
  // keeps track of the new position of the dragged item
  const currentIndex = useSharedValue(-1);
  // keeps track of the dragged item order
  const draggedIndex = useSharedValue(-1);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);
  const autoScrollOffset = useSharedValue(-1);
  const autoScrollSpeed = useSharedValue(Math.max(0, scrollSpeed));

  const relativeToContainer = (y: number, x: number) => {
    'worklet';

    return {
      y: y - containerPositionY.value - (StatusBar.currentHeight || 0),
      x: x - containerPositionX.value,
    };
  };

  const handleGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {startY: number}
  >({
    onStart: (e, ctx) => {
      // prevent new dragging until item is completely released
      if (state.value !== ReorderableListState.RELEASING) {
        const {y} = relativeToContainer(e.absoluteY, e.absoluteX);

        ctx.startY = y;
        currentY.value = y;
        draggedItemY.value = e.translationY;
        gestureState.value = e.state;
      }
    },
    onActive: (e, ctx) => {
      if (state.value !== ReorderableListState.RELEASING) {
        currentY.value = ctx.startY + e.translationY;
        draggedItemY.value = e.translationY + dragScrollTranslationY.value;
        gestureState.value = e.state;
      }
    },
    onEnd: (e) => (gestureState.value = e.state),
    onFinish: (e) => (gestureState.value = e.state),
    onCancel: (e) => (gestureState.value = e.state),
    onFail: (e) => (gestureState.value = e.state),
  });

  const setDragEnabled = useCallback(
    (enabled: boolean) => {
      flatList.current?.setNativeProps({scrollEnabled: !enabled});
      setDragged(enabled);
    },
    [flatList],
  );

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const updateState = () => {
        onReorder({fromIndex, toIndex});
        setDragEnabled(false);
      };

      if (!hasAutomaticBatching) {
        unstable_batchedUpdates(updateState);
      } else {
        updateState();
      }
    } else {
      setDragEnabled(false);
    }

    draggedIndex.value = -1;
    currentIndex.value = -1;
    draggedItemY.value = 0;
    state.value = ReorderableListState.IDLE;
    dragScrollTranslationY.value = 0;
  };

  const getIndexFromY = (y: number, scrollY?: number) => {
    'worklet';

    const maxOffset = itemOffsets[itemOffsets.length - 1].value;
    const relativeY = Math.max(
      0,
      Math.min(
        (scrollY || currentScrollOffsetY.value) + y,
        maxOffset.offset + maxOffset.length,
      ),
    );

    const index = itemOffsets.findIndex(
      (x, i) =>
        (x.value.offset && i === 0 && relativeY < x.value.offset) ||
        (i === itemOffsets.length - 1 && relativeY > x.value.offset) ||
        (relativeY >= x.value.offset &&
          relativeY <= x.value.offset + x.value.length),
    );

    return {index, relativeY};
  };

  useAnimatedReaction(
    () => gestureState.value,
    () => {
      if (
        gestureState.value !== State.ACTIVE &&
        gestureState.value !== State.BEGAN &&
        (state.value === ReorderableListState.DRAGGING ||
          state.value === ReorderableListState.AUTO_SCROLL)
      ) {
        state.value = ReorderableListState.RELEASING;

        // if items have different heights and the dragged item is moved forward
        // then its new offset position needs to be adjusted
        const offsetCorrection =
          currentIndex.value > draggedIndex.value
            ? itemOffsets[currentIndex.value].value.length -
              itemOffsets[draggedIndex.value].value.length
            : 0;
        const newTopPosition =
          itemOffsets[currentIndex.value].value.offset -
          itemOffsets[draggedIndex.value].value.offset +
          offsetCorrection;

        draggedItemScale.value = withTiming(
          1,
          {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
          },
          () => {
            if (draggedItemY.value === newTopPosition) {
              runOnJS(reorder)(draggedIndex.value, currentIndex.value);
            }
          },
        );

        if (draggedItemY.value !== newTopPosition) {
          // animate dragged item to its new position on release
          draggedItemY.value = withTiming(
            newTopPosition,
            {
              duration: animationDuration,
              easing: Easing.out(Easing.ease),
            },
            () => {
              runOnJS(reorder)(draggedIndex.value, currentIndex.value);
            },
          );
        }
      }
    },
  );

  useAnimatedReaction(
    () => currentY.value,
    (y) => {
      if (
        state.value === ReorderableListState.DRAGGING ||
        state.value === ReorderableListState.AUTO_SCROLL
      ) {
        const {index} = getIndexFromY(y);
        currentIndex.value = index;

        if (y <= topAutoScrollZone.value || y >= bottomAutoScrollZone.value) {
          state.value = ReorderableListState.AUTO_SCROLL;
          autoScrollOffset.value = currentScrollOffsetY.value;
        } else {
          state.value = ReorderableListState.DRAGGING;
          autoScrollOffset.value = -1;
        }
      }
    },
  );

  useAnimatedReaction(
    () => autoScrollOffset.value,
    () => {
      if (state.value === ReorderableListState.AUTO_SCROLL) {
        let speed = 0;
        if (currentY.value <= topAutoScrollZone.value) {
          speed = -autoScrollSpeed.value;
        } else if (currentY.value >= bottomAutoScrollZone.value) {
          speed = autoScrollSpeed.value;
        }

        if (speed !== 0) {
          scrollTo(flatList, 0, autoScrollOffset.value + speed, true);
          autoScrollOffset.value += speed;
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        const {index} = getIndexFromY(currentY.value, autoScrollOffset.value);
        currentIndex.value = index;
      }
    },
  );

  const lastScrollOffsetY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    lastScrollOffsetY.value = currentScrollOffsetY.value;
    currentScrollOffsetY.value = e.contentOffset.y;

    if (state.value === ReorderableListState.AUTO_SCROLL) {
      draggedItemY.value +=
        currentScrollOffsetY.value - lastScrollOffsetY.value;
    }

    dragScrollTranslationY.value =
      state.value === ReorderableListState.AUTO_SCROLL ||
      state.value === ReorderableListState.DRAGGING
        ? currentScrollOffsetY.value - dragInitialScrollOffsetY.value
        : 0;

    if (onScroll) {
      onScroll(e);
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleItemLayout = useCallback(
    memoize((index: number) => (e: LayoutChangeEvent) => {
      itemOffsets[index].value = {
        offset: e.nativeEvent.layout.y,
        length: e.nativeEvent.layout.height,
      };
    }),
    [itemOffsets],
  );

  const startDrag = useCallback(
    (index: number) => {
      'worklet';

      draggedIndex.value = index;
      currentIndex.value = index;
      state.value = ReorderableListState.DRAGGING;
      dragInitialScrollOffsetY.value = currentScrollOffsetY.value;

      draggedItemScale.value = withTiming(dragScale, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      });

      runOnJS(setDragEnabled)(true);
    },
    [
      draggedIndex,
      currentIndex,
      state,
      dragScale,
      draggedItemScale,
      dragInitialScrollOffsetY,
      currentScrollOffsetY,
      setDragEnabled,
    ],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drag = useCallback(
    memoize((index: number) => () => runOnUI(startDrag)(index)),
    [startDrag],
  );

  const renderAnimatedCell = useCallback(
    ({index, children, ...cellProps}: CellProps<T>) => (
      <ReorderableListItem
        // forces remount of components with key change
        key={
          cellProps.keyExtractor
            ? cellProps.keyExtractor(cellProps.data[index], index)
            : index
        }
        index={index}
        currentIndex={currentIndex}
        draggedIndex={draggedIndex}
        itemOffsets={itemOffsets}
        draggedItemY={draggedItemY}
        draggedItemScale={draggedItemScale}
        onLayout={handleItemLayout(index)}>
        {children}
      </ReorderableListItem>
    ),
    [
      currentIndex,
      draggedIndex,
      itemOffsets,
      draggedItemY,
      draggedItemScale,
      handleItemLayout,
    ],
  );

  const renderDraggableItem = useCallback(
    (info: ListRenderItemInfo<T>) =>
      renderItem({
        ...info,
        drag: drag(info.index),
        isDragged: dragged && draggedIndex.value === info.index,
      }),
    [renderItem, drag, dragged, draggedIndex],
  );

  const handleContainerLayout = () => {
    container.current?.measureInWindow((x: number, y: number) => {
      containerPositionX.value = x;
      containerPositionY.value = y;
    });
  };

  const handleFlatListLayout = (e: LayoutChangeEvent) => {
    const {height} = e.nativeEvent.layout;
    const portion = height * Math.max(0, Math.min(scrollAreaSize, 0.5));

    topAutoScrollZone.value = portion;
    bottomAutoScrollZone.value = height - portion;

    flatListHeight.value = height;

    if (onLayout) {
      onLayout(e);
    }
  };

  return (
    <PanGestureHandler
      maxPointers={1}
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureEvent}
      simultaneousHandlers={nativeHandler}>
      <Animated.View
        ref={container}
        style={containerStyle}
        onLayout={handleContainerLayout}>
        <NativeViewGestureHandler ref={nativeHandler}>
          <AnimatedFlatList
            {...rest}
            ref={composeRefs(flatList, ref)}
            data={data}
            CellRendererComponent={renderAnimatedCell}
            renderItem={renderDraggableItem}
            onLayout={handleFlatListLayout}
            onScroll={scrollHandler}
            keyExtractor={keyExtractor}
            scrollEventThrottle={1}
            horizontal={false}
            removeClippedSubviews={false}
          />
        </NativeViewGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default React.memo(React.forwardRef(ReorderableList)) as <T>(
  props: ReorderableListProps<T> & {ref?: React.ForwardedRef<FlatListProps<T>>},
) => React.ReactElement;
