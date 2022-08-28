import React from 'react';
import {ViewProps} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import useDragSharedValue from '@library/hooks/useDragSharedValue';

interface AnimatedScaleOpacityProps extends ViewProps {
  opacity?: number;
  scale?: number;
}

const AnimatedScaleOpacity: React.FC<AnimatedScaleOpacityProps> = ({
  opacity = 0.75,
  scale = 1.025,
  ...rest
}) => {
  const isDragged = useDragSharedValue();

  const style = useAnimatedStyle(() => {
    const dragged = isDragged.value;

    return {
      opacity: withTiming(dragged ? opacity : 1, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      }),
      transform: [
        {
          scale: withTiming(dragged ? scale : 1, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          }),
        },
      ],
    };
  });

  return <Animated.View {...rest} style={[rest.style, style]} />;
};

export default AnimatedScaleOpacity;
