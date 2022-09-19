import React from 'react';
import Animated from 'react-native-reanimated';

interface DraggedContextData {
  index: number;
}

const DraggedContext = React.createContext<DraggedContextData | undefined>(
  undefined,
);

export default DraggedContext;
