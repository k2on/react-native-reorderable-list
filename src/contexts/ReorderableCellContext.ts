import React from 'react';

import type Animated from 'react-native-reanimated';

interface ReorderableCellContextData {
  index: number;
  dragHandler: () => void;
  dragged: Animated.SharedValue<boolean>;
  released: Animated.SharedValue<boolean>;
}

const ReorderableCellContext = React.createContext<
  ReorderableCellContextData | undefined
>(undefined);

export default ReorderableCellContext;
