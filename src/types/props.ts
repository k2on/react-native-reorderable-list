import {
  FlatListProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface CellProps<T> {
  index: number;
  children?: React.ReactElement;
  item: T;
  onLayout: (e: LayoutChangeEvent) => void;
  parentProps: FlatListProps<T>;
  keyExtractor?: (item: T, index: number) => string;
}
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
  | 'CellRendererComponent';

export interface ReorderableListProps<T>
  extends Omit<FlatListProps<T>, OmittedProps> {
  data: T[];
  /**
   * Style of the FlatList container.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Area at the extremeties of the list which triggers scrolling when an item is dragged. Accepts a value between `0` and `0.5`. Default: `0.1`.
   */
  autoscrollArea?: number;
  /**
   * Speed at which the list scrolls when an item is dragged to the scroll areas. Default: `1`.
   */
  autoscrollSpeed?: number;
  /**
   * Duration of animations in milliseconds. Default: `200`.
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
