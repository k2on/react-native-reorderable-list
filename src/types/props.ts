import {
  FlatListProps,
  ListRenderItemInfo,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface CellProps<T> extends FlatListProps<T> {
  index: number;
  children?: React.ReactElement;
  data: T[];
}

export interface ReorderableListRenderItemInfo<T>
  extends ListRenderItemInfo<T> {
  /**
   * Needs to be called when the drag gesture should be enabled, for example `onLongPress` event.
   */
  drag: () => void;
  /**
   * Becomes `true` when the current item is dragged.
   */
  isDragged: boolean;
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
  | 'renderItem'
  | 'removeClippedSubviews';

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
   * Speed at which the list scrolls when an item is dragged to the scroll areas. Default: `2`.
   */
  autoscrollSpeed?: number;
  /**
   * Size to which an item scales when dragged. Default: `1`.
   */
  dragScale?: number;
  /**
   * Duration of animations in milliseconds. Default: `100`.
   */
  animationDuration?: number;
  /**
   * Renders an item from data into the list.
   * @param info - Provides an item and metadata. Extends ListRenderItemInfo from FlatList.
   */
  renderItem: (info: ReorderableListRenderItemInfo<T>) => React.ReactElement;
  /**
   * Event fired after an item is released and the list is reordered.
   */
  onReorder: (event: ReorderableListReorderEvent) => void;
  /**
   * Event fired at most once per frame during scrolling. Needs to be a ```worklet```. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated/docs/2.2.0/worklets/) for further info.
   */
  onScroll?: (event: NativeScrollEvent) => void;
}
