import type {FlatListProps, NativeScrollEvent, ViewProps} from 'react-native';

import type Animated from 'react-native-reanimated';

export interface ReorderableListReorderEvent {
  /**
   * Index of the dragged item.
   */
  fromIndex: number;
  /**
   * Index where the dragged item was released.
   */
  toIndex: number;
}

type OmittedProps =
  | 'horizontal'
  | 'onScroll'
  | 'scrollEventThrottle'
  | 'removeClippedSubviews'
  | 'CellRendererComponent'
  | 'numColumns';

export interface ReorderableListProps<T>
  extends Omit<FlatListProps<T>, OmittedProps> {
  data: T[];
  /**
   * Safe area top inset. Default: `0`.
   */
  safeAreaTopInset?: number;
  /**
   * Area in pixel (density-independent) at the extremety of the list which triggers autoscroll when an item is dragged to it.
   * Min value: `1`. Max value accepted is 25% of the list height. Default: `50`.
   */
  autoscrollArea?: number;
  /**
   * Speed at which the list scrolls when an item is dragged to the scroll areas. Default: `1`.
   */
  autoscrollSpeed?: number;
  /**
   * Delay in between autoscroll triggers. Can be used to tune the autoscroll smoothness.
   * Default Android: `0`.
   * Default iOS: `250`.
   */
  autoscrollDelay?: number;
  /**
   * Duration of the animations in milliseconds.
   * Be aware that users won't be able to drag a new item until the dragged item is released and
   * its animation to its new position ends.
   * Default: `200`.
   */
  animationDuration?: number;
  /**
   * Event fired after an item is released and the list is reordered.
   */
  onReorder: (event: ReorderableListReorderEvent) => void;
  /**
   * Event fired at most once per frame during scrolling. Needs to be a ```worklet```. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated/docs/2.2.0/worklets/) for further info.
   */
  onScroll?: (event: NativeScrollEvent) => void;
}

export interface ReorderableAnimationOptions {
  /**
   * Value of the animated style on drag end.
   */
  enabled: boolean;
  /**
   * Value of the animated style on drag end.
   */
  valueDragEnd: number;
  /**
   * Value of the animate style on drag start.
   */
  valueDragStart: number;
  /**
   * Easing function for the animation to the end value. Default: `Easing.in(Easing.ease)`.
   */
  easingDragEnd?: Animated.EasingFunction;
  /**
   * Easing function for the animation to the start value. Default: `Easing.out(Easing.ease)`.
   */
  easingDragStart?: Animated.EasingFunction;
  /**
   * Duration of the animations in milliseconds. Default: `200`.
   */
  duration?: number;
}

export interface ReorderableAnimationProps extends ViewProps {
  /**
   * Options for `opacity` animation. Enabled by default with custom default options.
   */
  opacityOptions?: ReorderableAnimationOptions;
  /**
   * Options for `scale` animation. Enabled by default with custom default options.
   */
  scaleOptions?: ReorderableAnimationOptions;
}
