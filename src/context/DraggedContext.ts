import React from 'react';
import Animated from 'react-native-reanimated';

interface DraggedContextData {
  index: number;
  draggedIndex: Animated.SharedValue<number>;
}

const DraggedContext = React.createContext<DraggedContextData>(
  undefined as any,
);

export default DraggedContext;
