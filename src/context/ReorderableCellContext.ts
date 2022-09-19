import React from 'react';
import Animated from 'react-native-reanimated';

interface ReorderableCellContextData {
  animationDuration: number;
  draggedIndex: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  draggedHeight: Animated.SharedValue<number>;
}

const ReorderableCellContext = React.createContext<
  ReorderableCellContextData | undefined
>(undefined);

export default ReorderableCellContext;
