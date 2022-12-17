import React from 'react';
import Animated from 'react-native-reanimated';

interface ReorderableListContextData {
  draggedIndex: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  draggedHeight: Animated.SharedValue<number>;
}

const ReorderableListContext = React.createContext<
  ReorderableListContextData | undefined
>(undefined);

export default ReorderableListContext;
