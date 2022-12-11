import React, {useRef, useCallback, useMemo} from 'react';
import {
  View,
  FlatList,
  FlatListProps,
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
  useWorkletCallback,
  withDelay,
} from 'react-native-reanimated';

import ReorderableListCell from '@library/components/ReorderableListCell';
import useSharedValuesArray from '@library/hooks/useSharedValuesArray';
import ReorderableListContext from '@library/contexts/ReorderableListContext';
import {ItemOffset, ReorderableListState} from '@library/types/misc';
import {CellProps, ReorderableListProps} from '@library/types/props';
import {setForwardedRef} from '@library/utils/setForwardedRef';
import {AUTOSCROLL_INCREMENT, AUTOSCROLL_DELAY} from '@library/consts';
import HandlersContext, {
  Handlers,
  RemoveHandlersFunc,
  SetHandlersFunc,
} from '@library/contexts/HandlersContext';

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
    autoscrollArea = 0.1,
    autoscrollSpeed = 1,
    animationDuration = 100,
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
  const containerPositionX = useSharedValue(0);
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
  const animatedScrollOffset = useSharedValue(0);
  const lastAutoscrollTrigger = useSharedValue(-1);
  const flatListHeight = useSharedValue(0);
  const itemsY = useSharedValuesArray(() => 0, data.length);
  const currentIndex = useSharedValue(-1);
  const draggedIndex = useSharedValue(-1);
  const dragged = useSharedValuesArray(() => false, data.length);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);
  const itemHandlers = useSharedValuesArray<(Handlers | undefined)[]>(
    () => [],
    data.length,
  );

  const listContextValue = useMemo(
    () => ({
      animationDuration,
      draggedHeight,
      currentIndex,
      draggedIndex,
    }),
    [animationDuration, draggedHeight, currentIndex, draggedIndex],
  );

  const setHandlers: SetHandlersFunc = useCallback(
    (index, handlers) => {
      itemHandlers[index].value = [...itemHandlers[index].value, handlers];
      return itemHandlers[index].value.length;
    },
    [itemHandlers],
  );
  const removeHandlers: RemoveHandlersFunc = useCallback(
    (index, handlersRef) => {
      itemHandlers[index].value[handlersRef] = undefined;
    },
    [itemHandlers],
  );
  const handlersContextValue = useMemo(
    () => ({setHandlers, removeHandlers}),
    [setHandlers, removeHandlers],
  );

  const handleGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {startY: number}
  >({
    onStart: (e, ctx) => {
      // prevent new dragging until item is completely released
      if (state.value !== ReorderableListState.RELEASING) {
        const relativeY =
          e.absoluteY -
          containerPositionY.value -
          (StatusBar.currentHeight || 0);

        ctx.startY = relativeY;
        currentY.value = relativeY;
        if (draggedIndex.value >= 0) {
          itemsY[draggedIndex.value].value = e.translationY;
        }
        gestureState.value = e.state;
      }
    },
    onActive: (e, ctx) => {
      if (state.value !== ReorderableListState.RELEASING) {
        currentY.value = ctx.startY + e.translationY;
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

  const setScrollEnabled = useCallback((scrollEnabled: boolean) => {
    flatList.current?.setNativeProps({scrollEnabled});
  }, []);

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      const updateState = () => {
        onReorder({fromIndex, toIndex});
        setScrollEnabled(true);
      };

      if (!hasAutomaticBatching) {
        unstable_batchedUpdates(updateState);
      } else {
        updateState();
      }
    } else {
      setScrollEnabled(true);
    }

    const draggedIndexCopy = draggedIndex.value;

    // reset indexes before arrays to avoid triggering animated reactions
    draggedIndex.value = -1;
    currentIndex.value = -1;
    itemsY[draggedIndexCopy].value = 0;
    dragged[draggedIndexCopy].value = false;
    state.value = ReorderableListState.IDLE;
    dragScrollTranslationY.value = 0;

    // call on end handlers
    itemHandlers[draggedIndexCopy].value.forEach((x) => x?.end());
  };

  const getIndexFromY = useWorkletCallback((y: number, scrollY?: number) => {
    const relativeY = (scrollY || currentScrollOffsetY.value) + y;
    const index = itemOffsets.findIndex(
      (x, i) =>
        (i === 0 && relativeY < x.value.offset) ||
        (i === itemOffsets.length - 1 && relativeY > x.value.offset) ||
        (relativeY >= x.value.offset &&
          relativeY <= x.value.offset + x.value.length),
    );

    return index;
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
        const currentOffset = itemOffsets[currentIndex.value].value;
        const draggedOffset = itemOffsets[draggedIndex.value].value;

        state.value = ReorderableListState.RELEASING;

        // call on release handlers
        itemHandlers[draggedIndex.value].value.forEach((x) => x?.release());

        // if items have different heights and the dragged item is moved forward
        // then its new offset position needs to be adjusted
        const offsetCorrection =
          currentIndex.value > draggedIndex.value
            ? currentOffset.length - draggedOffset.length
            : 0;
        const newTopPosition =
          currentOffset.offset - draggedOffset.offset + offsetCorrection;

        // animate dragged item to its new position on release
        itemsY[draggedIndex.value].value = withTiming(
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
    },
  );

  useAnimatedReaction(
    () => currentY.value,
    (y) => {
      if (
        state.value === ReorderableListState.DRAGGING ||
        state.value === ReorderableListState.AUTO_SCROLL
      ) {
        const index = getIndexFromY(y);
        currentIndex.value = index;

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
          const newScrollOffset =
            animatedScrollOffset.value + autoscrollIncrement;
          animatedScrollOffset.value = newScrollOffset;
          // TODO: Fix type
          scrollTo(flatList as any, 0, newScrollOffset, true);

          lastAutoscrollTrigger.value = autoscrollTrigger.value;
          autoscrollTrigger.value = withDelay(
            AUTOSCROLL_DELAY,
            withTiming(autoscrollTrigger.value * -1, {
              duration: 0,
            }),
          );
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        const index = getIndexFromY(currentY.value, currentScrollOffsetY.value);
        currentIndex.value = index;
      }
    },
  );

  const handleScroll = useAnimatedScrollHandler((e) => {
    currentScrollOffsetY.value = e.contentOffset.y;

    if (state.value === ReorderableListState.AUTO_SCROLL) {
      dragScrollTranslationY.value =
        currentScrollOffsetY.value - dragInitialScrollOffsetY.value;
    }

    if (onScroll) {
      onScroll(e);
    }
  });

  const startDrag = useWorkletCallback(
    (index: number) => {
      draggedHeight.value = itemOffsets[index].value.length;
      dragged[index].value = true;
      draggedIndex.value = index;
      currentIndex.value = index;
      state.value = ReorderableListState.DRAGGING;
      dragInitialScrollOffsetY.value = currentScrollOffsetY.value;

      // call on start drag handlers
      itemHandlers[index].value.forEach((x) => x?.start());

      runOnJS(setScrollEnabled)(false);
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
        startDrag={startDrag}
        children={children}
        onLayout={onCellLayout}
      />
    ),
    [draggedIndex, itemOffsets, startDrag],
  );

  const handleContainerLayout = () => {
    // TODO: fix type
    (container.current as unknown as View)?.measureInWindow(
      (x: number, y: number) => {
        containerPositionX.value = x;
        containerPositionY.value = y;
      },
    );
  };

  const handleFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const {height} = e.nativeEvent.layout;
      const area = height * Math.max(0, Math.min(autoscrollArea, 0.5));

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
      <HandlersContext.Provider value={handlersContextValue}>
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
      </HandlersContext.Provider>
    </ReorderableListContext.Provider>
  );
};

export default React.memo(React.forwardRef(ReorderableList)) as <T>(
  props: ReorderableListProps<T> & {
    ref?: React.ForwardedRef<FlatListProps<T>>;
  },
) => React.ReactElement;
