import React from 'react';
import {ViewProps} from 'react-native';
import Animated, {
  Easing,
  EasingFn,
  EasingFunctionFactory,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import useAnimatedDrag from '@library/hooks/useAnimatedDrag';

export interface AnimatedScaleProps extends ViewProps {
  startScale?: number;
  endScale?: number;
  easingStart?: EasingFn | EasingFunctionFactory;
  easingEnd?: EasingFn | EasingFunctionFactory;
  animationDuration?: number;
}

const AnimatedScale: React.FC<AnimatedScaleProps> = ({
  startScale = 1.025,
  endScale = 1,
  easingStart = Easing.in(Easing.ease),
  easingEnd = Easing.out(Easing.ease),
  animationDuration = 200,
  ...rest
}) => {
  const scale = useSharedValue(endScale);

  useAnimatedDrag(
    {
      onStart: () => {
        'worklet';

        scale.value = withTiming(startScale, {
          easing: easingStart,
          duration: animationDuration,
        });
      },
      onRelease: () => {
        'worklet';

        scale.value = withTiming(endScale, {
          easing: easingEnd,
          duration: animationDuration,
        });
      },
    },
    [startScale, endScale, easingStart, easingEnd],
  );

  const style = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  return <Animated.View {...rest} style={[style, rest.style]} />;
};

export default AnimatedScale;
