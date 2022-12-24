import React, {useRef, useCallback, useMemo} from 'react';
import {
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
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
  useWorkletCallback,
  withDelay,
  runOnUI,
} from 'react-native-reanimated';

import ReorderableListCell from '@library/components/ReorderableListCell';
import useSharedValuesArray from '@library/hooks/useSharedValuesArray';
import ReorderableListContext from '@library/contexts/ReorderableListContext';
import {ItemOffset, ReorderableListState} from '@library/types/misc';
import {CellProps, ReorderableListProps} from '@library/types/props';
import {setForwardedRef} from '@library/utils/setForwardedRef';
import {AUTOSCROLL_INCREMENT, AUTOSCROLL_DELAY} from '@library/consts';

const version = React.version.split('.');
const hasAutomaticBatching =
  version.length > 0 ? parseInt(version[0], 10) >= 18 : false;

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
  const container = useAnimatedRef<Animated.View>();
  const flatList = useAnimatedRef<FlatList>();
  const nativeHandler = useRef<NativeViewGestureHandler>(null);
  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentY = useSharedValue(0);
  const currentTranslationY = useSharedValue(0);
  const containerPositionY = useSharedValue(0);
  const currentScrollOffsetY = useSharedValue(0);
  const dragScrollTranslationY = useSharedValue(0);
  const dragInitialScrollOffsetY = useSharedValue(0);
  const draggedHeight = useSharedValue(0);
  const itemOffsets = useSharedValuesArray<ItemOffset>(
    () => ({length: 0, offset: 0}),
    data.length,
  );
  const topAutoscrollArea = useSharedValue(0);
  const bottomAutoscrollArea = useSharedValue(0);
  const autoscrollTrigger = useSharedValue(-1);
  const lastAutoscrollTrigger = useSharedValue(-1);
  const flatListHeight = useSharedValue(0);
  const itemsY = useSharedValuesArray(() => 0, data.length);
  const currentIndex = useSharedValue(-1);
  const draggedIndex = useSharedValue(-1);
  const dragged = useSharedValuesArray(() => false, data.length);
  const released = useSharedValuesArray(() => false, data.length);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);

  // animation duration as a shared value allows to avoid re-rendering of all cells on value change
  const duration = useSharedValue(animationDuration);
  if (duration.value !== animationDuration) {
    duration.value = animationDuration;
  }

  const listContextValue = useMemo(
    () => ({
      draggedHeight,
      currentIndex,
      draggedIndex,
    }),
    [draggedHeight, currentIndex, draggedIndex],
  );

  const handleGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {startY: number}
  >({
    onStart: (e, ctx) => {
      // prevent new dragging until item is completely released
      if (state.value === ReorderableListState.IDLE) {
        const relativeY =
          e.absoluteY - containerPositionY.value - safeAreaTopInset;

        ctx.startY = relativeY;
        currentY.value = relativeY;
        currentTranslationY.value = e.translationY;
        if (draggedIndex.value >= 0) {
          itemsY[draggedIndex.value].value = e.translationY;
        }
        gestureState.value = e.state;
      }
    },
    onActive: (e, ctx) => {
      if (state.value !== ReorderableListState.RELEASING) {
        currentY.value = ctx.startY + e.translationY;
        currentTranslationY.value = e.translationY;
        if (draggedIndex.value >= 0) {
          itemsY[draggedIndex.value].value =
            e.translationY + dragScrollTranslationY.value;
        }
        gestureState.value = e.state;
      }
    },
    onEnd: (e) => (gestureState.value = e.state),
    onFinish: (e) => (gestureState.value = e.state),
    onCancel: (e) => (gestureState.value = e.state),
    onFail: (e) => (gestureState.value = e.state),
  });

  const setScrollEnabled = useCallback(
    (scrollEnabled: boolean) => {
      flatList.current?.setNativeProps({scrollEnabled});
    },
    [flatList],
  );

  const resetSharedValues = useWorkletCallback(() => {
    const draggedIndexCopy = draggedIndex.value;

    // reset indexes before arrays to avoid triggering animated reactions
    draggedIndex.value = -1;
    // current index is reset on item render for the on end event
    itemsY[draggedIndexCopy].value = 0;
    dragged[draggedIndexCopy].value = false;
    // released flag is reset after release is triggered in the item
    state.value = ReorderableListState.IDLE;
    dragScrollTranslationY.value = 0;
  });

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const updateState = () => {
        onReorder({fromIndex, toIndex});
      };

      if (!hasAutomaticBatching) {
        unstable_batchedUpdates(updateState);
      } else {
        updateState();
      }
    }

    runOnUI(resetSharedValues)();
  };

  const getIndexFromY = useWorkletCallback((y: number) => {
    const relativeY = currentScrollOffsetY.value + y;
    const index = itemOffsets.findIndex(
      (x, i) =>
        (i === 0 && relativeY < x.value.offset) ||
        (i === itemOffsets.length - 1 && relativeY > x.value.offset) ||
        (relativeY >= x.value.offset &&
          relativeY <= x.value.offset + x.value.length),
    );

    return index;
  });

  const setCurrentIndex = useWorkletCallback((y: number) => {
    const newCurrentIndex = getIndexFromY(y);
    if (currentIndex.value !== newCurrentIndex) {
      const relativeY = currentScrollOffsetY.value + y;

      const moveDown = currentIndex.value < newCurrentIndex;
      const index1 = moveDown ? currentIndex.value : newCurrentIndex;
      const index2 = moveDown ? newCurrentIndex : currentIndex.value;
      const offset1 = itemOffsets[index1].value;
      const offset2 = itemOffsets[index2].value;

      const newOffset1 = offset1.offset;
      const newLength1 = offset2.length;
      const newOffset2 = offset2.offset + (offset2.length - offset1.length);
      const newLength2 = offset1.length;

      // if item was dragged into his new hypothetical offsets then swap offests and set new current index
      if (
        (moveDown &&
          relativeY >= newOffset2 &&
          relativeY < newOffset2 + newLength2) ||
        (!moveDown &&
          relativeY >= newOffset1 &&
          relativeY < newOffset1 + newLength1)
      ) {
        itemOffsets[index1].value = {
          offset: newOffset1,
          length: newLength1,
        };
        itemOffsets[index2].value = {
          offset: newOffset2,
          length: newLength2,
        };

        currentIndex.value = newCurrentIndex;
      }
    }
  });

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
        released[draggedIndex.value].value = true;

        // enable back scroll on releasing
        runOnJS(setScrollEnabled)(true);

        // they are actually swapped on drag translation
        const currentOffset = itemOffsets[draggedIndex.value].value;
        const draggedOffset = itemOffsets[currentIndex.value].value;

        const newTopPosition =
          currentIndex.value > draggedIndex.value
            ? draggedOffset.offset - currentOffset.offset
            : draggedOffset.offset -
              currentOffset.offset +
              (draggedOffset.length - currentOffset.length);

        if (itemsY[draggedIndex.value].value !== newTopPosition) {
          // animate dragged item to its new position on release
          itemsY[draggedIndex.value].value = withTiming(
            newTopPosition,
            {
              duration: duration.value,
              easing: Easing.out(Easing.ease),
            },
            () => {
              runOnJS(reorder)(draggedIndex.value, currentIndex.value);
            },
          );
        } else {
          // user might drag and release the item without moving it so,
          // since the animation end callback is not executed in that case
          // we need to reset values as the reorder function would do
          resetSharedValues();
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
        setCurrentIndex(y);

        if (y <= topAutoscrollArea.value || y >= bottomAutoscrollArea.value) {
          if (state.value !== ReorderableListState.AUTO_SCROLL) {
            // trigger autoscroll
            lastAutoscrollTrigger.value = autoscrollTrigger.value;
            autoscrollTrigger.value *= -1;
          }
          state.value = ReorderableListState.AUTO_SCROLL;
        } else {
          state.value = ReorderableListState.DRAGGING;
        }
      }
    },
  );

  useAnimatedReaction(
    () => autoscrollTrigger.value,
    () => {
      if (
        autoscrollTrigger.value !== lastAutoscrollTrigger.value &&
        state.value === ReorderableListState.AUTO_SCROLL
      ) {
        const autoscrollIncrement =
          (currentY.value <= topAutoscrollArea.value
            ? -AUTOSCROLL_INCREMENT
            : AUTOSCROLL_INCREMENT) * autoscrollSpeed;

        if (autoscrollIncrement !== 0) {
          scrollTo(
            flatList,
            0,
            currentScrollOffsetY.value + autoscrollIncrement,
            true,
          );

          lastAutoscrollTrigger.value = autoscrollTrigger.value;
          autoscrollTrigger.value = withDelay(
            autoscrollDelay,
            withTiming(autoscrollTrigger.value * -1, {
              duration: 0,
            }),
          );
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        setCurrentIndex(currentY.value);
      }
    },
  );

  const handleScroll = useAnimatedScrollHandler((e) => {
    currentScrollOffsetY.value = e.contentOffset.y;

    if (state.value === ReorderableListState.AUTO_SCROLL) {
      dragScrollTranslationY.value =
        currentScrollOffsetY.value - dragInitialScrollOffsetY.value;
      itemsY[draggedIndex.value].value =
        currentTranslationY.value + dragScrollTranslationY.value;
    }

    if (onScroll) {
      onScroll(e);
    }
  });

  const startDrag = useWorkletCallback(
    (index: number) => {
      // allow new drag when item is completely released
      if (state.value === ReorderableListState.IDLE) {
        draggedHeight.value = itemOffsets[index].value.length;
        dragged[index].value = true;
        draggedIndex.value = index;
        currentIndex.value = index;
        state.value = ReorderableListState.DRAGGING;
        dragInitialScrollOffsetY.value = currentScrollOffsetY.value;

        runOnJS(setScrollEnabled)(false);
      }
    },
    [setScrollEnabled],
  );

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

  const handleContainerLayout = () => {
    container.current?.measureInWindow((x: number, y: number) => {
      containerPositionY.value = y;
    });
  };

  const handleFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const {height} = e.nativeEvent.layout;
      const area = Math.max(1, Math.min(autoscrollArea, height / 4));

      topAutoscrollArea.value = area;
      bottomAutoscrollArea.value = height - area;

      flatListHeight.value = height;

      if (onLayout) {
        onLayout(e);
      }
    },
    [
      autoscrollArea,
      bottomAutoscrollArea,
      flatListHeight,
      onLayout,
      topAutoscrollArea,
    ],
  );

  const handleRef = (value: FlatList<T>) => {
    setForwardedRef(ref, value);
    setForwardedRef(flatList, value);
  };

  return (
    <ReorderableListContext.Provider value={listContextValue}>
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
