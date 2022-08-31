import React from 'react';
import Animated from 'react-native-reanimated';

interface ReorderableCellContextData {
  animationDuration: number;
  draggedHeight: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  itemsY: Animated.SharedValue<number>[];
  dragged: Animated.SharedValue<boolean>[];
}

const ReorderableCellContext = React.createContext<
  ReorderableCellContextData | undefined
>(undefined);

export default ReorderableCellContext;
