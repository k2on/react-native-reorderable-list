import React from 'react';
import {ViewProps} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import useDragSharedValue from '@library/hooks/useDragSharedValue';
import useReorderableCell from '@library/hooks/useReorderableCell';

interface AnimatedOpacityCellProps extends ViewProps {
  opacity?: number;
  scale?: number;
}

const ScaleOpacityCell: React.FC<AnimatedOpacityCellProps> = ({
  opacity = 0.75,
  scale = 1.025,
  ...rest
}) => {
  const {animationDuration, zIndex, dragY, positionY} = useReorderableCell();
  const isDragged = useDragSharedValue();

  const style = useAnimatedStyle(() => {
    const dragged = isDragged.value;

    return {
      opacity: withTiming(dragged ? opacity : 1, {
        duration: animationDuration,
        easing: Easing.out(Easing.ease),
      }),
      zIndex: zIndex.value,
      transform: [
        {translateY: dragY.value},
        {translateY: positionY.value},
        {
          scale: withTiming(dragged ? scale : 1, {
            duration: animationDuration,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  return <Animated.View {...rest} style={[rest.style, style]} />;
};

export default ScaleOpacityCell;
